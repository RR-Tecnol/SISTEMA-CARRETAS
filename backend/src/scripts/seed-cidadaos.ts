// Script para criar 10 cidadãos de teste
import { sequelize } from '../config/database';
import { Cidadao } from '../models/Cidadao';
import bcrypt from 'bcryptjs';

async function seedCidadaos() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco de dados\n');

        console.log('👥 Criando Cidadãos de Teste...');

        // Senha padrão para todos os cidadãos de teste
        const senhaHash = await bcrypt.hash('senha123', 10);

        const cidadaos = await Cidadao.bulkCreate([
            {
                cpf: '12345678901',
                nome_completo: 'João da Silva Santos',
                data_nascimento: new Date('1985-03-15'),
                telefone: '(83) 98765-4321',
                email: 'joao.silva@email.com',
                senha: senhaHash,
                municipio: 'João Pessoa',
                estado: 'PB',
                consentimento_lgpd: true,
                ativo: true,
            },
            {
                cpf: '23456789012',
                nome_completo: 'Maria Oliveira Costa',
                data_nascimento: new Date('1990-07-22'),
                telefone: '(83) 99876-5432',
                email: 'maria.oliveira@email.com',
                senha: senhaHash,
                municipio: 'Campina Grande',
                estado: 'PB',
                consentimento_lgpd: true,
                ativo: true,
            },
            {
                cpf: '34567890123',
                nome_completo: 'Pedro Henrique Alves',
                data_nascimento: new Date('1988-11-30'),
                telefone: '(83) 98123-4567',
                email: 'pedro.alves@email.com',
                senha: senhaHash,
                municipio: 'Patos',
                estado: 'PB',
                consentimento_lgpd: true,
                ativo: true,
            },
            {
                cpf: '45678901234',
                nome_completo: 'Ana Carolina Ferreira',
                data_nascimento: new Date('1995-05-18'),
                telefone: '(83) 99234-5678',
                email: 'ana.ferreira@email.com',
                senha: senhaHash,
                municipio: 'Cajazeiras',
                estado: 'PB',
                consentimento_lgpd: true,
                ativo: true,
            },
            {
                cpf: '56789012345',
                nome_completo: 'Carlos Eduardo Mendes',
                data_nascimento: new Date('1982-09-25'),
                telefone: '(83) 98345-6789',
                email: 'carlos.mendes@email.com',
                senha: senhaHash,
                municipio: 'Sousa',
                estado: 'PB',
                consentimento_lgpd: true,
                ativo: true,
            },
            {
                cpf: '67890123456',
                nome_completo: 'Juliana Santos Lima',
                data_nascimento: new Date('1992-12-08'),
                telefone: '(83) 99456-7890',
                email: 'juliana.lima@email.com',
                senha: senhaHash,
                municipio: 'João Pessoa',
                estado: 'PB',
                consentimento_lgpd: true,
                ativo: true,
            },
            {
                cpf: '78901234567',
                nome_completo: 'Roberto Carlos Souza',
                data_nascimento: new Date('1978-04-12'),
                telefone: '(83) 98567-8901',
                email: 'roberto.souza@email.com',
                senha: senhaHash,
                municipio: 'Campina Grande',
                estado: 'PB',
                consentimento_lgpd: true,
                ativo: true,
            },
            {
                cpf: '89012345678',
                nome_completo: 'Fernanda Cristina Rocha',
                data_nascimento: new Date('1987-08-20'),
                telefone: '(83) 99678-9012',
                email: 'fernanda.rocha@email.com',
                senha: senhaHash,
                municipio: 'Patos',
                estado: 'PB',
                consentimento_lgpd: true,
                ativo: true,
            },
            {
                cpf: '90123456789',
                nome_completo: 'Lucas Gabriel Martins',
                data_nascimento: new Date('1998-01-14'),
                telefone: '(83) 98789-0123',
                email: 'lucas.martins@email.com',
                senha: senhaHash,
                municipio: 'João Pessoa',
                estado: 'PB',
                consentimento_lgpd: true,
                ativo: true,
            },
            {
                cpf: '01234567890',
                nome_completo: 'Beatriz Almeida Pereira',
                data_nascimento: new Date('1993-06-28'),
                telefone: '(83) 99890-1234',
                email: 'beatriz.pereira@email.com',
                senha: senhaHash,
                municipio: 'Cajazeiras',
                estado: 'PB',
                consentimento_lgpd: true,
                ativo: true,
            },
        ]);

        console.log(`✅ ${cidadaos.length} cidadãos criados com sucesso!\n`);
        console.log('📋 Credenciais de acesso:');
        console.log('   CPF: qualquer um dos CPFs acima (ex: 12345678901)');
        console.log('   Senha: senha123\n');

        console.log('📝 Lista de Cidadãos Criados:');
        cidadaos.forEach((cidadao, index) => {
            console.log(`   ${index + 1}. ${cidadao.nome_completo} - CPF: ${cidadao.cpf} - ${cidadao.municipio}/${cidadao.estado}`);
        });

        await sequelize.close();
        console.log('\n✅ Processo concluído!');
    } catch (error) {
        console.error('❌ Erro ao criar cidadãos:', error);
        process.exit(1);
    }
}

seedCidadaos();
