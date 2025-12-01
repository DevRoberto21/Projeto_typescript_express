import prisma from '../prisma/client';
import { CreateDogInput, UpdateDogInput } from '../schemas/zod/dogSchema';
import { Prisma, Dog } from '@prisma/client';

/**
 * Cria um novo cão e o vincula ao usuário logado.
 * @param data Dados do novo cão.
 * @param ownerId ID do usuário proprietário.
 * @returns O objeto Dog criado.
 */
export async function createDogService(data: CreateDogInput, ownerId: string): Promise<Dog> {
    // COMENTÁRIO: A validação de raça (dog.ceo) é feita pelo Zod (antes de chegar aqui).
    const { nome, idade, raca, porte } = data;
    
    const dog = await prisma.dog.create({
        data: {
            nome,
            idade,
            raca,
            porte,
            ownerId,
        },
    });

    return dog;
}

/**
 * Busca todos os cães pertencentes a um usuário específico.
 * @param ownerId ID do usuário.
 * @returns Lista de objetos Dog.
 */
export async function getAllDogsService(ownerId: string): Promise<Dog[]> {
    const dogs = await prisma.dog.findMany({
        where: { ownerId },
        orderBy: { nome: 'asc' },
    });
    return dogs;
}

/**
 * Busca um cão pelo ID, com opção de incluir o dono.
 * @param id ID do cão.
 * @param includeOwner Flag para incluir os detalhes do dono.
 * @returns O objeto Dog (ou Dog com Owner), ou null.
 */
export async function getDogByIdService(id: string, includeOwner: boolean) {
    const dog = await prisma.dog.findUnique({
        where: { id },
        include: {
            owner: includeOwner ? {
                select: { id: true, nome: true, email: true, telefone: true }
            } : false,
        },
    });
    
    return dog; 
}


/**
 * Atualiza um cão, verificando se ele pertence ao usuário.
 * @param id ID do cão.
 * @param updatedData Dados a serem atualizados (parciais).
 * @param ownerId ID do usuário logado.
 * @returns O objeto Dog atualizado.
 * @throws PrismaClientKnownRequestError se não encontrado (P2025).
 * @throws Error se o cão não pertencer ao usuário.
 */
export async function updateDogService(id: string, updatedData: UpdateDogInput, ownerId: string): Promise<Dog> {
    // 1. Checa propriedade
    const dog = await prisma.dog.findUnique({ where: { id } });

    if (!dog) {
        // COMENTÁRIO: Lança erro Prisma nativo para ser capturado no Controller como 404.
        throw new Prisma.PrismaClientKnownRequestError('Cachorro não encontrado.', { code: 'P2025', clientVersion: '0.0.0' });
    }

    if (dog.ownerId !== ownerId) {
        // COMENTÁRIO: Lança erro de regra de negócio para ser capturado como 403.
        throw new Error('Você não tem permissão para editar este cachorro.');
    }

    // 2. Atualiza
    const updatedDog = await prisma.dog.update({
        where: { id },
        data: updatedData,
    });

    return updatedDog;
}

/**
 * Deleta um cão, removendo as dependências M:N primeiro (transação).
 * @param id ID do cão.
 * @param ownerId ID do usuário logado.
 * @throws PrismaClientKnownRequestError se não encontrado (P2025).
 * @throws Error se o cão não pertencer ao usuário.
 */
export async function deleteDogService(id: string, ownerId: string): Promise<void> {
    // 1. Checa propriedade
    const dog = await prisma.dog.findUnique({ where: { id } });

    if (!dog) {
        // COMENTÁRIO: Lança erro Prisma nativo para ser capturado no Controller como 404.
        throw new Prisma.PrismaClientKnownRequestError('Cachorro não encontrado.', { code: 'P2025', clientVersion: '0.0.0' });
    }

    if (dog.ownerId !== ownerId) {
        // COMENTÁRIO: Lança erro de regra de negócio para ser capturado como 403.
        throw new Error('Você não tem permissão para deletar este cachorro.');
    }

    // 2. COMENTÁRIO: Transação para deletar M:N e o registro principal (Foreign Key safety).
    await prisma.$transaction([
        prisma.appointmentDog.deleteMany({
            where: { dogId: id }
        }) as Prisma.PrismaPromise<any>,
        prisma.dog.delete({
            where: { id },
        }) as Prisma.PrismaPromise<any>
    ]);
}