import axios from 'axios';

//Usa a variável de ambiente do Vite (VITE_API_URL) para o deploy.
// O Render injetará o valor em produção; usamos localhost como fallback.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; 

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Interceptor para adicionar o token JWT em todas as requisições autenticadas.
 */
api.interceptors.request.use((config) => {
    // Busca o token no Local Storage
    const token = localStorage.getItem('jwt_token');

    if (token) {
        // Formato esperado pelo seu middleware 'authenticateToken' no backend
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;