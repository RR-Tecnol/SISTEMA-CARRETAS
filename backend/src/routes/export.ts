import { Router, Request, Response } from 'express';
import { Inscricao } from '../models/Inscricao';
import { AcaoCursoExame } from '../models/AcaoCursoExame';
import { Cidadao } from '../models/Cidadao';
import { CursoExame } from '../models/CursoExame';
import { Acao } from '../models/Acao';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import PDFDocument from 'pdfkit';
import { createObjectCsvWriter } from 'csv-writer';
import { promises as fs } from 'fs';
import path from 'path';

const router = Router();

/**
 * GET /api/acoes/:acaoId/export/inscritos?format=pdf|csv
 * Exportar lista de inscritos
 */
router.get('/acoes/:acaoId/export/inscritos', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
    try {
        const { acaoId } = req.params;
        const format = (req.query.format as string) || 'pdf';

        // Buscar ação
        const acao = await Acao.findByPk(acaoId);
        if (!acao) {
            res.status(404).json({ error: 'Ação não encontrada' });
            return;
        }

        // Buscar inscrições
        const inscricoes = await Inscricao.findAll({
            include: [
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
                {
                    model: Cidadao,
                    as: 'cidadao',
                    attributes: ['id', 'nome_completo', 'cpf', 'telefone', 'email'],
                },
            ],
            where: {
                status: ['inscrito', 'confirmado', 'concluido'],
            },
            order: [['created_at', 'ASC']],
        });

        // Descriptografar CPF e telefone
        const formatCPF = (cpf: string): string => {
            const cleaned = cpf.replace(/\D/g, '');
            if (cleaned.length !== 11) return cpf;
            return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        };

        const formatPhone = (phone: string): string => {
            const cleaned = phone.replace(/\D/g, '');
            if (cleaned.length === 11) {
                return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (cleaned.length === 10) {
                return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            }
            return phone;
        };

        const inscricoesDecrypted = inscricoes.map(inscricao => {
            const inscricaoJSON = inscricao.toJSON() as any;
            if (inscricaoJSON.cidadao) {
                const cidadaoInstance = inscricao.get('cidadao') as Cidadao;
                if (cidadaoInstance && inscricaoJSON.cidadao.cpf) {
                    const cpfDecrypted = cidadaoInstance.getCPFDecrypted();
                    inscricaoJSON.cidadao.cpf = formatCPF(cpfDecrypted);
                }
                if (inscricaoJSON.cidadao.telefone) {
                    inscricaoJSON.cidadao.telefone = formatPhone(inscricaoJSON.cidadao.telefone);
                }
            }
            return inscricaoJSON;
        });

        if (format === 'csv') {
            await exportInscritosCSV(acao, inscricoesDecrypted, res);
        } else {
            // PDF: filtrar apenas pendente e atendido (excluir faltou)
            const inscricoesFiltradas = inscricoesDecrypted.filter((insc: any) => {
                // Pendente: compareceu null/undefined
                // Atendido: compareceu true
                // Faltou: compareceu false (EXCLUIR)
                return insc.compareceu !== false;
            });
            await exportInscritosPDF(acao, inscricoesFiltradas, res);
        }
    } catch (error) {
        console.error('Error exporting inscritos:', error);
        res.status(500).json({ error: 'Erro ao exportar inscritos' });
    }
});

/**
 * GET /api/acoes/:acaoId/export/atendidos?format=pdf|csv
 * Exportar lista de atendidos
 */
router.get('/acoes/:acaoId/export/atendidos', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
    try {
        const { acaoId } = req.params;
        const format = (req.query.format as string) || 'pdf';

        // Buscar ação
        const acao = await Acao.findByPk(acaoId);
        if (!acao) {
            res.status(404).json({ error: 'Ação não encontrada' });
            return;
        }

        // Buscar apenas atendidos
        const inscricoes = await Inscricao.findAll({
            include: [
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
                {
                    model: Cidadao,
                    as: 'cidadao',
                    attributes: ['id', 'nome_completo', 'cpf', 'telefone', 'email'],
                },
            ],
            where: {
                status: 'concluido',
                compareceu: true,
            },
            order: [['data_atendimento', 'ASC']],
        });

        if (format === 'csv') {
            await exportAtendidosCSV(acao, inscricoes, res);
        } else {
            await exportAtendidosPDF(acao, inscricoes, res);
        }
    } catch (error) {
        console.error('Error exporting atendidos:', error);
        res.status(500).json({ error: 'Erro ao exportar atendidos' });
    }
});

