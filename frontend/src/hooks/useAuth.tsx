import { 
    createContext, 
    useContext, 
} from 'react';
import type { LoginPayload, RegisterPayload, UserRole } from '../types';

// Tipos simplificados de usuário extraídos do token
interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
}

// Interface para o Contexto
interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    isAdmin: boolean;
    login: (data: LoginPayload) => Promise<void>;
    register: (data: RegisterPayload) => Promise<void>;
    logout: () => void;
}

// Criação do Contexto (Exportado)
export const AuthContext = createContext<AuthContextType | undefined>(undefined); 

/**
 * Hook customizado para consumir o contexto de autenticação (Exportado).
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

// Exportar tipos para uso no Provedor
export type { AuthUser, AuthContextType };