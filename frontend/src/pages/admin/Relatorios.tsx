import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Grid, Card, CardContent, Table,
    TableBody, TableCell, TableHead, TableRow, Paper
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import api from '../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Relatorios: React.FC = () => {
    const [acoes, setAcoes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAcoes = async () => {
            try {
                const response = await api.get('/acoes');
                const acoesComDetalhes = await Promise.all(
                    response.data.map(async (acao: any) => {
                        const detail = await api.get(`/acoes/${acao.id}`);
                        return detail.data;
                    })
                );
                setAcoes(acoesComDetalhes);
            } catch (error) {
                console.error('Erro ao buscar dados de BI', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAcoes();
    }, []);

    const totalCusto = acoes.reduce((acc, acao: any) => acc + (acao.resumo_financeiro?.custo_total || 0), 0);
    const totalAtendidos = acoes.reduce((acc, acao: any) => acc + (acao.resumo_financeiro?.atendidos || 0), 0);

    // Dados para o gráfico de barras (Custo por Município)
    const dataCustos = acoes.map(acao => ({
        name: acao.municipio,
        custo: acao.resumo_financeiro?.custo_total || 0,
        atendidos: acao.resumo_financeiro?.atendidos || 0
    }));

    // Dados para o gráfico de pizza (Distribuição de Atendimentos)
    const dataAtendimentos = acoes.map(acao => ({
        name: acao.municipio,
        value: acao.resumo_financeiro?.atendidos || 0
    })).filter(item => item.value > 0);

    if (loading) return <Typography sx={{ p: 4 }}>Carregando indicadores de BI...</Typography>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Relatórios e Business Intelligence
            </Typography>

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
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`} />
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
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {dataAtendimentos.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
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
                        {acoes.map((acao: any) => (
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
                        {acoes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">Nenhuma ação encontrada para análise.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Container>
    );
};

export default Relatorios;
