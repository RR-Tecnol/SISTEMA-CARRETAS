import { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Box,
    CircularProgress,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

const NovaInstituicao = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(!!id);

    const [formData, setFormData] = useState({
        razao_social: '',
        cnpj: '',
        responsavel_nome: '',
        responsavel_email: '',
        responsavel_tel: '',
        endereco_completo: '',
    });

    const loadInstituicao = useCallback(async () => {
        if (!id) return;

        try {
            const response = await api.get(`/instituicoes/${id}`);
            setFormData(response.data);
        } catch (error: any) {
            enqueueSnackbar(
                error.response?.data?.error || 'Erro ao carregar instituição',
                { variant: 'error' }
            );
            navigate('/admin/instituicoes');
        } finally {
            setLoadingData(false);
        }
    }, [id, enqueueSnackbar, navigate]);

    useEffect(() => {
        loadInstituicao();
    }, [loadInstituicao]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        try {
            if (id) {
                await api.put(`/instituicoes/${id}`, formData);
                enqueueSnackbar('Instituição atualizada com sucesso!', { variant: 'success' });
            } else {
                await api.post('/instituicoes', formData);
                enqueueSnackbar('Instituição criada com sucesso!', { variant: 'success' });
            }
            navigate('/admin/instituicoes');
        } catch (error: any) {
            enqueueSnackbar(
                error.response?.data?.error || `Erro ao ${id ? 'atualizar' : 'criar'} instituição`,
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
    };


    if (loadingData) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {id ? 'Editar Instituição' : 'Nova Instituição'}
                </Typography>

                <Typography variant="body2" color="text.secondary" paragraph>
                    {id ? 'Atualize as informações da instituição' : 'Cadastre uma instituição para poder criar ações'}
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                required
                                fullWidth
                                label="Razão Social"
                                name="razao_social"
                                value={formData.razao_social}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                required
                                fullWidth
                                label="CNPJ"
                                name="cnpj"
                                value={formData.cnpj}
                                onChange={handleChange}
                                placeholder="00.000.000/0000-00"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Nome do Responsável"
                                name="responsavel_nome"
                                value={formData.responsavel_nome}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                type="email"
                                label="E-mail do Responsável"
                                name="responsavel_email"
                                value={formData.responsavel_email}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Telefone do Responsável"
                                name="responsavel_tel"
                                value={formData.responsavel_tel}
                                onChange={handleChange}
                                placeholder="(00) 00000-0000"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                multiline
                                rows={3}
                                label="Endereço Completo"
                                name="endereco_completo"
                                value={formData.endereco_completo}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/admin/instituicoes')}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : id ? 'Atualizar Instituição' : 'Criar Instituição'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default NovaInstituicao;
