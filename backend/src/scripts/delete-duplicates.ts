
import { sequelize } from '../config/database';
import { Cidadao } from '../models/Cidadao';

async function deleteDuplicates() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        const idsToDelete = [
            '682f7e39-0875-43b8-a073-468227a010fc',
            '3242dc2d-c72b-4fde-bce2-9b59bc7a40e6'
        ];

        console.log(`Deleting ${idsToDelete.length} users...`);

        const result = await Cidadao.destroy({
            where: {
                id: idsToDelete
            }
        });

        console.log(`✅ Deleted ${result} users successfully.`);
        process.exit(0);
    } catch (error) {
        console.error('Error deleting users:', error);
        process.exit(1);
    }
}

deleteDuplicates();
