// @ts-nocheck
import { sequelize } from '../config/database';
import { Cidadao } from '../models/Cidadao';
import { decrypt } from '../utils/encryption';
import bcrypt from 'bcrypt';

async function updateUserPassword() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco de dados');

        const cpfProcurado = '00895399318';

        // Find all cidadaos and decrypt CPFs to find the user
        const cidadaos = await Cidadao.findAll();

        let cidadao = null;
        for (const c of cidadaos) {
            try {
                const decryptedCPF = decrypt(c.cpf);
                if (decryptedCPF === cpfProcurado) {
                    cidadao = c;
                    break;
                }
            } catch (error) {
                continue;
            }
        }

        if (!cidadao) {
            console.log(`❌ Usuário com CPF ${cpfProcurado} não encontrado!`);
            process.exit(1);
        }

        // Hash the password
        const senhaHash = await bcrypt.hash('12345678', 10);

        // Update user with hashed password
        await cidadao.update({ senha: senhaHash });

        console.log('\n✅ Senha atualizada com sucesso!');
        console.log('\n📋 Credenciais:');
        console.log(`   CPF: ${cpfProcurado}`);
        console.log('   Senha: 12345678');
        console.log(`   Nome: ${cidadao.nome_completo}`);
        console.log(`   Email: ${cidadao.email}`);
        console.log('\n💡 Use essas credenciais para fazer login\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao atualizar senha:', error);
        process.exit(1);
    }
}

updateUserPassword();
