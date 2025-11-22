import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { 
  CreateBlockedTimeSlotInput, 
  UpdateBlockedTimeSlotInput 
} from '../schemas/zod/blockedTimeSlotSchema';

/**
 * [POST] /admin/blocked-slots - Cria um novo período de bloqueio. (Requer Admin)
 */
export const createBlockedTimeSlot = async (
  req: Request<{}, {}, CreateBlockedTimeSlotInput>, 
  res: Response
) => {
  const { dateStart, dateEnd, reason } = req.body;

  try {
    // A validação Zod garante que dateEnd > dateStart

    const blockedSlot = await prisma.blockedTimeSlot.create({
      data: {
        dateStart,
        dateEnd,
        reason,
      },
    });

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
 * Nota: Pode ser aberto a CLIENTES no futuro para visualização no calendário.
 */
export const getAllBlockedTimeSlots = async (req: Request, res: Response) => {
  try {
    // Retorna todos os slots, ordenados pela data de início
    const blockedSlots = await prisma.blockedTimeSlot.findMany({
      orderBy: { dateStart: 'asc' },
    });

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
    const blockedSlot = await prisma.blockedTimeSlot.findUnique({
      where: { id },
    });

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
    const blockedSlot = await prisma.blockedTimeSlot.update({
      where: { id },
      data: updatedData,
    });

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
    await prisma.blockedTimeSlot.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Período de bloqueio não encontrado.' });
    }
    console.error('Erro ao deletar período de bloqueio:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};