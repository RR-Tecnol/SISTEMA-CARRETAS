import { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    MenuItem,
    Box,
    CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

interface Instituicao {
    id: string;
    razao_social: string;
}

const NovaAcao = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const [loading, setLoading] = useState(false);
    const [loadingInstituicoes, setLoadingInstituicoes] = useState(true);
    const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);

    const [formData, setFormData] = useState({
        instituicao_id: '',
        tipo: 'curso' as 'curso' | 'saude',
        municipio: '',
        estado: '',
        data_inicio: '',
        data_fim: '',
        status: 'planejada' as 'planejada' | 'ativa' | 'concluida',
        descricao: '',
        local_execucao: '',
        vagas_disponiveis: 0,
    });

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
            setLoadingInstituicoes(false);
        }
    }, [enqueueSnackbar]);

    useEffect(() => {
        loadInstituicoes();
    }, [loadInstituicoes]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'vagas_disponiveis' ? parseInt(value) || 0 : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.instituicao_id) {
            enqueueSnackbar('Selecione uma instituição', { variant: 'error' });
            return;
        }

        setLoading(true);
        try {
            await api.post('/acoes', formData);
            enqueueSnackbar('Ação criada com sucesso!', { variant: 'success' });
            navigate('/admin/acoes');
        } catch (error: any) {
            enqueueSnackbar(
                error.response?.data?.error || 'Erro ao criar ação',
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
    };

    const estados = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];

    if (loadingInstituicoes) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (instituicoes.length === 0) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        Nenhuma instituição cadastrada
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                        Você precisa cadastrar pelo menos uma instituição antes de criar ações.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/admin/instituicoes/nova')}
                    >
                        Cadastrar Instituição
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Nova Ação
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                select
                                fullWidth
                                label="Instituição"
                                name="instituicao_id"
                                value={formData.instituicao_id}
                                onChange={handleChange}
                            >
                                {instituicoes.map((inst) => (
                                    <MenuItem key={inst.id} value={inst.id}>
                                        {inst.razao_social}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                select
                                fullWidth
                                label="Tipo"
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                            >
                                <MenuItem value="curso">Curso</MenuItem>
                                <MenuItem value="saude">Saúde</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                select
                                fullWidth
                                label="Status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <MenuItem value="planejada">Planejada</MenuItem>
                                <MenuItem value="ativa">Ativa</MenuItem>
                                <MenuItem value="concluida">Concluída</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={8}>
                            <TextField
                                required
                                fullWidth
                                label="Município"
                                name="municipio"
                                value={formData.municipio}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                required
                                select
                                fullWidth
                                label="Estado"
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                            >
                                {estados.map((uf) => (
                                    <MenuItem key={uf} value={uf}>
                                        {uf}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                type="date"
                                label="Data Início"
                                name="data_inicio"
                                value={formData.data_inicio}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                type="date"
                                label="Data Fim"
                                name="data_fim"
                                value={formData.data_fim}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Local de Execução"
                                name="local_execucao"
                                value={formData.local_execucao}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                type="number"
                                label="Vagas Disponíveis"
                                name="vagas_disponiveis"
                                value={formData.vagas_disponiveis}
                                onChange={handleChange}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Descrição"
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/admin/acoes')}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Criar Ação'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default NovaAcao;
