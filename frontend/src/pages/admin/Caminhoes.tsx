import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
    IconButton, Chip
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import api from '../../services/api';
import { useSnackbar } from 'notistack';

const Caminhoes: React.FC = () => {
    const [caminhoes, setCaminhoes] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [formData, setFormData] = useState<{
        placa: string; modelo: string; ano: number;
        autonomia_km_litro: number; status: string
    }>({
        placa: '', modelo: '', ano: new Date().getFullYear(),
        autonomia_km_litro: 0, status: 'disponivel'
    });
    const { enqueueSnackbar } = useSnackbar();

    const fetchCaminhoes = useCallback(async () => {
        try {
            const response = await api.get('/caminhoes');
            setCaminhoes(response.data);
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.error || 'Erro ao carregar caminhões', { variant: 'error' });
        }
    }, [enqueueSnackbar]);

    useEffect(() => { fetchCaminhoes(); }, [fetchCaminhoes]);

    const handleSubmit = async () => {
        try {
            if (editMode && selectedId) {
                await api.put(`/caminhoes/${selectedId}`, formData);
                enqueueSnackbar('Caminhão atualizado com sucesso!', { variant: 'success' });
            } else {
                await api.post('/caminhoes', formData);
                enqueueSnackbar('Caminhão cadastrado com sucesso!', { variant: 'success' });
            }
            setOpen(false);
            resetForm();
            fetchCaminhoes();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.error || 'Erro ao salvar caminhão', { variant: 'error' });
        }
    };

    const handleEdit = (caminhao: any) => {
        setEditMode(true);
        setSelectedId(caminhao.id);
        setFormData({
            placa: caminhao.placa,
            modelo: caminhao.modelo,
            ano: caminhao.ano,
            autonomia_km_litro: caminhao.autonomia_km_litro || 0,
            status: caminhao.status,
        });
        setOpen(true);
    };

    const resetForm = () => {
        setEditMode(false);
        setSelectedId(null);
        setFormData({
            placa: '', modelo: '', ano: new Date().getFullYear(),
            autonomia_km_litro: 0, status: 'disponivel'
        });
    };

    const handleClose = () => {
        setOpen(false);
        resetForm();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'disponivel': return 'success';
            case 'em_manutencao': return 'warning';
            case 'em_acao': return 'primary';
            default: return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'disponivel': return 'Disponível';
            case 'em_manutencao': return 'Em Manutenção';
            case 'em_acao': return 'Em Ação';
            default: return status;
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>Gerenciar Caminhões</Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={() => {
                    resetForm();
                    setOpen(true);
                }}
                sx={{ mb: 2 }}
            >
                Novo Caminhão
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Placa</TableCell>
                            <TableCell>Modelo</TableCell>
                            <TableCell>Ano</TableCell>
                            <TableCell>Autonomia (km/l)</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {caminhoes.map((c: any) => (
                            <TableRow key={c.id}>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>{c.placa}</TableCell>
                                <TableCell>{c.modelo}</TableCell>
                                <TableCell>{c.ano}</TableCell>
                                <TableCell>{c.autonomia_km_litro || '-'} km/l</TableCell>
                                <TableCell>
                                    <Chip
                                        label={getStatusLabel(c.status)}
                                        color={getStatusColor(c.status) as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => handleEdit(c)}
                                        title="Editar caminhão"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editMode ? 'Editar Caminhão' : 'Novo Caminhão'}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Placa"
                        margin="normal"
                        value={formData.placa}
                        onChange={e => setFormData({ ...formData, placa: e.target.value })}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Modelo"
                        margin="normal"
                        value={formData.modelo}
                        onChange={e => setFormData({ ...formData, modelo: e.target.value })}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Ano"
                        type="number"
                        margin="normal"
                        value={formData.ano}
                        onChange={e => setFormData({ ...formData, ano: parseInt(e.target.value) })}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Autonomia (km/litro)"
                        type="number"
                        margin="normal"
                        value={formData.autonomia_km_litro}
                        onChange={e => setFormData({ ...formData, autonomia_km_litro: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                        helperText="Ex: 8.5 km por litro"
                        required
                        inputProps={{ step: "0.1", min: "0" }}
                        onFocus={e => e.target.select()}
                    />
                    <TextField
                        fullWidth
                        select
                        label="Status"
                        margin="normal"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                        <MenuItem value="disponivel">Disponível</MenuItem>
                        <MenuItem value="em_manutencao">Em Manutenção</MenuItem>
                        <MenuItem value="em_acao">Em Ação</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} color="primary" variant="contained">
                        {editMode ? 'Atualizar' : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Caminhoes;
