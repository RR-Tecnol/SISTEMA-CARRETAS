import { Router, Request, Response } from 'express';
import { Instituicao } from '../models/Instituicao';
import { authenticate, authorizeAdmin } from '../middlewares/auth';

const router = Router();

/**
 * GET /api/instituicoes
 * Listar instituições (admin)
 */
router.get('/', authenticate, authorizeAdmin, async (_req: Request, res: Response) => {
    try {
        const instituicoes = await Instituicao.findAll({
            where: { ativo: true },
            order: [['razao_social', 'ASC']],
        });

        res.json(instituicoes);
    } catch (error) {
        console.error('Error fetching instituicoes:', error);
        res.status(500).json({ error: 'Erro ao buscar instituições' });
    }
});

/**
 * POST /api/instituicoes
 * Criar instituição (admin)
 */
router.post('/', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
    try {
        const instituicao = await Instituicao.create(req.body);
        res.status(201).json({ message: 'Instituição criada com sucesso', instituicao });
    } catch (error) {
        console.error('Error creating instituicao:', error);
        res.status(500).json({ error: 'Erro ao criar instituição' });
    }
});

export default router;
