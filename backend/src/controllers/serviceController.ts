import { Request, Response } from 'express';
import { CreateServiceInput, UpdateServiceInput } from '../schemas/zod/serviceSchema';
import { Prisma } from '@prisma/client';

import {
    createServiceService,
    getServiceByIdService,
    getAllServicesService,
    updateServiceService,
    deleteServiceService
} from '../services/serviceService';

/**
 * [POST] /services - Cria um novo serviço.
 */
export const createService = async (req: Request<{}, {}, CreateServiceInput>, res: Response) => {
    const data = req.body;

    try {
        const service = await createServiceService(data);
        return res.status(201).json({ message: 'Serviço criado com sucesso!', service });
    } catch (error: any) {
        if (error.code === 'P2002') { // Nome do serviço deve ser único
            return res.status(409).json({ message: 'Serviço com este nome já existe.' });
        }
        console.error('Erro ao criar serviço:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * [GET] /services/:id - Busca um serviço por ID.
 */
export const getServiceById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const service = await getServiceByIdService(id);

        if (!service) {
            return res.status(404).json({ message: 'Serviço não encontrado.' });
        }

        return res.status(200).json(service);
    } catch (error) {
        console.error('Erro ao buscar serviço:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * [GET] /services - Busca todos os serviços.
 */
export const getAllServices = async (req: Request, res: Response) => {
    try {
        const services = await getAllServicesService();
        return res.status(200).json(services);
    } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * [PUT] /services/:id - Atualiza um serviço por ID.
 */
export const updateService = async (req: Request<{ id: string }, {}, UpdateServiceInput>, res: Response) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const service = await updateServiceService(id, updatedData);

        return res.status(200).json({ message: 'Serviço atualizado com sucesso.', service });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Serviço não encontrado.' });
        }
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Serviço com este nome já existe.' });
        }
        console.error('Erro ao atualizar serviço:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * [DELETE] /services/:id - Deleta um serviço por ID.
 */
export const deleteService = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await deleteServiceService(id);
        return res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Serviço não encontrado.' });
        }
        // COMENTÁRIO: Trata o erro de Foreign Key (P2003) quando há agendamentos vinculados.
        if (error.code === 'P2003') {
            return res.status(409).json({ message: 'Não é possível deletar. O serviço está associado a agendamentos existentes.' });
        }
        console.error('Erro ao deletar serviço:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};