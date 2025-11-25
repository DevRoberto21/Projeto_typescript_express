import api from './client';
import type { Service, Appointment, CreateAppointmentPayload } from '../types';

/**
 * [GET] /services - Busca todos os serviços disponíveis (Público).
 */
export const fetchAvailableServices = async (): Promise<Service[]> => {
    // Note que usamos a rota de serviços, mas via nosso cliente autenticado
    const response = await api.get<Service[]>('/services');
    return response.data;
};

/**
 * [POST] /appointments - Cria um novo agendamento. (Requer JWT)
 */
export const createAppointment = async (payload: CreateAppointmentPayload): Promise<Appointment> => {
    // Formata a data como string ISO 8601, que é o que o backend espera no Zod
    const payloadWithFormattedDate = {
        ...payload,
        date: new Date(payload.date).toISOString(),
    };

    const response = await api.post<{ message: string, appointment: Appointment }>('/appointments', payloadWithFormattedDate);
    return response.data.appointment;
};

/**
 * [GET] /appointments - Busca todos os agendamentos do usuário logado.
 */
export const fetchMyAppointments = async (): Promise<Appointment[]> => {
    // O backend retorna uma lista de objetos Appointment
    const response = await api.get<Appointment[]>('/appointments');
    return response.data;
};