import { Container, Typography, Grid, Card, CardContent, CardActions, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    Assignment as AssignmentIcon,
    Business as BusinessIcon,
    LocalShipping as TruckIcon,
    People as PeopleIcon,
    BarChart as ChartIcon,
} from '@mui/icons-material';

const Dashboard = () => {
    const navigate = useNavigate();

    const menuItems = [
        {
            title: 'Gerenciar Ações',
            description: 'Visualize e gerencie todas as ações cadastradas',
            icon: <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
            path: '/admin/acoes',
            buttonText: 'Ver Ações'
        },
        {
            title: 'Nova Ação',
            description: 'Cadastre uma nova ação de curso ou saúde',
            icon: <AssignmentIcon sx={{ fontSize: 40, color: 'success.main' }} />,
            path: '/admin/acoes/nova',
            buttonText: 'Criar Ação'
        },
        {
            title: 'Nova Instituição',
            description: 'Cadastre uma nova instituição parceira',
            icon: <BusinessIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
            path: '/admin/instituicoes/nova',
            buttonText: 'Criar Instituição'
        },
        {
            title: 'Gerenciar Caminhões',
            description: 'Cadastre e gerencie as unidades móveis (carretas)',
            icon: <TruckIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
            path: '/admin/caminhoes',
            buttonText: 'Ver Caminhões'
        },
        {
            title: 'Gerenciar Funcionários',
            description: 'Cadastre instrutores, médicos e equipe técnica',
            icon: <PeopleIcon sx={{ fontSize: 40, color: 'info.main' }} />,
            path: '/admin/funcionarios',
            buttonText: 'Ver Funcionários'
        },
        {
            title: 'Relatórios e BI',
            description: 'Análise de custos, atendimentos e indicadores',
            icon: <ChartIcon sx={{ fontSize: 40, color: 'error.main' }} />,
            path: '/admin/relatorios',
            buttonText: 'Ver Relatórios'
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Painel Administrativo
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Bem-vindo ao painel de administração do Sistema Carretas
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                {menuItems.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                '&:hover': {
                                    boxShadow: 6,
                                    transform: 'translateY(-4px)',
                                    transition: 'all 0.3s'
                                }
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ mb: 2 }}>
                                    {item.icon}
                                </Box>
                                <Typography variant="h6" gutterBottom>
                                    {item.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {item.description}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => navigate(item.path)}
                                >
                                    {item.buttonText}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Dashboard;
