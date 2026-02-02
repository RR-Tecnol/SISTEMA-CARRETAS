// @ts-nocheck
import { sequelize } from '../config/database';
import { Cidadao } from '../models/Cidadao';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

async function fixAllPasswords() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco de dados');

        // Find users with null or empty password
        // Note: Using raw query might be safer if model definition is tricky, but model should work.
        // Or simply iterate all and check.

        const cidadaos = await Cidadao.findAll();
        console.log(`🔍 Total de cidadãos encontrados: ${cidadaos.length}`);

        const senhaHash = await bcrypt.hash('12345678', 10);
        let updatedCount = 0;

        for (const c of cidadaos) {
            // Check if password is null, empty string, or undefined
            if (!c.senha || c.senha.trim() === '') {
                console.log(`🔧 Atualizando senha para: ${c.nome_completo} (CPF terminado em ...${c.cpf.slice(-4)})`);
                await c.update({ senha: senhaHash });
                updatedCount++;
            }
        }

        console.log('\n=============================================');
        console.log(`✅ Processo concluído!`);
        console.log(`👥 Usuários atualizados: ${updatedCount}`);
        console.log(`🔑 Nova senha padrão: 12345678`);
        console.log('=============================================\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao atualizar senhas:', error);
        process.exit(1);
    }
}

fixAllPasswords();
