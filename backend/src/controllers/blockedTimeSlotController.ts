import { Request, Response } from 'express';
import { CreateBlockedTimeSlotInput, UpdateBlockedTimeSlotInput } from '../schemas/zod/blockedTimeSlotSchema';
import { Prisma } from '@prisma/client';

// IMPORTAÇÃO DOS SERVIÇOS
import {
    createBlockedTimeSlotService,
    getAllBlockedTimeSlotsService,
    getBlockedTimeSlotByIdService,
    updateBlockedTimeSlotService,
    deleteBlockedTimeSlotService,
} from '../services/blockedTimeSlotService';

/**
 * [POST] /admin/blocked-slots - Cria um novo período de bloqueio. (Requer Admin)
 */
export const createBlockedTimeSlot = async (
    req: Request<{}, {}, CreateBlockedTimeSlotInput>,
    res: Response
) => {
    const data = req.body;

    try {
        const blockedSlot = await createBlockedTimeSlotService(data);

        return res.status(201).json({
            message: 'Período de bloqueio criado com sucesso!',
            blockedSlot
        });
    } catch (error) {
        console.error('Erro ao criar período de bloqueio:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * [GET] /admin/blocked-slots - Lista todos os períodos de bloqueio. (Requer Admin)
 */
export const getAllBlockedTimeSlots = async (req: Request, res: Response) => {
    try {
        const blockedSlots = await getAllBlockedTimeSlotsService();

        return res.status(200).json(blockedSlots);
    } catch (error) {
        console.error('Erro ao buscar períodos de bloqueio:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * [GET] /admin/blocked-slots/:id - Busca um período de bloqueio por ID. (Requer Admin)
 */
export const getBlockedTimeSlotById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const blockedSlot = await getBlockedTimeSlotByIdService(id);

        if (!blockedSlot) {
            return res.status(404).json({ message: 'Período de bloqueio não encontrado.' });
        }

        return res.status(200).json(blockedSlot);
    } catch (error) {
        console.error('Erro ao buscar período de bloqueio:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * [PUT] /admin/blocked-slots/:id - Atualiza um período de bloqueio. (Requer Admin)
 */
export const updateBlockedTimeSlot = async (
    req: Request<{ id: string }, {}, UpdateBlockedTimeSlotInput>,
    res: Response
) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const blockedSlot = await updateBlockedTimeSlotService(id, updatedData);

        return res.status(200).json({
            message: 'Período de bloqueio atualizado com sucesso.',
            blockedSlot
        });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Período de bloqueio não encontrado.' });
        }
        console.error('Erro ao atualizar período de bloqueio:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * [DELETE] /admin/blocked-slots/:id - Deleta um período de bloqueio. (Requer Admin)
 */
export const deleteBlockedTimeSlot = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await deleteBlockedTimeSlotService(id);

        return res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Período de bloqueio não encontrado.' });
        }
        console.error('Erro ao deletar período de bloqueio:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};