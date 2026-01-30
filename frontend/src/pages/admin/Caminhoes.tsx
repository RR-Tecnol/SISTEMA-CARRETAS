import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';
import api from '../../services/api';

const Caminhoes: React.FC = () => {
    const [caminhoes, setCaminhoes] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        placa: '', modelo: '', ano: new Date().getFullYear(),
        capacidade_atendimento: 0, custo_diario: 0, status: 'disponivel'
    });

    const fetchCaminhoes = async () => {
        const response = await api.get('/caminhoes');
        setCaminhoes(response.data);
    };

    useEffect(() => { fetchCaminhoes(); }, []);

    const handleSubmit = async () => {
        await api.post('/caminhoes', formData);
        setOpen(false);
        fetchCaminhoes();
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Gerenciar Caminhões</Typography>
            <Button variant="contained" color="primary" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
                Novo Caminhão
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Placa</TableCell>
                            <TableCell>Modelo</TableCell>
                            <TableCell>Ano</TableCell>
                            <TableCell>Capacidade</TableCell>
                            <TableCell>Custo por Ação</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {caminhoes.map((c: any) => (
                            <TableRow key={c.id}>
                                <TableCell>{c.placa}</TableCell>
                                <TableCell>{c.modelo}</TableCell>
                                <TableCell>{c.ano}</TableCell>
                                <TableCell>{c.capacidade_atendimento}</TableCell>
                                <TableCell>R$ {c.custo_diario}</TableCell>
                                <TableCell>{c.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Novo Caminhão</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Placa" margin="normal" onChange={e => setFormData({ ...formData, placa: e.target.value })} />
                    <TextField fullWidth label="Modelo" margin="normal" onChange={e => setFormData({ ...formData, modelo: e.target.value })} />
                    <TextField fullWidth label="Ano" type="number" margin="normal" onChange={e => setFormData({ ...formData, ano: parseInt(e.target.value) })} />
                    <TextField fullWidth label="Capacidade" type="number" margin="normal" onChange={e => setFormData({ ...formData, capacidade_atendimento: parseInt(e.target.value) })} />
                    <TextField fullWidth label="Custo por Ação" type="number" margin="normal" onChange={e => setFormData({ ...formData, custo_diario: parseFloat(e.target.value) })} />
                    <TextField fullWidth select label="Status" margin="normal" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                        <MenuItem value="disponivel">Disponível</MenuItem>
                        <MenuItem value="em_manutencao">Em Manutenção</MenuItem>
                        <MenuItem value="em_acao">Em Ação</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} color="primary">Salvar</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Caminhoes;
