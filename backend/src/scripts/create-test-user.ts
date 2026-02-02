// @ts-nocheck
import { sequelize } from '../config/database';
import { Cidadao } from '../models/Cidadao';
import { encrypt } from '../utils/encryption';
import bcrypt from 'bcrypt';

async function createTestUser() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco de dados');

        const testCpf = '99999999999';
        const testPass = '12345678';

        // Check if exists
        const cidadaos = await Cidadao.findAll();
        let exists = false;

        // Simple search (decrypting all is expensive but safe for script)
        // ... actually let's just create a new one with random-ish CPF if needed, 
        // but let's try to overwrite or create this specific one.

        // Better: Just create a new entry with unique email/cpf
        const email = 'teste.cidadao@example.com';

        // Encrypt CPF
        const cpfEncrypted = encrypt(testCpf);
        const senhaHash = await bcrypt.hash(testPass, 10);

        // Delete if email exists to avoid conflict
        await Cidadao.destroy({ where: { email } });

        const novoCidadao = await Cidadao.create({
            nome_completo: 'Teste Cidadão Garantido',
            cpf: cpfEncrypted,
            data_nascimento: '1990-01-01',
            telefone: '(11) 99999-9999',
            email: email,
            municipio: 'São Paulo',
            estado: 'SP',
            consentimento_lgpd: true,
            data_consentimento: new Date(),
            senha: senhaHash
        });

        console.log('\n=============================================');
        console.log(`✅ Usuário de Teste Criado!`);
        console.log(`👤 Nome: Teste Cidadão Garantido`);
        console.log(`📄 CPF: ${testCpf} (use este para logar)`);
        console.log(`🔑 Senha: ${testPass}`);
        console.log(`📧 Email: ${email}`);
        console.log('=============================================\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Erro ao criar usuário de teste:', error);
        process.exit(1);
    }
}

createTestUser();
