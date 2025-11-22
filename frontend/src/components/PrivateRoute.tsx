import React from 'react'; 
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface PrivateRouteProps { 
    // O 'children' é a rota que este componente está protegendo (ex: <Dashboard />)
    children: React.ReactNode; 
} 

/**
 * Componente que verifica a autenticação do usuário.
 * Se autenticado, renderiza o componente filho. Caso contrário, redireciona para o login.
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => { 
    // Obtém o estado de autenticação e carregamento do hook
    const { user, loading } = useAuth(); 
    
    // 1. Enquanto o estado de autenticação estiver sendo verificado (token no Local Storage, etc.)
    if (loading) { 
        return <div style={{padding: '20px', textAlign: 'center'}}>Carregando autenticação...</div>; 
    } 
    
    // 2. Se não houver usuário logado (token inválido ou ausente), redireciona para a página de Login
    if (!user) { 
        return <Navigate to="/login" replace />; 
    } 
    
    // 3. Se estiver autenticado, renderiza o conteúdo da rota protegida
    return <>{children}</>; 
};