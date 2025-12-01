import prisma from '../prisma/client';
import { CreateBlockedTimeSlotInput, UpdateBlockedTimeSlotInput } from '../schemas/zod/blockedTimeSlotSchema';
import { BlockedTimeSlot } from '@prisma/client';

/**
 * Cria um novo período de bloqueio.
 */
export async function createBlockedTimeSlotService(data: CreateBlockedTimeSlotInput): Promise<BlockedTimeSlot> {
    const blockedSlot = await prisma.blockedTimeSlot.create({
        data,
    });
    return blockedSlot;
}

/**
 * Lista todos os períodos de bloqueio.
 */
export async function getAllBlockedTimeSlotsService(): Promise<BlockedTimeSlot[]> {
    const blockedSlots = await prisma.blockedTimeSlot.findMany({
        orderBy: { dateStart: 'asc' },
    });
    return blockedSlots;
}

/**
 * Busca um período de bloqueio por ID.
 */
export async function getBlockedTimeSlotByIdService(id: string): Promise<BlockedTimeSlot | null> {
    const blockedSlot = await prisma.blockedTimeSlot.findUnique({
        where: { id },
    });
    return blockedSlot;
}

/**
 * Atualiza um período de bloqueio por ID.
 * @throws PrismaClientKnownRequestError para erro P2025 (não encontrado).
 */
export async function updateBlockedTimeSlotService(id: string, updatedData: UpdateBlockedTimeSlotInput): Promise<BlockedTimeSlot> {
    const blockedSlot = await prisma.blockedTimeSlot.update({
        where: { id },
        data: updatedData,
    });
    return blockedSlot;
}

/**
 * Deleta um período de bloqueio por ID.
 * @throws PrismaClientKnownRequestError para erro P2025 (não encontrado).
 */
export async function deleteBlockedTimeSlotService(id: string): Promise<void> {
    await prisma.blockedTimeSlot.delete({
        where: { id },
    });
}