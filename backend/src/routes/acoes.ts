import { Router, Request, Response } from 'express';
import { Acao } from '../models/Acao';
import { AcaoCursoExame } from '../models/AcaoCursoExame';
import { CursoExame } from '../models/CursoExame';
import { Instituicao } from '../models/Instituicao';
import { Caminhao } from '../models/Caminhao';
import { Funcionario } from '../models/Funcionario';
import { AcaoCaminhao } from '../models/AcaoCaminhao';
import { AcaoFuncionario } from '../models/AcaoFuncionario';
import { Inscricao } from '../models/Inscricao';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import Joi from 'joi';
import { validate } from '../middlewares/validation';
import { Op } from 'sequelize';

const router = Router();

// Validation schema for creating acao
const createAcaoSchema = Joi.object({
    instituicao_id: Joi.string().uuid().required(),
    tipo: Joi.string().valid('curso', 'saude').required(),
    municipio: Joi.string().required(),
    estado: Joi.string().length(2).required(),
    data_inicio: Joi.date().required(),
    data_fim: Joi.date().required(),
    descricao: Joi.string().optional(),
    local_execucao: Joi.string().required(),
    vagas_disponiveis: Joi.number().integer().min(0).required(),
    campos_customizados: Joi.object().optional(),
});

/**
 * GET /api/acoes
 * Listar ações (público)
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const { municipio, estado, status, tipo, data_inicio } = req.query;

        const where: any = {};

        if (municipio) where.municipio = municipio;
        if (estado) where.estado = estado;
        if (status) where.status = status;
        if (tipo) where.tipo = tipo;
        if (data_inicio) {
            where.data_inicio = {
                [Op.gte]: new Date(data_inicio as string),
            };
        }

        const acoes = await Acao.findAll({
            where,
            include: [
                {
                    model: Instituicao,
                    as: 'instituicao',
                    attributes: ['id', 'razao_social'],
                },
                {
                    model: AcaoCursoExame,
                    as: 'cursos_exames',
                    include: [
                        {
                            model: CursoExame,
                            as: 'curso_exame',
                        },
                    ],
                },
                {
                    model: Caminhao,
                    as: 'caminhoes',
                },
                {
                    model: Funcionario,
                    as: 'funcionarios',
                },
            ],
            order: [['data_inicio', 'ASC']],
        });

        res.json(acoes);
    } catch (error) {
        console.error('Error fetching acoes:', error);
        res.status(500).json({ error: 'Erro ao buscar ações' });
    }
});

/**
 * GET /api/acoes/:id
 * Buscar ação por ID (público)
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const acao = await Acao.findByPk(id, {
            include: [
                {
                    model: Instituicao,
                    as: 'instituicao',
                },
                {
                    model: AcaoCursoExame,
                    as: 'cursos_exames',
                    include: [
                        {
                            model: CursoExame,
                            as: 'curso_exame',
                        },
                    ],
                },
                {
                    model: Caminhao,
                    as: 'caminhoes',
                },
                {
                    model: Funcionario,
                    as: 'funcionarios',
                },
            ],
        });

        if (!acao) {
            res.status(404).json({ error: 'Ação não encontrada' });
            return;
        }

        // Calcular custos
        const dataInicio = new Date(acao.data_inicio);
        const dataFim = new Date(acao.data_fim);
        const dias = Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const custoCaminhoes = (acao as any).caminhoes?.reduce((acc: number, c: any) => acc + (Number(c.custo_diario) * dias), 0) || 0;
        const custoFuncionarios = (acao as any).funcionarios?.reduce((acc: number, f: any) => acc + (Number(f.custo_diario) * dias), 0) || 0;
        const custoTotal = custoCaminhoes + custoFuncionarios;

        // Contar atendidos (presença confirmada)
        const atendidos = await Inscricao.count({
            include: [{
                model: AcaoCursoExame,
                as: 'acao_curso',
                where: { acao_id: id }
            }],
            where: { compareceu: true }
        });

        const custoPorPessoa = atendidos > 0 ? custoTotal / atendidos : 0;

        res.json({
            ...acao.toJSON(),
            resumo_financeiro: {
                dias,
                custo_caminhoes: custoCaminhoes,
                custo_funcionarios: custoFuncionarios,
                custo_total: custoTotal,
                atendidos,
                custo_por_pessoa: custoPorPessoa
            }
        });
    } catch (error) {
        console.error('Error fetching acao:', error);
        res.status(500).json({ error: 'Erro ao buscar ação' });
    }
});

/**
 * POST /api/acoes
 * Criar nova ação (admin)
 */
router.post(
    '/',
    authenticate,
    authorizeAdmin,
    validate(createAcaoSchema),
    async (req: Request, res: Response) => {
        try {
            const acaoData = req.body;

            const acao = await Acao.create(acaoData);

            res.status(201).json({
                message: 'Ação criada com sucesso',
                acao,
            });
        } catch (error) {
            console.error('Error creating acao:', error);
            res.status(500).json({ error: 'Erro ao criar ação' });
        }
    }
);

/**
 * PUT /api/acoes/:id
 * Atualizar ação (admin)
 */
router.put('/:id', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const acao = await Acao.findByPk(id);
        if (!acao) {
            res.status(404).json({ error: 'Ação não encontrada' });
            return;
        }

        await acao.update(updateData);

        res.json({
            message: 'Ação atualizada com sucesso',
            acao,
        });
    } catch (error) {
        console.error('Error updating acao:', error);
        res.status(500).json({ error: 'Erro ao atualizar ação' });
    }
});

/**
 * POST /api/acoes/:id/cursos-exames
 * Vincular curso/exame à ação (admin)
 */
router.post('/:id/cursos-exames', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { curso_exame_id, vagas, horarios } = req.body;

        const acao = await Acao.findByPk(id);
        if (!acao) {
            res.status(404).json({ error: 'Ação não encontrada' });
            return;
        }

        const cursoExame = await CursoExame.findByPk(curso_exame_id);
        if (!cursoExame) {
            res.status(404).json({ error: 'Curso/Exame não encontrado' });
            return;
        }

        const acaoCurso = await AcaoCursoExame.create({
            acao_id: id,
            curso_exame_id,
            vagas: vagas || 0,
            horarios: horarios || [],
        });

        res.status(201).json({
            message: 'Curso/Exame vinculado com sucesso',
            acaoCurso,
        });
    } catch (error) {
        console.error('Error linking curso/exame:', error);
        res.status(500).json({ error: 'Erro ao vincular curso/exame' });
    }
});

/**
 * POST /api/acoes/:id/caminhoes
 * Vincular caminhão à ação
 */
router.post('/:id/caminhoes', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { caminhao_id } = req.body;
        await AcaoCaminhao.create({ acao_id: id, caminhao_id });
        res.status(201).json({ message: 'Caminhão vinculado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao vincular caminhão' });
    }
});

/**
 * POST /api/acoes/:id/funcionarios
 * Vincular funcionário à ação
 */
router.post('/:id/funcionarios', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { funcionario_id } = req.body;
        await AcaoFuncionario.create({ acao_id: id, funcionario_id });
        res.status(201).json({ message: 'Funcionário vinculado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao vincular funcionário' });
    }
});

export default router;
