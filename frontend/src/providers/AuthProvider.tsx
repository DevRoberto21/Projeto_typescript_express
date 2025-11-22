import React, { 
    useState, 
    useEffect, 
    useMemo,
    useCallback 
} from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    loginUser, 
    registerUser, 
    logoutUser as apiLogout, 
    getStoredUser,
} from '../api/auth.ts'; 
import type { LoginPayload, RegisterPayload } from '../types';
// IMPORTAÇÃO CORRIGIDA: AuthUser é um type-only import
import { AuthContext } from '../hooks/useAuth.ts'; 
import type { AuthUser } from '../hooks/useAuth.ts'; 

/**
 * Provedor de Autenticação que envolve a aplicação.
 */
interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Efeito para carregar o usuário do Local Storage (via JWT) ao iniciar o app
    useEffect(() => {
        const storedUser = getStoredUser();
        if (storedUser) {
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    // Funções de sessão (Envolvidas em useCallback para estabilidade)
    const login = useCallback(async (data: LoginPayload) => {
        setLoading(true);
        try {
            await loginUser(data);
            
            const loggedInUser = getStoredUser();
            if(loggedInUser) {
                setUser(loggedInUser);
                navigate('/dashboard'); 
            }
        } catch (error) {
            console.error('Login falhou', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [navigate]); 

    const register = useCallback(async (data: RegisterPayload) => {
        setLoading(true);
        try {
            await registerUser(data);
            const registeredUser = getStoredUser();
            if(registeredUser) {
                setUser(registeredUser);
                navigate('/dashboard'); 
            }
        } catch (error) {
            console.error('Registro falhou', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [navigate]); 

    const logout = useCallback(() => {
        apiLogout();
        setUser(null);
        navigate('/login'); 
    }, [navigate]); 

    // Valor do Contexto
    const isAdmin = useMemo(() => user?.role === 'ADMIN', [user]);
    
    const contextValue = useMemo(() => ({
        user,
        loading,
        isAdmin,
        login,
        register,
        logout,
    }), [user, loading, isAdmin, login, register, logout]); 

    // O Provedor renderiza o conteúdo da aplicação
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};