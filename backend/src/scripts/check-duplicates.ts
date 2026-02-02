
import { sequelize } from '../config/database';
import { Cidadao } from '../models/Cidadao';
import fs from 'fs';

async function checkDuplicates() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        const emails = await Cidadao.findAll({
            attributes: ['email', [sequelize.fn('COUNT', sequelize.col('email')), 'count']],
            group: ['email'],
            having: sequelize.literal('COUNT(email) > 1')
        });

        let output = '';
        if (emails.length > 0) {
            output += '⚠️ CONFLITOS DE E-MAIL ENCONTRADOS:\n';
            console.log('⚠️ CONFLITOS DE E-MAIL ENCONTRADOS:');
            for (const e of emails) {
                const email = (e as any).email;
                output += `\n📧 Email: ${email}\n`;
                const users = await Cidadao.findAll({ where: { email } });
                for (const u of users) {
                    let cpf = u.cpf;
                    try {
                        cpf = u.getCPFDecrypted();
                    } catch (err) { cpf = 'Erro ao descriptografar'; }
                    const line = `   - Nome: ${u.nome_completo} | CPF: ${cpf} | ID: ${u.id}\n`;
                    output += line;
                    console.log(line);
                }
            }
        } else {
            output += '✅ Nenhum email duplicado encontrado.\n';
            console.log('✅ Nenhum email duplicado encontrado.');
        }

        fs.writeFileSync('duplicates.txt', output);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkDuplicates();
