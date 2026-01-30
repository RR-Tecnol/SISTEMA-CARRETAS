import { Router, Request, Response } from 'express';
import { CursoExame } from '../models/CursoExame';

const router = Router();

/**
 * GET /api/cursos-exames
 * Listar cursos e exames (público)
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const { tipo } = req.query;

        const where: any = { ativo: true };
        if (tipo) where.tipo = tipo;

        const cursosExames = await CursoExame.findAll({
            where,
            order: [['nome', 'ASC']],
        });

        res.json(cursosExames);
    } catch (error) {
        console.error('Error fetching cursos/exames:', error);
        res.status(500).json({ error: 'Erro ao buscar cursos/exames' });
    }
});

/**
 * GET /api/cursos-exames/:id
 * Buscar curso/exame pelo ID (público)
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const cursoExame = await CursoExame.findByPk(id);
        if (!cursoExame) {
            res.status(404).json({ error: 'Curso/Exame não encontrado' });
            return;
        }

        res.json(cursoExame);
    } catch (error) {
        console.error('Error fetching curso/exame:', error);
        res.status(500).json({ error: 'Erro ao buscar curso/exame' });
    }
});

export default router;
