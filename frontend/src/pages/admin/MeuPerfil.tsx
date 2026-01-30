import React, { useState, useEffect, useRef } from 'react';
import {
    Container,
    Typography,
    TextField,
    Button,
    Grid,
    Box,
    Alert,
    Avatar,
    Card,
    CardContent,
    Divider,
    IconButton,
    CircularProgress,
    Stack,
} from '@mui/material';
import {
    PhotoCamera,
    Save,
    Person,
    Edit,
    Cancel,
    Email,
    Phone,
    Lock,
    LocationOn,
} from '@mui/icons-material';
import api from '../../services/api';
import { formatCPF, formatPhone, formatCEP } from '../../utils/formatters';

interface ViewFieldProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    locked?: boolean;
}

const ViewField: React.FC<ViewFieldProps> = ({ label, value, icon, locked = false }) => (
    <Box
        sx={{
            p: 2.5,
            mb: 2,
            border: '1px solid',
            borderColor: locked ? 'warning.light' : 'divider',
            borderRadius: 2,
            bgcolor: locked ? 'warning.50' : 'background.paper',
            transition: 'all 0.2s',
            '&:hover': {
                borderColor: locked ? 'warning.main' : 'primary.light',
                boxShadow: 1,
            },
        }}
    >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <Box sx={{ color: locked ? 'warning.main' : 'primary.main' }}>
                {icon}
            </Box>
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    fontSize: '0.7rem',
                }}
            >
                {label}
            </Typography>
        </Stack>
        <Typography
            variant="h6"
            sx={{
                fontWeight: 600,
                fontSize: '1.1rem',
                color: 'text.primary',
                pl: 4,
            }}
        >
            {value || '—'}
        </Typography>
    </Box>
);

