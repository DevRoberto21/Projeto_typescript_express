import api from './client';
import type { Service, Appointment, CreateAppointmentPayload } from '../types';

// --- NOVOS TIPOS E FUNÇÕES ---

export interface BusySlotsResponse {
    appointments: string[]; // Lista de datas ISO
    blockedSlots: Array<{ start: string, end: string }>; // Lista de intervalos bloqueados
}

/**
 * [GET] /appointments/busy?date=YYYY-MM-DD - Busca horários ocupados.
 */
export const fetchBusySlots = async (date: string): Promise<BusySlotsResponse> => {
    const response = await api.get<BusySlotsResponse>(`/appointments/busy?date=${date}`);
    return response.data;
};

// --- FUNÇÕES EXISTENTES ---

export const fetchAvailableServices = async (): Promise<Service[]> => {
    const response = await api.get<Service[]>('/services');
    return response.data;
};

export const createAppointment = async (payload: CreateAppointmentPayload): Promise<Appointment> => {
    // Garante formato ISO
    const payloadWithFormattedDate = {
        ...payload,
        date: new Date(payload.date).toISOString(),
    };

    const response = await api.post<{ message: string, appointment: Appointment }>('/appointments', payloadWithFormattedDate);
    return response.data.appointment;
};

export const fetchMyAppointments = async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>('/appointments');
    return response.data;
};

export const cancelAppointment = async (id: string): Promise<void> => {
    await api.delete(`/appointments/${id}`);
};