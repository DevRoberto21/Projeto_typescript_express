import prisma from '../prisma/client';
import { CreateServiceInput, UpdateServiceInput } from '../schemas/zod/serviceSchema';
import { Service, Prisma } from '@prisma/client';

/**
 * Cria um novo serviço.
 * @throws PrismaClientKnownRequestError para erro P2002 (nome duplicado).
 */
export async function createServiceService(data: CreateServiceInput): Promise<Service> {
    const service = await prisma.service.create({
        data,
    });
    return service;
}

/**
 * Busca um serviço por ID.
 */
export async function getServiceByIdService(id: string): Promise<Service | null> {
    const service = await prisma.service.findUnique({
        where: { id },
    });
    return service;
}

/**
 * Busca todos os serviços.
 */
export async function getAllServicesService(): Promise<Service[]> {
    const services = await prisma.service.findMany({
        orderBy: { name: 'asc' },
    });
    return services;
}

/**
 * Atualiza um serviço por ID.
 * @throws PrismaClientKnownRequestError para erros P2025 (não encontrado) ou P2002 (conflito).
 */
export async function updateServiceService(id: string, updatedData: UpdateServiceInput): Promise<Service> {
    const service = await prisma.service.update({
        where: { id },
        data: updatedData,
    });
    return service;
}

/**
 * Deleta um serviço por ID.
 * @throws PrismaClientKnownRequestError para erros P2025 (não encontrado) ou P2003 (Foreign Key).
 */
export async function deleteServiceService(id: string): Promise<void> {
    await prisma.service.delete({
        where: { id },
    });
}