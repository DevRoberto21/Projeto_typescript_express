import api from './client.ts';
import type { BlockedTimeSlot, CreateBlockedTimeSlotPayload } from '../types';

/**
 * [GET] /admin/blocked-slots - Busca todos os slots bloqueados. (Requer Admin)
 */
export const fetchBlockedSlots = async (): Promise<BlockedTimeSlot[]> => {
    const response = await api.get<BlockedTimeSlot[]>('/admin/blocked-slots');
    return response.data;
};

/**
 * [POST] /admin/blocked-slots - Cria um novo slot bloqueado. (Requer Admin)
 */
export const createBlockedSlot = async (payload: CreateBlockedTimeSlotPayload): Promise<BlockedTimeSlot> => {
    const response = await api.post<{ message: string, blockedSlot: BlockedTimeSlot }>('/admin/blocked-slots', payload);
    return response.data.blockedSlot;
};

/**
 * [DELETE] /admin/blocked-slots/:id - Deleta um slot bloqueado. (Requer Admin)
 */
export const deleteBlockedSlot = async (slotId: string): Promise<void> => {
    await api.delete(`/admin/blocked-slots/${slotId}`);
};