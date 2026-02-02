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
    TextField,
    Grid,
    MenuItem,
    InputAdornment,
    Collapse,
    IconButton,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

interface Acao {
    id: string;
    numero_acao?: number;
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
    const [showFilters, setShowFilters] = useState(false);

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterIdAcao, setFilterIdAcao] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterMunicipio, setFilterMunicipio] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [filterDataInicio, setFilterDataInicio] = useState('');
    const [filterDataFim, setFilterDataFim] = useState('');

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

    // Função de filtro avançado
    const filteredAcoes = acoes.filter((acao) => {
        // Filtro de pesquisa geral
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            !searchTerm ||
            (acao.numero_acao && acao.numero_acao.toString().includes(searchLower)) ||
            acao.municipio.toLowerCase().includes(searchLower) ||
            acao.estado.toLowerCase().includes(searchLower) ||
            acao.local_execucao.toLowerCase().includes(searchLower) ||
            acao.descricao.toLowerCase().includes(searchLower) ||
            acao.tipo.toLowerCase().includes(searchLower);

        // Filtro específico de ID (número da ação - busca exata)
        const matchesId = !filterIdAcao || (acao.numero_acao && acao.numero_acao.toString() === filterIdAcao);

        // Filtros específicos
        const matchesTipo = !filterTipo || acao.tipo === filterTipo;
        const matchesStatus = !filterStatus || acao.status === filterStatus;
        const matchesMunicipio = !filterMunicipio || acao.municipio.toLowerCase().includes(filterMunicipio.toLowerCase());
        const matchesEstado = !filterEstado || acao.estado.toLowerCase().includes(filterEstado.toLowerCase());

        // Filtro de data início
        const matchesDataInicio = !filterDataInicio || new Date(acao.data_inicio) >= new Date(filterDataInicio);


        // Filtro de data fim
        const matchesDataFim = !filterDataFim || new Date(acao.data_fim) <= new Date(filterDataFim);

        return matchesSearch && matchesId && matchesTipo && matchesStatus && matchesMunicipio && matchesEstado && matchesDataInicio && matchesDataFim;
    });

    const clearFilters = () => {
        setSearchTerm('');
        setFilterIdAcao('');
        setFilterTipo('');
        setFilterStatus('');
        setFilterMunicipio('');
        setFilterEstado('');
        setFilterDataInicio('');
        setFilterDataFim('');
    };

    const hasActiveFilters = searchTerm || filterIdAcao || filterTipo || filterStatus || filterMunicipio || filterEstado || filterDataInicio || filterDataFim;

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

            {/* Barra de Pesquisa e Filtros */}
            <Paper sx={{ p: 3, mb: 3 }}>
                {/* Campo de Pesquisa */}
                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Pesquisar por município, estado, local, descrição ou tipo..."
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
                </Box>

                {/* Botão de Filtros Avançados */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                        startIcon={<FilterIcon />}
                        onClick={() => setShowFilters(!showFilters)}
                        variant={showFilters ? 'contained' : 'outlined'}
                        size="small"
                    >
                        Filtros Avançados
                        {hasActiveFilters && ` (${[filterTipo, filterStatus, filterMunicipio, filterEstado, filterDataInicio, filterDataFim].filter(Boolean).length})`}
                    </Button>
                    {hasActiveFilters && (
                        <Button
                            startIcon={<ClearIcon />}
                            onClick={clearFilters}
                            size="small"
                            color="secondary"
                        >
                            Limpar Filtros
                        </Button>
                    )}
                </Box>

                {/* Painel de Filtros Avançados */}
                <Collapse in={showFilters}>
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                            Filtros Avançados
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Número da Ação"
                                    value={filterIdAcao}
                                    onChange={(e) => setFilterIdAcao(e.target.value)}
                                    size="small"
                                    placeholder="Ex: 123"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Tipo"
                                    value={filterTipo}
                                    onChange={(e) => setFilterTipo(e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="curso">Curso</MenuItem>
                                    <MenuItem value="saude">Saúde</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Status"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="planejada">Planejada</MenuItem>
                                    <MenuItem value="ativa">Ativa</MenuItem>
                                    <MenuItem value="concluida">Concluída</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Município"
                                    value={filterMunicipio}
                                    onChange={(e) => setFilterMunicipio(e.target.value)}
                                    size="small"
                                    placeholder="Ex: João Pessoa"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Estado"
                                    value={filterEstado}
                                    onChange={(e) => setFilterEstado(e.target.value)}
                                    size="small"
                                    placeholder="Ex: PB"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Data Início (a partir de)"
                                    value={filterDataInicio}
                                    onChange={(e) => setFilterDataInicio(e.target.value)}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Data Fim (até)"
                                    value={filterDataFim}
                                    onChange={(e) => setFilterDataFim(e.target.value)}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Collapse>
            </Paper>

            {/* Contador de Resultados */}
            {hasActiveFilters && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Mostrando {filteredAcoes.length} de {acoes.length} ações
                    </Typography>
                </Box>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
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
                            {filteredAcoes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography color="text.secondary" sx={{ py: 4 }}>
                                            {hasActiveFilters
                                                ? 'Nenhuma ação encontrada com os filtros aplicados.'
                                                : 'Nenhuma ação cadastrada ainda.'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAcoes.map((acao) => (
                                    <TableRow key={acao.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                #{acao.numero_acao || 'N/A'}
                                            </Typography>
                                        </TableCell>
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
