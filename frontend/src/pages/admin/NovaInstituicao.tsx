import { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

const NovaInstituicao = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        razao_social: '',
        cnpj: '',
        responsavel_nome: '',
        responsavel_email: '',
        responsavel_tel: '',
        endereco_completo: '',
    });

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
            await api.post('/instituicoes', formData);
            enqueueSnackbar('Instituição criada com sucesso!', { variant: 'success' });
            navigate('/admin/acoes/nova');
        } catch (error: any) {
            enqueueSnackbar(
                error.response?.data?.error || 'Erro ao criar instituição',
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Nova Instituição
                </Typography>

                <Typography variant="body2" color="text.secondary" paragraph>
                    Cadastre uma instituição para poder criar ações
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
                            onClick={() => navigate('/admin/acoes/nova')}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Criar Instituição'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default NovaInstituicao;
