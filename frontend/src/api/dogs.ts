import api from './client.ts';
// Importa o novo tipo para o payload de atualização
import type { Dog, Porte, CreateDogPayload, UpdateDogPayload } from '../types'; 

/**
 * [GET] /dogs - Lista todos os cães do usuário logado.
 */
export const fetchMyDogs = async (): Promise<Dog[]> => {
    const response = await api.get<Dog[]>('/dogs');
    return response.data;
};

/**
 * [POST] /dogs - Cadastra um novo cão.
 */
export const createDog = async (data: CreateDogPayload): Promise<Dog> => {
    const response = await api.post<{ message: string, dog: Dog }>('/dogs', data);
    return response.data.dog;
};

/**
 * [PUT] /dogs/:id - Atualiza os dados de um cão.
 */
export const updateDog = async (dogId: string, data: UpdateDogPayload): Promise<Dog> => {
    // Envia o payload parcial (ou completo) para o backend
    const response = await api.put<{ message: string, dog: Dog }>(`/dogs/${dogId}`, data);
    return response.data.dog;
};

/**
 * [DELETE] /dogs/:id - Deleta um cão por ID.
 */
export const deleteDog = async (dogId: string): Promise<void> => {
    await api.delete(`/dogs/${dogId}`);
};

/**
 * Lista os portes disponíveis (ENUM do backend) para uso no formulário.
 */
export const availablePortes: Porte[] = ['PEQUENO', 'MEDIO', 'GRANDE'];