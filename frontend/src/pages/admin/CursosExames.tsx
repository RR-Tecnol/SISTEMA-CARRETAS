import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Box,
    Chip,
    CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

interface CursoExame {
    id: string;
    nome: string;
    tipo: 'curso' | 'exame';
    created_at: string;
}

const CursosExames: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [cursosExames, setCursosExames] = useState<CursoExame[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form fields
    const [nome, setNome] = useState('');
    const [tipo, setTipo] = useState<'curso' | 'exame'>('curso');

    const fetchCursosExames = async () => {
        try {
            setLoading(true);
            const response = await api.get('/cursos-exames');
            setCursosExames(response.data);
        } catch (error) {
            console.error('Erro ao buscar cursos/exames:', error);
            enqueueSnackbar('Erro ao carregar cursos/exames', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCursosExames();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOpenDialog = (cursoExame?: CursoExame) => {
        if (cursoExame) {
            setEditingId(cursoExame.id);
            setNome(cursoExame.nome);
            setTipo(cursoExame.tipo);
        } else {
            setEditingId(null);
            setNome('');
            setTipo('curso');
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingId(null);
        setNome('');
        setTipo('curso');
    };

    const handleSubmit = async () => {
        if (!nome.trim()) {
            enqueueSnackbar('Nome é obrigatório', { variant: 'warning' });
            return;
        }

        try {
            if (editingId) {
                await api.put(`/cursos-exames/${editingId}`, { nome, tipo });
                enqueueSnackbar('Curso/Exame atualizado com sucesso!', { variant: 'success' });
            } else {
                await api.post('/cursos-exames', { nome, tipo });
                enqueueSnackbar('Curso/Exame cadastrado com sucesso!', { variant: 'success' });
            }
            handleCloseDialog();
            fetchCursosExames();
        } catch (error: any) {
            console.error('Erro ao salvar curso/exame:', error);
            enqueueSnackbar(
                error.response?.data?.message || 'Erro ao salvar curso/exame',
                { variant: 'error' }
            );
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este curso/exame?')) {
            return;
        }

        try {
            await api.delete(`/cursos-exames/${id}`);
            enqueueSnackbar('Curso/Exame excluído com sucesso!', { variant: 'success' });
            fetchCursosExames();
        } catch (error: any) {
            console.error('Erro ao excluir curso/exame:', error);
            enqueueSnackbar(
                error.response?.data?.message || 'Erro ao excluir curso/exame',
                { variant: 'error' }
            );
        }
    };

    const getTipoColor = (tipo: 'curso' | 'exame') => {
        return tipo === 'curso' ? 'primary' : 'secondary';
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1">
                    Gerenciar Cursos e Exames
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                >
                    Novo Curso/Exame
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nome</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Data de Cadastro</TableCell>
                                <TableCell align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cursosExames.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        <Typography color="text.secondary" sx={{ py: 4 }}>
                                            Nenhum curso/exame cadastrado ainda.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                cursosExames.map((item) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>{item.nome}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={item.tipo.toUpperCase()}
                                                color={getTipoColor(item.tipo)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {item.created_at
                                                ? new Date(item.created_at).toLocaleDateString('pt-BR')
                                                : '-'}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenDialog(item)}
                                                color="primary"
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(item.id)}
                                                color="error"
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Dialog para Criar/Editar */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingId ? 'Editar Curso/Exame' : 'Novo Curso/Exame'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Nome do Curso/Exame"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Ex: Informática Básica, Hemograma Completo"
                            required
                        />
                        <TextField
                            select
                            fullWidth
                            label="Tipo"
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value as 'curso' | 'exame')}
                            required
                        >
                            <MenuItem value="curso">Curso</MenuItem>
                            <MenuItem value="exame">Exame</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingId ? 'Salvar' : 'Cadastrar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CursosExames;
