import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { Person, Logout } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import api from '../../services/api';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [adminFoto, setAdminFoto] = useState<string>('');

    useEffect(() => {
        if (isAuthenticated && user?.tipo === 'admin') {
            // Buscar foto do admin
            api.get('/admins/me')
                .then((response) => {
                    if (response.data.foto_perfil) {
                        setAdminFoto(`${api.defaults.baseURL}${response.data.foto_perfil}`);
                    }
                })
                .catch((error) => {
                    console.error('Erro ao buscar foto do admin:', error);
                });
        }
    }, [isAuthenticated, user]);

    if (!isAuthenticated || user?.tipo !== 'admin') {
        return <Navigate to="/" replace />;
    }

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfile = () => {
        handleMenuClose();
        navigate('/admin/perfil');
    };

    const handleLogout = () => {
        handleMenuClose();
        dispatch(logout());
        navigate('/');
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Sistema Carretas - Admin
                    </Typography>
                    <IconButton
                        onClick={handleMenuOpen}
                        sx={{
                            p: 0,
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                    >
                        <Avatar
                            src={adminFoto}
                            alt={user?.nome || 'Admin'}
                            sx={{
                                width: 40,
                                height: 40,
                                border: '2px solid white',
                            }}
                        >
                            {!adminFoto && user?.nome?.charAt(0).toUpperCase()}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItem onClick={handleProfile}>
                            <ListItemIcon>
                                <Person fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Meu Perfil</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <Logout fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Sair</ListItemText>
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminLayout;
