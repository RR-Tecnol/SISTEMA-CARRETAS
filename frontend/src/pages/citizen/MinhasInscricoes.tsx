import React, { useState, useEffect } from 'react';
import { Container, Typography, Card, CardContent, Grid, Chip, Box, Divider } from '@mui/material';
import api from '../../services/api';

const MinhasInscricoes: React.FC = () => {
    const [inscricoes, setInscricoes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInscricoes = async () => {
            try {
                const response = await api.get('/inscricoes/me');
                setInscricoes(response.data);
            } catch (error) {
                console.error('Erro ao buscar inscrições', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInscricoes();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmado': return 'success';
            case 'inscrito': return 'primary';
            case 'cancelado': return 'error';
            default: return 'default';
        }
    };

    if (loading) return <Typography>Carregando...</Typography>;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>Minhas Inscrições</Typography>
            <Grid container spacing={2}>
                {inscricoes.length === 0 ? (
                    <Grid item xs={12}>
                        <Typography color="text.secondary">Você ainda não possui inscrições.</Typography>
                    </Grid>
                ) : (
                    inscricoes.map((ins: any) => (
                        <Grid item xs={12} key={ins.id}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="h6">{ins.acao_curso?.curso_exame?.nome}</Typography>
                                        <Chip label={ins.status.toUpperCase()} color={getStatusColor(ins.status) as any} size="small" />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Ação: {ins.acao_curso?.acao?.descricao || 'Ação Carreta'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Local: {ins.acao_curso?.acao?.local_execucao}, {ins.acao_curso?.acao?.municipio} - {ins.acao_curso?.acao?.estado}
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="caption" color="text.secondary">
                                        Inscrito em: {new Date(ins.created_at).toLocaleDateString('pt-BR')}
                                    </Typography>
                                    {ins.compareceu && (
                                        <Typography variant="body2" color="success.main" sx={{ mt: 1, fontWeight: 'bold' }}>
                                            ✓ Presença Confirmada
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Container>
    );
};

export default MinhasInscricoes;
