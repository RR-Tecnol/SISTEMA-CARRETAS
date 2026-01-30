import { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Box,
    CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

interface Acao {
    id: string;
    tipo: 'curso' | 'saude';
    municipio: string;
    estado: string;
    data_inicio: string;
    data_fim: string;
    status: 'planejada' | 'ativa' | 'concluida';
    descricao: string;
    local_execucao: string;
    vagas_disponiveis: number;
}

const Acoes = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [acoes, setAcoes] = useState<Acao[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAcoes = useCallback(async () => {
        try {
            const response = await api.get('/acoes');
            setAcoes(response.data);
        } catch (error: any) {
            enqueueSnackbar(
                error.response?.data?.error || 'Erro ao carregar ações',
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    useEffect(() => {
        loadAcoes();
    }, [loadAcoes]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ativa': return 'success';
            case 'planejada': return 'warning';
            case 'concluida': return 'default';
            default: return 'default';
        }
    };

    const getTipoColor = (tipo: string) => {
        return tipo === 'curso' ? 'primary' : 'secondary';
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h4">Gerenciar Ações</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/admin/acoes/nova')}
                >
                    Nova Ação
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Local</TableCell>
                                <TableCell>Data Início</TableCell>
                                <TableCell>Data Fim</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Vagas</TableCell>
                                <TableCell>Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {acoes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography color="text.secondary" sx={{ py: 4 }}>
                                            Nenhuma ação cadastrada ainda.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                acoes.map((acao) => (
                                    <TableRow key={acao.id} hover>
                                        <TableCell>
                                            <Chip
                                                label={acao.tipo.toUpperCase()}
                                                color={getTipoColor(acao.tipo)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {acao.municipio}/{acao.estado}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(acao.data_inicio).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(acao.data_fim).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={acao.status.toUpperCase()}
                                                color={getStatusColor(acao.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{acao.vagas_disponiveis}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                onClick={() => navigate(`/admin/acoes/${acao.id}`)}
                                            >
                                                Ver Detalhes
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
};

export default Acoes;
