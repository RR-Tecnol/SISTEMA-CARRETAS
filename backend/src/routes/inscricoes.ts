import { Router, Request, Response } from 'express';
import { Inscricao } from '../models/Inscricao';
import { AcaoCursoExame } from '../models/AcaoCursoExame';
import { Cidadao } from '../models/Cidadao';
import { Acao } from '../models/Acao';
import { CursoExame } from '../models/CursoExame';
import { authenticate, authorizeAdmin, AuthRequest } from '../middlewares/auth';

const router = Router();

/**
 * GET /api/inscricoes
 * Listar todas as inscrições (admin only - para BI)
 */
router.get('/', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
    try {
        const inscricoes = await Inscricao.findAll({
            attributes: ['id', 'cidadao_id', 'acao_curso_id', 'status', 'compareceu', 'created_at'],
            order: [['created_at', 'DESC']],
        });

        res.json(inscricoes);
    } catch (error) {
        console.error('Error fetching all inscricoes:', error);
        res.status(500).json({ error: 'Erro ao buscar inscrições' });
    }
});


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
            status: 'inscrito' as any,
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
            status: compareceu ? ('confirmado' as any) : inscricao.status,
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

/**
 * GET /api/acoes/:acaoId/inscricoes
 * Listar inscrições de uma ação (admin)
 */
router.get('/acoes/:acaoId/inscricoes', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
    try {
        const { acaoId } = req.params;

        const inscricoes = await Inscricao.findAll({
            include: [
                {
                    model: Cidadao,
                    as: 'cidadao',
                    attributes: ['id', 'nome_completo', 'cpf', 'email', 'telefone'],
                },
                {
                    model: AcaoCursoExame,
                    as: 'acao_curso',
                    where: { acao_id: acaoId },
                    include: [
                        {
                            model: CursoExame,
                            as: 'curso_exame',
                        },
                    ],
                },
            ],
            order: [['created_at', 'DESC']],
        });

        // Função para formatar CPF
        const formatCPF = (cpf: string): string => {
            const cleaned = cpf.replace(/\D/g, '');
            if (cleaned.length !== 11) return cpf;
            return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        };

        // Descriptografar e formatar CPF antes de retornar
        const inscricoesComCPFDecrypted = inscricoes.map(inscricao => {
            const inscricaoJSON = inscricao.toJSON() as any;
            if (inscricaoJSON.cidadao && inscricaoJSON.cidadao.cpf) {
                const cidadaoInstance = inscricao.get('cidadao') as Cidadao;
                const cpfDecrypted = cidadaoInstance.getCPFDecrypted();
                inscricaoJSON.cidadao.cpf = formatCPF(cpfDecrypted);
            }
            return inscricaoJSON;
        });

        res.json(inscricoesComCPFDecrypted);
    } catch (error) {
        console.error('Error fetching inscricoes:', error);
        res.status(500).json({ error: 'Erro ao buscar inscrições' });
    }
});

/**
 * POST /api/acoes/:acaoId/inscricoes
 * Adicionar cidadão a uma ação (admin) - pode ser cadastro espontâneo
 */
router.post('/acoes/:acaoId/inscricoes', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
    try {
        const { acaoId } = req.params;
        const { cidadao_id, acao_curso_id, cadastro_espontaneo = false } = req.body;

        // Check if acao_curso exists
        const acaoCurso = await AcaoCursoExame.findOne({
            where: {
                id: acao_curso_id,
                acao_id: acaoId,
            },
        });

        if (!acaoCurso) {
            res.status(404).json({ error: 'Curso/Exame não encontrado nesta ação' });
            return;
        }

        // Check for existing inscricao
        const existingInscricao = await Inscricao.findOne({
            where: {
                cidadao_id,
                acao_curso_id,
            },
        });

        if (existingInscricao) {
            res.status(409).json({ error: 'Cidadão já está inscrito neste curso/exame' });
            return;
        }

        // Create inscricao
        const inscricao = await Inscricao.create({
            cidadao_id,
            acao_curso_id,
            status: 'inscrito' as any,
            data_inscricao: new Date(),
            cadastro_espontaneo,
        });

        res.status(201).json({
            message: 'Cidadão adicionado com sucesso',
            inscricao,
        });
    } catch (error) {
        console.error('Error creating inscricao:', error);
        res.status(500).json({ error: 'Erro ao adicionar cidadão' });
    }
});

/**
 * PUT /api/inscricoes/:id/confirmar
 * Confirmar inscrição (admin)
 */
router.put('/:id/confirmar', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const inscricao = await Inscricao.findByPk(id);
        if (!inscricao) {
            res.status(404).json({ error: 'Inscrição não encontrada' });
            return;
        }

        await inscricao.update({
            status: 'confirmado' as any,
            data_confirmacao: new Date(),
        });

        res.json({
            message: 'Inscrição confirmada com sucesso',
            inscricao,
        });
    } catch (error) {
        console.error('Error confirming inscricao:', error);
        res.status(500).json({ error: 'Erro ao confirmar inscrição' });
    }
});

/**
 * PUT /api/inscricoes/:id/marcar-atendimento
 * Marcar cidadão como atendido (admin)
 */
router.put('/:id/marcar-atendimento', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { observacoes } = req.body;

        const inscricao = await Inscricao.findByPk(id);
        if (!inscricao) {
            res.status(404).json({ error: 'Inscrição não encontrada' });
            return;
        }

        await inscricao.update({
            status: 'concluido' as any,
            compareceu: true,
            data_atendimento: new Date(),
            observacoes: observacoes || inscricao.observacoes,
        });

        res.json({
            message: 'Atendimento registrado com sucesso',
            inscricao,
        });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ error: 'Erro ao registrar atendimento' });
    }
});

/**
 * DELETE /api/inscricoes/:id
 * Cancelar inscrição (admin)
 */
router.delete('/:id', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const inscricao = await Inscricao.findByPk(id);
        if (!inscricao) {
            res.status(404).json({ error: 'Inscrição não encontrada' });
            return;
        }

        await inscricao.update({
            status: 'cancelado',
        });

        res.json({
            message: 'Inscrição cancelada com sucesso',
        });
    } catch (error) {
        console.error('Error canceling inscricao:', error);
        res.status(500).json({ error: 'Erro ao cancelar inscrição' });
    }
});

/**
 * PUT /api/inscricoes/:id/status
 * Atualizar status da inscrição (admin)
 */
router.put('/:id/status', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'pendente' | 'atendido' | 'faltou'

        if (!['pendente', 'atendido', 'faltou'].includes(status)) {
            res.status(400).json({ error: 'Status inválido. Use: pendente, atendido ou faltou' });
            return;
        }

        const inscricao = await Inscricao.findByPk(id);
        if (!inscricao) {
            res.status(404).json({ error: 'Inscrição não encontrada' });
            return;
        }

        // Mapear status para campos do banco
        switch (status) {
            case 'atendido':
                inscricao.status = 'confirmado' as any;
                inscricao.compareceu = true;
                inscricao.data_atendimento = new Date();
                break;
            case 'faltou':
                inscricao.status = 'inscrito' as any;
                inscricao.compareceu = false;
                break;
            case 'pendente':
            default:
                inscricao.status = 'inscrito' as any;
                (inscricao as any).compareceu = null;
                (inscricao as any).data_atendimento = null;
                break;
        }

        await inscricao.save();
        res.json(inscricao);
    } catch (error) {
        console.error('Error updating inscription status:', error);
        res.status(500).json({ error: 'Erro ao atualizar status da inscrição' });
    }
});

export default router;
