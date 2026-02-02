// @ts-nocheck
import { sequelize } from '../config/database';
import { Cidadao } from '../models/Cidadao';
import bcrypt from 'bcrypt';
import { decrypt } from '../utils/encryption';

async function checkIntegrity() {
    try {
        await sequelize.authenticate();
        console.log('✅ DB Conectado');

        // Check user 999
        let cidadao = null;
        const cidadaos = await Cidadao.findAll();

        console.log(`🔍 Total usuários: ${cidadaos.length}`);

        for (const c of cidadaos) {
            try {
                // Decrypt CPF to find our guy '99999999999'
                const dec = decrypt(c.cpf);
                if (dec.replace(/\D/g, '') === '99999999999') {
                    cidadao = c;
                    break;
                }
            } catch (e) { }
        }

        if (!cidadao) {
            console.log('❌ Usuário 999 não encontrado por CPF');
            // Try to find by email
            const byEmail = await Cidadao.findOne({ where: { email: 'teste.cidadao@example.com' } });
            if (byEmail) {
                console.log('✅ Achado por email!');
                try {
                    console.log('CPF descriptografado:', decrypt(byEmail.cpf));
                } catch (e) { console.log('Erro decrypt cpf'); }
                cidadao = byEmail;
            } else {
                console.log('❌ Nem por email.');
                process.exit(1);
            }
        } else {
            console.log('✅ Usuário encontrado por CPF.');
        }

        console.log('--- Diagnóstico de Senha ---');
        console.log('Senha salva:', cidadao.senha);

        const testPass = '12345678';
        console.log(`Comparando com '${testPass}'...`);

        const match = await bcrypt.compare(testPass, cidadao.senha);
        console.log('Resultado bcrypt.compare:', match);

        if (match) {
            console.log('✅ A senha no banco ESTÁ CORRETA e válida. O problema é possivelmente no input da API.');
        } else {
            console.log('❌ A senha no banco NÃO bate com a string de teste.');

            // Generate new hash manually here
            const freshHash = await bcrypt.hash(testPass, 10);
            console.log('Teste local - Novo hash:', freshHash);
            console.log('Teste local - Compare:', await bcrypt.compare(testPass, freshHash));
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkIntegrity();
