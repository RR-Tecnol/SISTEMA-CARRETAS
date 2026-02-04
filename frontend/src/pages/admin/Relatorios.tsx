import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Grid, Card, CardContent, Table,
    TableBody, TableCell, TableHead, TableRow, Paper, Box,
    TextField, MenuItem, Button, Collapse, InputAdornment
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
    FilterList as FilterIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';
import api from '../../services/api';

const STATUS_COLORS = {
    atendidos: '#00C49F',
    pendentes: '#FFBB28',
    faltou: '#FF8042'
};

const Relatorios: React.FC = () => {
    const [acoes, setAcoes] = useState<any[]>([]);
    const [inscricoes, setInscricoes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // Estados dos filtros
    const [filterNumeroAcao, setFilterNumeroAcao] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterMunicipio, setFilterMunicipio] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [filterDataInicio, setFilterDataInicio] = useState('');
    const [filterDataFim, setFilterDataFim] = useState('');
    const [filterCustoMin, setFilterCustoMin] = useState('');
    const [filterCustoMax, setFilterCustoMax] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Buscar ações
                const acoesRes = await api.get('/acoes');
                const acoesComDetalhes = await Promise.all(
                    acoesRes.data.map(async (acao: any) => {
                        const detail = await api.get(`/acoes/${acao.id}`);
                        return detail.data;
                    })
                );
                setAcoes(acoesComDetalhes);

                // Buscar inscrições (com tratamento de erro)
                try {
                    const inscricoesRes = await api.get('/inscricoes');
                    setInscricoes(inscricoesRes.data);
                } catch (inscError) {
                    console.warn('⚠️ Erro ao buscar inscrições:', inscError);
                    setInscricoes([]);
                }
            } catch (error) {
                console.error('Erro ao buscar dados de BI', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Aplicar filtros
    const filteredAcoes = acoes.filter((acao: any) => {
        // Filtro de número da ação (busca exata)
        const matchesNumeroAcao = !filterNumeroAcao || (acao.numero_acao && acao.numero_acao.toString() === filterNumeroAcao);

        // Filtro de tipo
        const matchesTipo = !filterTipo || acao.tipo === filterTipo;

        // Filtro de status
        const matchesStatus = !filterStatus || acao.status === filterStatus;

        // Filtro de município
        const matchesMunicipio = !filterMunicipio || acao.municipio.toLowerCase().includes(filterMunicipio.toLowerCase());

        // Filtro de estado
        const matchesEstado = !filterEstado || acao.estado.toLowerCase().includes(filterEstado.toLowerCase());

        // Filtro de data início
        const matchesDataInicio = !filterDataInicio || new Date(acao.data_inicio) >= new Date(filterDataInicio);

        // Filtro de data fim
        const matchesDataFim = !filterDataFim || new Date(acao.data_fim) <= new Date(filterDataFim);

        // Filtro de custo mínimo
        const custo = acao.resumo_financeiro?.custo_total || 0;
        const matchesCustoMin = !filterCustoMin || custo >= parseFloat(filterCustoMin);

        // Filtro de custo máximo
        const matchesCustoMax = !filterCustoMax || custo <= parseFloat(filterCustoMax);

        return matchesNumeroAcao && matchesTipo && matchesStatus && matchesMunicipio && matchesEstado &&
            matchesDataInicio && matchesDataFim && matchesCustoMin && matchesCustoMax;
    });

    const clearFilters = () => {
        setFilterNumeroAcao('');
        setFilterTipo('');
        setFilterStatus('');
        setFilterMunicipio('');
        setFilterEstado('');
        setFilterDataInicio('');
        setFilterDataFim('');
        setFilterCustoMin('');
        setFilterCustoMax('');
    };

    const hasActiveFilters = filterNumeroAcao || filterTipo || filterStatus || filterMunicipio || filterEstado ||
        filterDataInicio || filterDataFim || filterCustoMin || filterCustoMax;

    const activeFilterCount = [filterNumeroAcao, filterTipo, filterStatus, filterMunicipio, filterEstado,
        filterDataInicio, filterDataFim, filterCustoMin, filterCustoMax].filter(Boolean).length;

    const totalCusto = filteredAcoes.reduce((acc, acao: any) => acc + (acao.resumo_financeiro?.custo_total || 0), 0);
    const totalAtendidos = filteredAcoes.reduce((acc, acao: any) => acc + (acao.resumo_financeiro?.atendidos || 0), 0);

    // Dados para o gráfico de barras (Custo por Município) - AGRUPADO COM DETALHES
    const custoPorMunicipio = filteredAcoes.reduce((acc: any, acao: any) => {
        const key = acao.municipio;
        if (!acc[key]) {
            acc[key] = {
                name: key,
                custo: 0,
                atendidos: 0,
                acoes: [] // Array para armazenar detalhes de cada ação
            };
        }
        acc[key].custo += acao.resumo_financeiro?.custo_total || 0;
        acc[key].atendidos += acao.resumo_financeiro?.atendidos || 0;
        acc[key].acoes.push({
            descricao: acao.descricao || 'Ação Carreta',
            tipo: acao.tipo,
            custo: acao.resumo_financeiro?.custo_total || 0
        });
        return acc;
    }, {});

    const dataCustos = Object.values(custoPorMunicipio);

    // Dados para o gráfico de pizza (Distribuição de Atendimentos por STATUS)
    const atendimentosPorStatus = inscricoes.reduce((acc: any, inscricao: any) => {
        const status = inscricao.status || 'pendente';
        const statusKey = status === 'atendido' ? 'atendidos' : status === 'faltou' ? 'faltou' : 'pendentes';

        if (!acc[statusKey]) {
            acc[statusKey] = 0;
        }
        acc[statusKey]++;
        return acc;
    }, {});

    const dataAtendimentos = [
        { name: 'Atendidos', value: atendimentosPorStatus.atendidos || 0, color: STATUS_COLORS.atendidos },
        { name: 'Pendentes', value: atendimentosPorStatus.pendentes || 0, color: STATUS_COLORS.pendentes },
        { name: 'Faltou', value: atendimentosPorStatus.faltou || 0, color: STATUS_COLORS.faltou }
    ].filter(item => item.value > 0);

    // Dados para o gráfico de rosca (Distribuição de Custos por Categoria)
    const custoPorCategoria = filteredAcoes.reduce((acc: any, acao: any) => {
        const custoAbastecimentos = acao.resumo_financeiro?.custo_abastecimentos || 0;
        const custoFuncionarios = acao.resumo_financeiro?.custo_funcionarios || 0;
        const custoTotal = acao.resumo_financeiro?.custo_total || 0;
        const outros = custoTotal - custoAbastecimentos - custoFuncionarios;

        acc.combustivel += custoAbastecimentos;
        acc.funcionarios += custoFuncionarios;
        acc.outros += outros > 0 ? outros : 0;

        return acc;
    }, { combustivel: 0, funcionarios: 0, outros: 0 });

    console.log('💰 Custos por categoria:', {
        combustivel: custoPorCategoria.combustivel,
        funcionarios: custoPorCategoria.funcionarios,
        outros: custoPorCategoria.outros
    });

    // Debug: mostrar estrutura de uma ação
    if (filteredAcoes.length > 0) {
        console.log('📋 Exemplo de ação:', {
            descricao: filteredAcoes[0].descricao,
            resumo_financeiro: filteredAcoes[0].resumo_financeiro
        });
    }

    const dataCustosCategoria = [
        { name: 'Combustível', value: custoPorCategoria.combustivel, color: '#FF6B6B' },
        { name: 'Funcionários', value: custoPorCategoria.funcionarios, color: '#4ECDC4' },
        { name: 'Outros', value: custoPorCategoria.outros, color: '#95E1D3' }
    ].filter(item => item.value > 0);

    // Dados para o gráfico de barras horizontais (Top 10 Cursos/Exames)
    // Criar mapa de acao_curso_id para nome do curso
    const acaoCursoMap = new Map();
    acoes.forEach((acao: any) => {
        if (acao.cursos_exames && Array.isArray(acao.cursos_exames)) {
            acao.cursos_exames.forEach((ce: any) => {
                // A estrutura correta é: ce.id (AcaoCursoExame.id) e ce.curso_exame.nome
                if (ce.id && ce.curso_exame) {
                    acaoCursoMap.set(ce.id, ce.curso_exame.nome || 'Curso sem nome');
                }
            });
        }
    });

    const inscricoesPorCurso = inscricoes.reduce((acc: any, inscricao: any) => {
        const acaoCursoId = inscricao.acao_curso_id;
        const nomeCurso = acaoCursoMap.get(acaoCursoId) || `Curso ${acaoCursoId}`;

        if (!acc[nomeCurso]) {
            acc[nomeCurso] = 0;
        }
        acc[nomeCurso]++;
        return acc;
    }, {});

    const dataTopCursos = Object.entries(inscricoesPorCurso)
        .map(([name, inscricoes]) => ({
            name: name.length > 40 ? name.substring(0, 37) + '...' : name,
            inscricoes: inscricoes as number
        }))
        .sort((a, b) => b.inscricoes - a.inscricoes)
        .slice(0, 10);


    // Tooltip customizado para mostrar detalhes das ações
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <Paper sx={{ p: 2, maxWidth: 400, boxShadow: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {data.name}
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>
                        Total: R$ {data.custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Detalhamento por Ação:
                    </Typography>
                    {data.acoes && data.acoes.map((acao: any, index: number) => (
                        <Box key={index} sx={{ mb: 1, pl: 1, borderLeft: '3px solid', borderColor: acao.tipo === 'curso' ? 'primary.main' : 'secondary.main' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {acao.descricao}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Tipo: {acao.tipo.toUpperCase()} • R$ {acao.custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </Typography>
                        </Box>
                    ))}
                </Paper>
            );
        }
        return null;
    };

    if (loading) return <Typography sx={{ p: 4 }}>Carregando indicadores de BI...</Typography>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Relatórios e Business Intelligence
            </Typography>

            {/* Painel de Filtros */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Button
                        startIcon={<FilterIcon />}
                        onClick={() => setShowFilters(!showFilters)}
                        variant={showFilters ? 'contained' : 'outlined'}
                        size="medium"
                    >
                        Filtros Avançados
                        {hasActiveFilters && ` (${activeFilterCount})`}
                    </Button>
                    {hasActiveFilters && (
                        <Button
                            startIcon={<ClearIcon />}
                            onClick={clearFilters}
                            size="medium"
                            color="secondary"
                        >
                            Limpar Filtros
                        </Button>
                    )}
                </Box>

                <Collapse in={showFilters}>
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                            Filtrar Dados de BI
                        </Typography>
                        <Grid container spacing={2}>
                            {/* Número da Ação */}
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Número da Ação"
                                    value={filterNumeroAcao}
                                    onChange={(e) => setFilterNumeroAcao(e.target.value)}
                                    size="small"
                                    placeholder="Ex: 123"
                                />
                            </Grid>

                            {/* Tipo */}
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Tipo de Ação"
                                    value={filterTipo}
                                    onChange={(e) => setFilterTipo(e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    <MenuItem value="curso">Curso</MenuItem>
                                    <MenuItem value="saude">Saúde</MenuItem>
                                </TextField>
                            </Grid>

                            {/* Status */}
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

                            {/* Município */}
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

                            {/* Estado */}
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

                            {/* Data Início */}
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

                            {/* Data Fim */}
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

                            {/* Custo Mínimo */}
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Custo Mínimo (R$)"
                                    value={filterCustoMin}
                                    onChange={(e) => setFilterCustoMin(e.target.value)}
                                    size="small"
                                    placeholder="0"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                                    }}
                                />
                            </Grid>

                            {/* Custo Máximo */}
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Custo Máximo (R$)"
                                    value={filterCustoMax}
                                    onChange={(e) => setFilterCustoMax(e.target.value)}
                                    size="small"
                                    placeholder="999999"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Collapse>

                {/* Indicador de Resultados */}
                {hasActiveFilters && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            📊 Mostrando {filteredAcoes.length} de {acoes.length} ações
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* Cards de Resumo */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'primary.main', color: 'white', boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>Custo Total Acumulado</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                R$ {totalCusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'success.main', color: 'white', boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>Total de Atendimentos</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{totalAtendidos}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'warning.main', color: 'white', boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>Custo Médio por Pessoa</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                R$ {totalAtendidos > 0 ? (totalCusto / totalAtendidos).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Gráfico de Barras: Custos e Atendimentos */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, height: 400, boxShadow: 2 }}>
                        <Typography variant="h6" gutterBottom>Comparativo de Custos por Município</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={dataCustos}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    interval={0}
                                    tick={{ fontSize: 11 }}
                                />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="custo" name="Custo Total (R$)" fill="#1976d2" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Gráfico de Pizza: Distribuição de Atendimentos */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: 400, boxShadow: 2 }}>
                        <Typography variant="h6" gutterBottom>Distribuição de Atendimentos</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={dataAtendimentos}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    label={({ cx, cy, midAngle, outerRadius, percent, name }) => {
                                        const RADIAN = Math.PI / 180;
                                        const radius = outerRadius + 25;
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                        return (
                                            <text
                                                x={x}
                                                y={y}
                                                fill="black"
                                                textAnchor={x > cx ? 'start' : 'end'}
                                                dominantBaseline="central"
                                                style={{ fontSize: '13px', fontWeight: 500 }}
                                            >
                                                {`${name}: ${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        );
                                    }}
                                    outerRadius={70}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {dataAtendimentos.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Nova Linha de Gráficos: Distribuição de Custos e Top Cursos */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Gráfico de Rosca: Distribuição de Custos por Categoria */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 3, height: 400, boxShadow: 2 }}>
                        <Typography variant="h6" gutterBottom>Distribuição de Custos</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={dataCustosCategoria}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    labelLine={true}
                                    label={({ cx, cy, midAngle, outerRadius, percent, name }) => {
                                        const RADIAN = Math.PI / 180;
                                        const radius = outerRadius + 30;
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                        return (
                                            <text
                                                x={x}
                                                y={y}
                                                fill="black"
                                                textAnchor={x > cx ? 'start' : 'end'}
                                                dominantBaseline="central"
                                                style={{ fontSize: '13px', fontWeight: 500 }}
                                            >
                                                {`${name}: ${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        );
                                    }}
                                    dataKey="value"
                                >
                                    {dataCustosCategoria.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Gráfico de Barras Horizontais: Top 10 Cursos/Exames */}
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 3, height: 400, boxShadow: 2 }}>
                        <Typography variant="h6" gutterBottom>Top 10 Cursos/Exames Mais Procurados</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart
                                data={dataTopCursos}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={150}
                                    tick={{ fontSize: 11 }}
                                />
                                <Tooltip />
                                <Bar dataKey="inscricoes" name="Inscrições" fill="#8884d8">
                                    {dataTopCursos.map((_entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={`hsl(${index * 36}, 70%, 60%)`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            <Typography variant="h5" gutterBottom sx={{ mt: 4, fontWeight: 'medium' }}>
                Detalhamento Analítico por Ação
            </Typography>
            <Paper sx={{ boxShadow: 2, overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.100' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Ação / Descrição</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Município</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Custo Total</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Atendidos</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Custo/Pessoa</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAcoes.map((acao: any) => (
                            <TableRow key={acao.id} hover>
                                <TableCell>{acao.descricao || 'Ação Carreta'}</TableCell>
                                <TableCell>{acao.municipio} - {acao.estado}</TableCell>
                                <TableCell align="right">
                                    R$ {acao.resumo_financeiro?.custo_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell align="right">{acao.resumo_financeiro?.atendidos}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    R$ {acao.resumo_financeiro?.custo_por_pessoa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredAcoes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary">
                                        {hasActiveFilters
                                            ? 'Nenhuma ação encontrada com os filtros aplicados.'
                                            : 'Nenhuma ação encontrada para análise.'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Container>
    );
};

export default Relatorios;


