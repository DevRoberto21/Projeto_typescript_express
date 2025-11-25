import api from './client';
import type { Service } from '../types';

export interface UpdateServicePayload {
    name?: string;
    pricePequeno: number;
    priceMedio: number;
    priceGrande: number;
}

export const fetchAllServices = async (): Promise<Service[]> => {
    const response = await api.get<Service[]>('/services');
    return response.data;
};

export const updateServicePrice = async (id: string, data: UpdateServicePayload): Promise<Service> => {
    const response = await api.put<{ message: string, service: Service }>(`/services/${id}`, data);
    return response.data.service;
};