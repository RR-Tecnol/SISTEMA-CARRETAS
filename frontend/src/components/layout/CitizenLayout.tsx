import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const CitizenLayout: React.FC = () => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Check both Redux state AND localStorage as fallback
    const hasToken = isAuthenticated || !!localStorage.getItem('token');

    if (!hasToken) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Portal do Cidadão - {user?.nome}
                    </Typography>

                    <Button color="inherit" component={RouterLink} to="/portal">
                        Início
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/portal/perfil">
                        Meu Perfil
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/portal/inscricoes">
                        Minhas Inscrições
                    </Button>
                    <Button color="inherit" onClick={handleLogout}>
                        Sair
                    </Button>
                </Toolbar>
            </AppBar>

            <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default CitizenLayout;
