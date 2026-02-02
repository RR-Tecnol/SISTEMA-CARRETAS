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
    Box,
    CircularProgress,
    TextField,
    InputAdornment,
    IconButton,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

interface Instituicao {
    id: string;
    razao_social: string;
    cnpj: string;
    responsavel_nome: string;
    responsavel_email: string;
    responsavel_tel: string;
    endereco_completo: string;
    ativo: boolean;
    created_at?: string;
}

const Instituicoes = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const loadInstituicoes = useCallback(async () => {
        try {
            const response = await api.get('/instituicoes');
            setInstituicoes(response.data);
        } catch (error: any) {
            enqueueSnackbar(
                error.response?.data?.error || 'Erro ao carregar instituições',
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
    }, [enqueueSnackbar]);

    useEffect(() => {
        loadInstituicoes();
    }, [loadInstituicoes]);

    const filteredInstituicoes = instituicoes.filter((inst) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            !searchTerm ||
            inst.razao_social.toLowerCase().includes(searchLower) ||
            inst.cnpj.toLowerCase().includes(searchLower) ||
            inst.responsavel_email.toLowerCase().includes(searchLower) ||
            inst.responsavel_nome.toLowerCase().includes(searchLower)
        );
    });

    const formatCNPJ = (cnpj: string) => {
        return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant="h4">Gerenciar Instituições</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/admin/instituicoes/nova')}
                >
                    Nova Instituição
                </Button>
            </Box>

            {/* Barra de Pesquisa */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Pesquisar por razão social, CNPJ, responsável..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearchTerm('')}>
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Razão Social</TableCell>
                                <TableCell>CNPJ</TableCell>
                                <TableCell>Responsável</TableCell>
                                <TableCell>Telefone</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Cadastro</TableCell>
                                <TableCell align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredInstituicoes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography color="text.secondary" sx={{ py: 4 }}>
                                            {searchTerm
                                                ? 'Nenhuma instituição encontrada com os critérios de busca.'
                                                : 'Nenhuma instituição cadastrada ainda.'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredInstituicoes.map((inst) => (
                                    <TableRow
                                        key={inst.id}
                                        hover
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/admin/instituicoes/${inst.id}`)}
                                    >
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={500} noWrap>
                                                {inst.razao_social}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            {formatCNPJ(inst.cnpj)}
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            {inst.responsavel_nome}
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            {inst.responsavel_tel}
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            {inst.responsavel_email}
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            {inst.created_at
                                                ? new Date(inst.created_at).toLocaleDateString('pt-BR')
                                                : '-'}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/admin/instituicoes/${inst.id}`);
                                                }}
                                                color="primary"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Contador de resultados */}
            {!loading && filteredInstituicoes.length > 0 && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Mostrando {filteredInstituicoes.length} de {instituicoes.length} instituição(ões)
                    </Typography>
                </Box>
            )}
        </Container>
    );
};

export default Instituicoes;
