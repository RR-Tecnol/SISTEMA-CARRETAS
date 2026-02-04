import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, Box, Chip } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import api from '../../services/api';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [noticias, setNoticias] = useState<any[]>([]);
    const [acoes, setAcoes] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [noticiasRes, acoesRes] = await Promise.all([
                api.get('/noticias?destaque=true'),
                api.get('/acoes'),
            ]);

            setNoticias(noticiasRes.data.slice(0, 3));
            setAcoes(acoesRes.data.slice(0, 6));
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const getAcaoTitle = (acao: any): string => {
        // Se tem descrição preenchida, usa ela
        if (acao.descricao && acao.descricao.trim()) {
            return acao.descricao;
        }

        // Se tem cursos/exames vinculados, mostra o nome deles
        if (acao.cursos_exames && acao.cursos_exames.length > 0) {
            const nomes = acao.cursos_exames
                .map((ce: any) => ce.curso_exame?.nome)
                .filter((nome: string) => nome);

            if (nomes.length > 0) {
                // Se tem vários, mostra o primeiro + contador
                if (nomes.length > 1) {
                    return `${nomes[0]} (+${nomes.length - 1})`;
                }
                return nomes[0];
            }
        }

        // Fallback genérico
        return `Ação de ${acao.tipo === 'curso' ? 'Curso' : 'Saúde'} - ${acao.municipio}/${acao.estado}`;
    };

    const handleInscreverClick = () => {
        if (isAuthenticated) {
            // Se logado, vai para a página de ações disponíveis no portal
            navigate('/portal/acoes');
        } else {
            // Se não logado, vai para o cadastro
            navigate('/cadastro');
        }
    };

    return (
        <Box>
            {/* Hero Section */}
            <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
                <Container>
                    <Typography variant="h2" gutterBottom>
                        Bem-vindo ao Sistema Carretas
                    </Typography>
                    <Typography variant="h5" paragraph>
                        Acesso gratuito a cursos profissionalizantes e exames de saúde
                    </Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        component={RouterLink}
                        to="/cadastro"
                    >
                        Cadastre-se
                    </Button>

                </Container>
            </Box>

            {/* Ações em Destaque */}
            <Container sx={{ py: 6 }}>
                <Typography variant="h4" gutterBottom>
                    Ações Próximas
                </Typography>

                <Grid container spacing={3} sx={{ mt: 2 }}>
                    {acoes.length > 0 ? (
                        acoes.map((acao) => (
                            <Grid item xs={12} md={4} key={acao.id}>
                                <Card>
                                    <CardContent>
                                        <Chip
                                            label={acao.tipo === 'curso' ? 'Curso' : 'Saúde'}
                                            color={acao.tipo === 'curso' ? 'primary' : 'success'}
                                            size="small"
                                            sx={{ mb: 1 }}
                                        />
                                        <Typography variant="h6" gutterBottom>
                                            {getAcaoTitle(acao)}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {acao.municipio} - {acao.estado}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(acao.data_inicio).toLocaleDateString()} a{' '}
                                                {new Date(acao.data_fim).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            color="primary"
                                            onClick={handleInscreverClick}
                                        >
                                            Inscrever-se
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Typography variant="body1" color="text.secondary" align="center">
                                Nenhuma ação disponível no momento
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Container>

            {/* Notícias */}
            {noticias.length > 0 && (
                <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
                    <Container>
                        <Typography variant="h4" gutterBottom>
                            Notícias
                        </Typography>

                        <Grid container spacing={3} sx={{ mt: 2 }}>
                            {noticias.map((noticia) => (
                                <Grid item xs={12} md={4} key={noticia.id}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {noticia.titulo}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {noticia.conteudo.substring(0, 150)}...
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </Box>
            )}
        </Box>
    );
};

export default Home;
