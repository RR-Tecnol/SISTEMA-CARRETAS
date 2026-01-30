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
    Tabs,
    Tab,
    Card,
    CardContent,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

interface Instituicao {
    id: string;
    razao_social: string;
}

interface Acao {
    id: string;
    instituicao_id: string;
    tipo: 'curso' | 'saude';
    municipio: string;
    estado: string;
    data_inicio: string;
    data_fim: string;
    status: 'planejada' | 'ativa' | 'concluida';
    descricao?: string;
    local_execucao: string;
    vagas_disponiveis: number;
    campos_customizados?: Record<string, any>;
}

const GerenciarAcao = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
    const [formData, setFormData] = useState<Acao | null>(null);

    const loadData = useCallback(async () => {
        try {
            const [acaoResponse, instituicoesResponse] = await Promise.all([
                api.get(`/acoes/${id}`),
                api.get('/instituicoes'),
            ]);

            setFormData(acaoResponse.data);
            setInstituicoes(instituicoesResponse.data);
        } catch (error: any) {
            enqueueSnackbar(
                error.response?.data?.error || 'Erro ao carregar dados',
                { variant: 'error' }
            );
            navigate('/admin/acoes');
        } finally {
            setLoadingData(false);
        }
    }, [id, enqueueSnackbar, navigate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formData) return;

        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'vagas_disponiveis' ? parseInt(value) || 0 : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        setLoading(true);
        try {
            await api.put(`/acoes/${id}`, formData);
            enqueueSnackbar('Ação atualizada com sucesso!', { variant: 'success' });
            navigate('/admin/acoes');
        } catch (error: any) {
            enqueueSnackbar(
                error.response?.data?.error || 'Erro ao atualizar ação',
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Tem certeza que deseja excluir esta ação?')) {
            return;
        }

        setLoading(true);
        try {
            await api.delete(`/acoes/${id}`);
            enqueueSnackbar('Ação excluída com sucesso!', { variant: 'success' });
            navigate('/admin/acoes');
        } catch (error: any) {
            enqueueSnackbar(
                error.response?.data?.error || 'Erro ao excluir ação',
                { variant: 'error' }
            );
            setLoading(false);
        }
    };

    const estados = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];

    if (loadingData || !formData) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    const nomeAcao = formData.campos_customizados?.nome || `Ação ${formData.tipo}`;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {nomeAcao}
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                        <Tab label="Informações Básicas" />
                        <Tab label="Recursos" />
                        <Tab label="Inscrições" />
                    </Tabs>
                </Box>

                {activeTab === 0 && (
                    <Box component="form" onSubmit={handleSubmit}>
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
                                    value={formData.data_inicio.split('T')[0]}
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
                                    value={formData.data_fim.split('T')[0]}
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
                                    value={formData.descricao || ''}
                                    onChange={handleChange}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                Excluir Ação
                            </Button>
                            <Box sx={{ display: 'flex', gap: 2 }}>
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
                                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                )}

                {activeTab === 1 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Recursos da Ação
                        </Typography>
                        <Typography color="text.secondary" paragraph>
                            Vincule caminhões, funcionários e cursos/exames a esta ação.
                        </Typography>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">
                                    Funcionalidade em desenvolvimento...
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {activeTab === 2 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Inscrições
                        </Typography>
                        <Typography color="text.secondary" paragraph>
                            Gerencie as inscrições dos cidadãos nesta ação.
                        </Typography>
                        <Card>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">
                                    Funcionalidade em desenvolvimento...
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default GerenciarAcao;
