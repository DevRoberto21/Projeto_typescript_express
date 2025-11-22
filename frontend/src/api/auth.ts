// CORRIGIDO: Adicionando a extensão '.ts' ao './client'
import api from './client.ts'; 
import type { AuthResponse, LoginPayload, RegisterPayload, User, UserRole } from '../types'; 

// Tipo simplificado do usuário retornado no token
type AuthUser = Omit<User, 'passwordHash' | 'createdAt' | 'updatedAt' | 'cpf' | 'idade'> & { role: UserRole };

// Funções de Autenticação

const getDecodedToken = (token: string): AuthUser | null => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);

    } catch (e) {
        console.error("Erro ao decodificar token", e);
        return null;
    }
}

export const registerUser = async (data: RegisterPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    localStorage.setItem('jwt_token', response.data.token);
    return response.data;
};

export const loginUser = async (data: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    localStorage.setItem('jwt_token', response.data.token);
    return response.data;
};

export const logoutUser = () => {
    localStorage.removeItem('jwt_token');
};

export const getStoredUser = (): AuthUser | null => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        return null;
    }
    return getDecodedToken(token);
};