const MeuPerfilAdmin: React.FC = () => {
    const [perfil, setPerfil] = useState<any>(null);
    const [formData, setFormData] = useState<any>(null);
    const [originalData, setOriginalData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const response = await api.get('/admins/me');
                setPerfil(response.data);
                setFormData(response.data);
                setOriginalData(response.data);
            } catch (error) {
                console.error('Erro ao buscar perfil:', error);
                setMessage({ type: 'error', text: 'Erro ao carregar perfil' });
            } finally {
                setLoading(false);
            }
        };

        fetchPerfil();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        setMessage({ type: '', text: '' });

        try {
            const dataToSend = new FormData();
            dataToSend.append('nome_completo', formData.nome_completo);
            dataToSend.append('telefone', formData.telefone);
            dataToSend.append('email', formData.email);
            dataToSend.append('cep', formData.cep || '');
            dataToSend.append('rua', formData.rua || '');
            dataToSend.append('numero', formData.numero || '');
            dataToSend.append('complemento', formData.complemento || '');
            dataToSend.append('bairro', formData.bairro || '');
            dataToSend.append('municipio', formData.municipio || '');
            dataToSend.append('estado', formData.estado || '');

            const response = await api.put('/admins/me', dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setPerfil(response.data.admin);
            setFormData(response.data.admin);
            setOriginalData(response.data.admin);
            setIsEditMode(false);
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        } catch (error: any) {
            console.error('Erro ao atualizar perfil:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.error || 'Erro ao atualizar perfil',
            });
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = () => {
        setFormData(originalData);
        setIsEditMode(false);
        setMessage({ type: '', text: '' });
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;

        const file = e.target.files[0];
        setUploading(true);
        setMessage({ type: '', text: '' });

        try {
            const dataToSend = new FormData();
            dataToSend.append('foto', file);
            dataToSend.append('nome_completo', formData.nome_completo);
            dataToSend.append('telefone', formData.telefone);
            dataToSend.append('email', formData.email);
            dataToSend.append('cep', formData.cep || '');
            dataToSend.append('rua', formData.rua || '');
            dataToSend.append('numero', formData.numero || '');
            dataToSend.append('complemento', formData.complemento || '');
            dataToSend.append('bairro', formData.bairro || '');
            dataToSend.append('municipio', formData.municipio || '');
            dataToSend.append('estado', formData.estado || '');

            const response = await api.put('/admins/me', dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setPerfil(response.data.admin);
            setFormData(response.data.admin);
            setOriginalData(response.data.admin);
            setMessage({ type: 'success', text: 'Foto atualizada com sucesso!' });
        } catch (error: any) {
            console.error('Erro ao atualizar foto:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.error || 'Erro ao atualizar foto',
            });
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    const photoUrl = perfil?.foto_perfil
        ? `${api.defaults.baseURL}${perfil.foto_perfil}`
        : undefined;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {message.text && (
                <Alert severity={message.type as any} sx={{ mb: 3 }}>
                    {message.text}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Card de Foto - Lado Esquerdo */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ textAlign: 'center', p: 4 }}>
                            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                                <Avatar
                                    src={photoUrl}
                                    alt={perfil?.nome_completo}
                                    sx={{
                                        width: 180,
                                        height: 180,
                                        border: '4px solid',
                                        borderColor: 'primary.main',
                                        boxShadow: 3,
                                    }}
                                >
                                    {perfil?.nome_completo?.charAt(0).toUpperCase()}
                                </Avatar>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handlePhotoChange}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                                <IconButton
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    sx={{
                                        position: 'absolute',
                                        bottom: 8,
                                        right: 8,
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        width: 48,
                                        height: 48,
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        boxShadow: 2,
                                    }}
                                >
                                    {uploading ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        <PhotoCamera />
                                    )}
                                </IconButton>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                {perfil?.nome_completo}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {perfil?.email}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Card de Informações - Lado Direito */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 3,
                                }}
                            >
                                <Typography
                                    variant="h5"
                                    sx={{ fontWeight: 700, color: 'primary.main' }}
                                >
                                    Informações Pessoais
                                </Typography>
                                {!isEditMode && (
                                    <Button
                                        variant="contained"
                                        startIcon={<Edit />}
                                        onClick={() => setIsEditMode(true)}
                                        size="large"
                                        sx={{
                                            px: 3,
                                            py: 1.5,
                                            borderRadius: 2,
                                            boxShadow: 2,
                                        }}
                                    >
                                        Editar meus dados
                                    </Button>
                                )}
                            </Box>
                            <Divider sx={{ mb: 4, borderColor: 'primary.light' }} />

                            {!isEditMode ? (
                                // VIEW MODE
                                <Box>
                                    <ViewField
                                        label="Nome Completo"
                                        value={perfil?.nome_completo}
                                        icon={<Person fontSize="medium" />}
                                    />
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <ViewField
                                                label="CPF (Documento Institucional)"
                                                value={formatCPF(perfil?.cpf)}
                                                icon={<Lock fontSize="medium" />}
                                                locked
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <ViewField
                                                label="E-mail"
                                                value={perfil?.email}
                                                icon={<Email fontSize="medium" />}
                                            />
                                        </Grid>
                                    </Grid>
                                    <ViewField
                                        label="Telefone"
                                        value={formatPhone(perfil?.telefone)}
                                        icon={<Phone fontSize="medium" />}
                                    />

                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 700,
                                            color: 'primary.main',
                                            mt: 4,
                                            mb: 3,
                                        }}
                                    >
                                        Endereço Residencial
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={4}>
                                            <ViewField
                                                label="CEP"
                                                value={formatCEP(perfil?.cep)}
                                                icon={<LocationOn fontSize="medium" />}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={8}>
                                            <ViewField
                                                label="Município / UF"
                                                value={
                                                    perfil?.municipio
                                                        ? `${perfil.municipio} - ${perfil.estado || ''}`
                                                        : ''
                                                }
                                                icon={<LocationOn fontSize="medium" />}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <ViewField
                                                label="Rua / Logradouro"
                                                value={perfil?.rua}
                                                icon={<LocationOn fontSize="medium" />}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <ViewField
                                                label="Número"
                                                value={perfil?.numero}
                                                icon={<LocationOn fontSize="medium" />}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <ViewField
                                                label="Complemento"
                                                value={perfil?.complemento}
                                                icon={<LocationOn fontSize="medium" />}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <ViewField
                                                label="Bairro"
                                                value={perfil?.bairro}
                                                icon={<LocationOn fontSize="medium" />}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            ) : (
                                // EDIT MODE
                                <Box component="form" onSubmit={handleSave}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Nome Completo"
                                                value={formData?.nome_completo || ''}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        nome_completo: e.target.value,
                                                    })
                                                }
                                                variant="outlined"
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="E-mail"
                                                type="email"
                                                value={formData?.email || ''}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, email: e.target.value })
                                                }
                                                variant="outlined"
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Telefone"
                                                value={formData?.telefone || ''}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, telefone: e.target.value })
                                                }
                                                variant="outlined"
                                                required
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: 'primary.main',
                                                    mt: 2,
                                                    mb: 1,
                                                }}
                                            >
                                                Endereço Residencial
                                            </Typography>
                                            <Divider />
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label="CEP"
                                                value={formData?.cep || ''}
                                                onChange={(e) => {
                                                    const formatted = formatCEP(e.target.value);
                                                    setFormData({ ...formData, cep: formatted });
                                                }}
                                                variant="outlined"
                                                inputProps={{ maxLength: 9 }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Município"
                                                value={formData?.municipio || ''}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, municipio: e.target.value })
                                                }
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={2}>
                                            <TextField
                                                fullWidth
                                                label="UF"
                                                value={formData?.estado || ''}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, estado: e.target.value })
                                                }
                                                variant="outlined"
                                                inputProps={{ maxLength: 2 }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Rua / Logradouro"
                                                value={formData?.rua || ''}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, rua: e.target.value })
                                                }
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label="Número"
                                                value={formData?.numero || ''}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, numero: e.target.value })
                                                }
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label="Complemento"
                                                value={formData?.complemento || ''}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, complemento: e.target.value })
                                                }
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label="Bairro"
                                                value={formData?.bairro || ''}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, bairro: e.target.value })
                                                }
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Stack direction="row" spacing={2}>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    color="primary"
                                                    size="large"
                                                    startIcon={uploading ? <CircularProgress size={20} /> : <Save />}
                                                    disabled={uploading}
                                                    fullWidth
                                                >
                                                    {uploading ? 'Salvando...' : 'Salvar Alterações'}
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="secondary"
                                                    size="large"
                                                    startIcon={<Cancel />}
                                                    onClick={handleCancel}
                                                    fullWidth
                                                >
                                                    Cancelar
                                                </Button>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default MeuPerfilAdmin;
