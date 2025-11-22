import axios from 'axios';

// A URL base aponta para o seu backend Express (padrão 3000)
const API_BASE_URL = 'http://localhost:3000'; 

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