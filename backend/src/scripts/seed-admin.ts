import { sequelize } from '../config/database';
import { Cidadao } from '../models/Cidadao';
import { encrypt } from '../utils/encryption';
import bcrypt from 'bcrypt';

async function seedAdmin() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco de dados');

        // CPF de teste: 123.456.789-09 (CPF válido de teste)
        const cpfLimpo = '12345678909';
        const cpfCriptografado = encrypt(cpfLimpo);

        // Verifica se já existe
        const adminExistente = await Cidadao.findOne({
            where: { cpf: cpfCriptografado }
        });

        if (adminExistente) {
            console.log('⚠️  Usuário admin já existe no banco de dados!');
            console.log('📋 CPF: 123.456.789-09');
            process.exit(0);
        }

        // Hash da senha
        const senhaHash = await bcrypt.hash('12345678', 10);

        // Cria o usuário admin
        await Cidadao.create({
            cpf: cpfCriptografado,
            nome_completo: 'Administrador do Sistema',
            data_nascimento: new Date('1990-01-01'),
            telefone: '(83) 99999-9999',
            email: 'admin@sistemacarretas.com.br',
            senha: senhaHash,
            municipio: 'João Pessoa',
            estado: 'PB',
            consentimento_lgpd: true,
            data_consentimento: new Date(),
            ip_consentimento: '127.0.0.1',
            campos_customizados: {
                tipo_usuario: 'admin', // Identificador para uso futuro
            }
        } as any);

        console.log('\n✅ Usuário administrador criado com sucesso!');
        console.log('\n📋 Credenciais de acesso:');
        console.log('   CPF: 123.456.789-09');
        console.log('   Senha: 12345678');
        console.log('   Nome: Administrador do Sistema');
        console.log('   Email: admin@sistemacarretas.com.br');
        console.log('\n💡 Use essas credenciais para fazer login no sistema');
        console.log('   Endpoint de login: POST /api/auth/login');
        console.log('   Body: { "cpf": "123.456.789-09", "senha": "12345678" }');
        console.log('\n⚠️  ATENÇÃO: Este é um usuário de TESTE apenas!');
        console.log('   Em produção, use credenciais seguras e configure permissões adequadas.\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao criar usuário admin:', error);
        process.exit(1);
    }
}

// Executa o seed
seedAdmin();
