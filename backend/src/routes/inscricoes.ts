import { Router, Request, Response } from 'express';
import { Inscricao } from '../models/Inscricao';
import { AcaoCursoExame } from '../models/AcaoCursoExame';

import { Acao } from '../models/Acao';
import { CursoExame } from '../models/CursoExame';
import { authenticate, authorizeAdmin, AuthRequest } from '../middlewares/auth';

const router = Router();

/**
 * POST /api/inscricoes
 * Criar nova inscrição (cidadão autenticado)
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { acao_curso_id } = req.body;
        const cidadao_id = req.user!.id;

        // Check if acao_curso exists and has vagas
        const acaoCurso = await AcaoCursoExame.findByPk(acao_curso_id);
        if (!acaoCurso) {
            res.status(404).json({ error: 'Curso/Exame não encontrado nesta ação' });
            return;
        }

        // Check for existing inscricao
        const existingInscricao = await Inscricao.findOne({
            where: {
                cidadao_id,
                acao_curso_id,
                status: ['inscrito', 'confirmado'],
            },
        });

        if (existingInscricao) {
            res.status(409).json({ error: 'Você já está inscrito neste curso/exame' });
            return;
        }

        // Check vagas disponíveis
        const inscricoesCount = await Inscricao.count({
            where: {
                acao_curso_id,
                status: ['inscrito', 'confirmado'],
            },
        });

        if (inscricoesCount >= acaoCurso.vagas) {
            res.status(400).json({ error: 'Não há vagas disponíveis' });
            return;
        }

        // Create inscricao
        const inscricao = await Inscricao.create({
            cidadao_id,
            acao_curso_id,
            status: 'inscrito',
            data_inscricao: new Date(),
        });

        res.status(201).json({
            message: 'Inscrição realizada com sucesso',
            inscricao,
        });
    } catch (error) {
        console.error('Error creating inscricao:', error);
        res.status(500).json({ error: 'Erro ao realizar inscrição' });
    }
});

/**
 * GET /api/inscricoes/me
 * Listar minhas inscrições (cidadão)
 */
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const cidadao_id = req.user!.id;

        const inscricoes = await Inscricao.findAll({
            where: { cidadao_id },
            include: [
                {
                    model: AcaoCursoExame,
                    as: 'acao_curso',
                    include: [
                        {
                            model: Acao,
                            as: 'acao',
                        },
                        {
                            model: CursoExame,
                            as: 'curso_exame',
                        },
                    ],
                },
            ],
            order: [['created_at', 'DESC']],
        });

        res.json(inscricoes);
    } catch (error) {
        console.error('Error fetching inscricoes:', error);
        res.status(500).json({ error: 'Erro ao buscar inscrições' });
    }
});

/**
 * PUT /api/inscricoes/:id/presenca
 * Registrar presença (admin)
 */
router.put('/:id/presenca', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { compareceu } = req.body;

        const inscricao = await Inscricao.findByPk(id);
        if (!inscricao) {
            res.status(404).json({ error: 'Inscrição não encontrada' });
            return;
        }

        await inscricao.update({
            compareceu,
            status: compareceu ? 'confirmado' : inscricao.status,
        });

        res.json({
            message: 'Presença registrada com sucesso',
            inscricao,
        });
    } catch (error) {
        console.error('Error updating presenca:', error);
        res.status(500).json({ error: 'Erro ao registrar presença' });
    }
});

export default router;