// Helper functions
async function exportInscritosPDF(acao: any, inscricoes: any[], res: Response) {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=inscritos-acao-${acao.id}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(18).text('Lista de Inscritos', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Ação: ${acao.tipo.toUpperCase()} - ${acao.municipio}/${acao.estado}`);
    doc.text(`Data: ${new Date(acao.data_inicio).toLocaleDateString('pt-BR')} a ${new Date(acao.data_fim).toLocaleDateString('pt-BR')}`);
    doc.text(`Total de Inscritos: ${inscricoes.length}`);
    doc.moveDown();

    // Table header
    const tableTop = doc.y;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Nome', 50, tableTop);
    doc.text('CPF', 250, tableTop);
    doc.text('Telefone', 370, tableTop);
    doc.text('Status', 480, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    doc.moveDown();

    // Table rows
    doc.font('Helvetica');
    inscricoes.forEach((inscricao: any, index) => {
        const y = tableTop + 25 + (index * 20);

        if (y > 700) {
            doc.addPage();
        }

        doc.text(inscricao.cidadao?.nome_completo || 'N/A', 50, y, { width: 190 });
        doc.text(inscricao.cidadao?.cpf || 'N/A', 250, y);
        doc.text(inscricao.cidadao?.telefone || 'N/A', 370, y);
        doc.text(inscricao.status.toUpperCase(), 480, y);
    });

    doc.end();
}

async function exportInscritosCSV(acao: any, inscricoes: any[], res: Response) {
    const tmpPath = path.join(__dirname, '../../tmp', `inscritos-${Date.now()}.csv`);

    // Ensure tmp directory exists
    await fs.mkdir(path.dirname(tmpPath), { recursive: true });

    const csvWriter = createObjectCsvWriter({
        path: tmpPath,
        header: [
            { id: 'nome', title: 'Nome' },
            { id: 'cpf', title: 'CPF' },
            { id: 'telefone', title: 'Telefone' },
            { id: 'email', title: 'Email' },
            { id: 'curso', title: 'Curso/Exame' },
            { id: 'status', title: 'Status' },
            { id: 'data_inscricao', title: 'Data Inscrição' },
        ],
    });

    const records = inscricoes.map((inscricao: any) => ({
        nome: inscricao.cidadao?.nome_completo || 'N/A',
        cpf: inscricao.cidadao?.cpf || 'N/A',
        telefone: inscricao.cidadao?.telefone || 'N/A',
        email: inscricao.cidadao?.email || 'N/A',
        curso: inscricao.acao_curso?.curso_exame?.nome || 'N/A',
        status: inscricao.status,
        data_inscricao: new Date(inscricao.data_inscricao).toLocaleDateString('pt-BR'),
    }));

    await csvWriter.writeRecords(records);

    res.download(tmpPath, `inscritos-acao-${acao.id}.csv`, async (err) => {
        if (err) {
            console.error('Error downloading file:', err);
        }
        // Clean up temp file
        await fs.unlink(tmpPath).catch(console.error);
    });
}

async function exportAtendidosPDF(acao: any, inscricoes: any[], res: Response) {
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=atendidos-acao-${acao.id}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(18).text('Lista de Atendidos', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Ação: ${acao.tipo.toUpperCase()} - ${acao.municipio}/${acao.estado}`);
    doc.text(`Data: ${new Date(acao.data_inicio).toLocaleDateString('pt-BR')} a ${new Date(acao.data_fim).toLocaleDateString('pt-BR')}`);
    doc.text(`Total de Atendidos: ${inscricoes.length}`);
    doc.moveDown();

    // Table header
    const tableTop = doc.y;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Nome', 50, tableTop);
    doc.text('CPF', 250, tableTop);
    doc.text('Data Atendimento', 370, tableTop);
    doc.text('Observações', 480, tableTop, { width: 70 });

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    doc.moveDown();

    // Table rows
    doc.font('Helvetica');
    inscricoes.forEach((inscricao: any, index) => {
        const y = tableTop + 25 + (index * 20);

        if (y > 700) {
            doc.addPage();
        }

        doc.text(inscricao.cidadao?.nome_completo || 'N/A', 50, y, { width: 190 });
        doc.text(inscricao.cidadao?.cpf || 'N/A', 250, y);
        doc.text(
            inscricao.data_atendimento
                ? new Date(inscricao.data_atendimento).toLocaleDateString('pt-BR')
                : 'N/A',
            370,
            y
        );
        doc.text(inscricao.observacoes || '-', 480, y, { width: 70 });
    });

    doc.end();
}

async function exportAtendidosCSV(acao: any, inscricoes: any[], res: Response) {
    const tmpPath = path.join(__dirname, '../../tmp', `atendidos-${Date.now()}.csv`);

    // Ensure tmp directory exists
    await fs.mkdir(path.dirname(tmpPath), { recursive: true });

    const csvWriter = createObjectCsvWriter({
        path: tmpPath,
        header: [
            { id: 'nome', title: 'Nome' },
            { id: 'cpf', title: 'CPF' },
            { id: 'telefone', title: 'Telefone' },
            { id: 'email', title: 'Email' },
            { id: 'curso', title: 'Curso/Exame' },
            { id: 'data_atendimento', title: 'Data Atendimento' },
            { id: 'cadastro_espontaneo', title: 'Cadastro Espontâneo' },
            { id: 'observacoes', title: 'Observações' },
        ],
    });

    const records = inscricoes.map((inscricao: any) => ({
        nome: inscricao.cidadao?.nome_completo || 'N/A',
        cpf: inscricao.cidadao?.cpf || 'N/A',
        telefone: inscricao.cidadao?.telefone || 'N/A',
        email: inscricao.cidadao?.email || 'N/A',
        curso: inscricao.acao_curso?.curso_exame?.nome || 'N/A',
        data_atendimento: inscricao.data_atendimento
            ? new Date(inscricao.data_atendimento).toLocaleDateString('pt-BR')
            : 'N/A',
        cadastro_espontaneo: inscricao.cadastro_espontaneo ? 'Sim' : 'Não',
        observacoes: inscricao.observacoes || '-',
    }));

    await csvWriter.writeRecords(records);

    res.download(tmpPath, `atendidos-acao-${acao.id}.csv`, async (err) => {
        if (err) {
            console.error('Error downloading file:', err);
        }
        // Clean up temp file
        await fs.unlink(tmpPath).catch(console.error);
    });
}

export default router;
