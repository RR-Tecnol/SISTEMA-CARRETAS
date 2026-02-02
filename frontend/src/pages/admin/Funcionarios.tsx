import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import api from '../../services/api';

const Funcionarios: React.FC = () => {
    const [funcionarios, setFuncionarios] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        nome: '', cargo: '', especialidade: '', custo_diario: 0, status: 'ativo'
    });

    const fetchFuncionarios = async () => {
        const response = await api.get('/funcionarios');
        setFuncionarios(response.data);
    };

    useEffect(() => { fetchFuncionarios(); }, []);

    const handleOpen = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({ nome: '', cargo: '', especialidade: '', custo_diario: 0, status: 'ativo' });
        setOpen(true);
    };

    const handleEdit = (funcionario: any) => {
        setIsEditing(true);
        setEditingId(funcionario.id);
        setFormData({
            nome: funcionario.nome,
            cargo: funcionario.cargo,
            especialidade: funcionario.especialidade || '',
            custo_diario: funcionario.custo_diario,
            status: funcionario.status
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setIsEditing(false);
        setEditingId(null);
        setFormData({ nome: '', cargo: '', especialidade: '', custo_diario: 0, status: 'ativo' });
    };

    const handleSubmit = async () => {
        try {
            if (isEditing && editingId) {
                await api.put(`/funcionarios/${editingId}`, formData);
            } else {
                await api.post('/funcionarios', formData);
            }
            handleClose();
            fetchFuncionarios();
        } catch (error) {
            console.error('Erro ao salvar funcionário:', error);
        }
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Gerenciar Funcionários</Typography>
            <Button variant="contained" color="primary" onClick={handleOpen} sx={{ mb: 2 }}>
                Novo Funcionário
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nome</TableCell>
                            <TableCell>Cargo</TableCell>
                            <TableCell>Especialidade</TableCell>
                            <TableCell>Custo por Ação</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {funcionarios.map((f: any) => (
                            <TableRow key={f.id}>
                                <TableCell>{f.nome}</TableCell>
                                <TableCell>{f.cargo}</TableCell>
                                <TableCell>{f.especialidade}</TableCell>
                                <TableCell>R$ {Number(f.custo_diario || 0).toFixed(2)}</TableCell>
                                <TableCell>{f.status}</TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        color="primary"
                                        size="small"
                                        onClick={() => handleEdit(f)}
                                        title="Editar funcionário"
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
                <DialogTitle>{isEditing ? 'Editar Funcionário' : 'Novo Funcionário'}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Nome"
                        margin="normal"
                        value={formData.nome}
                        onChange={e => setFormData({ ...formData, nome: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Cargo"
                        margin="normal"
                        value={formData.cargo}
                        onChange={e => setFormData({ ...formData, cargo: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Especialidade"
                        margin="normal"
                        value={formData.especialidade}
                        onChange={e => setFormData({ ...formData, especialidade: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Custo por Ação"
                        type="number"
                        margin="normal"
                        value={formData.custo_diario}
                        onChange={e => setFormData({ ...formData, custo_diario: parseFloat(e.target.value) || 0 })}
                        inputProps={{ step: '0.01', min: '0' }}
                    />
                    <TextField
                        fullWidth
                        select
                        label="Status"
                        margin="normal"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                        <MenuItem value="ativo">Ativo</MenuItem>
                        <MenuItem value="inativo">Inativo</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {isEditing ? 'Atualizar' : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Funcionarios;
