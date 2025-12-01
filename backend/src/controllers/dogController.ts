import { Request, Response } from 'express';
import { CreateDogInput, UpdateDogInput } from '../schemas/zod/dogSchema';
import { Prisma } from '@prisma/client';

// IMPORTAÇÃO DOS SERVIÇOS
import { 
    createDogService, 
    getAllDogsService, 
    getDogByIdService, 
    updateDogService, 
    deleteDogService 
} from '../services/dogService'; 


/**
 * [POST] /dogs - Cadastra um novo cão para o usuário logado.
 */
export const createDog = async (req: Request<{}, {}, CreateDogInput>, res: Response) => {
  const data = req.body;
  const ownerId = req.user.id; 

  try {
    // COMENTÁRIO: Delega a criação ao Service.
    const dog = await createDogService(data, ownerId);

    return res.status(201).json({ message: 'Cachorro cadastrado com sucesso!', dog });
  } catch (error) {
    console.error('Erro ao criar cachorro:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * [GET] /dogs/:id - Busca um cão por ID.
 */
export const getDogById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const includeOwner = req.query.includeOwner === 'true'; 

  try {
    // COMENTÁRIO: Delega a busca ao Service.
    const dog = await getDogByIdService(id, includeOwner);

    if (!dog) {
      return res.status(404).json({ message: 'Cachorro não encontrado.' });
    }

    // COMENTÁRIO: Lógica de filtragem de dados sensíveis mantida na camada Controller/HTTP.
    if (!includeOwner || dog.ownerId === req.user.id) {
        return res.status(200).json(dog);
    }
    
    // Retorna o Dog, mas remove o Owner (se foi incluído)
    const { owner, ...dogWithoutOwner } = dog;
    return res.status(200).json(dogWithoutOwner);


  } catch (error) {
    console.error('Erro ao buscar cachorro:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * [GET] /dogs - Busca todos os cães do usuário logado.
 */
export const getAllDogs = async (req: Request, res: Response) => {
  const ownerId = req.user.id; 

  try {
    // COMENTÁRIO: Delega a busca filtrada ao Service.
    const dogs = await getAllDogsService(ownerId);

    return res.status(200).json(dogs);
  } catch (error) {
    console.error('Erro ao buscar cachorros:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * [PUT] /dogs/:id - Atualiza um cão por ID.
 */
export const updateDog = async (req: Request<{ id: string }, {}, UpdateDogInput>, res: Response) => {
  const { id } = req.params;
  const updatedData = req.body;
  const ownerId = req.user.id;

  try {
    // COMENTÁRIO: Delega a atualização e checagem de propriedade ao Service.
    const updatedDog = await updateDogService(id, updatedData, ownerId);

    return res.status(200).json({ message: 'Cachorro atualizado com sucesso.', dog: updatedDog });
  } catch (error: any) {
    // COMENTÁRIO: Trata o erro de "Cachorro não encontrado" (P2025)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Cachorro não encontrado.' });
    }
    // COMENTÁRIO: Trata o erro de "Permissão negada" (Regra de Negócio)
    if (error.message && error.message.includes('permissão')) {
        return res.status(403).json({ message: error.message });
    }
    console.error('Erro ao atualizar cachorro:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * [DELETE] /dogs/:id - Deleta um cão por ID.
 */
export const deleteDog = async (req: Request, res: Response) => {
  const { id } = req.params;
  const ownerId = req.user.id;

  try {
    // COMENTÁRIO: Delega a transação de exclusão e checagem de propriedade ao Service.
    await deleteDogService(id, ownerId);

    return res.status(204).send();
  } catch (error: any) {
    // COMENTÁRIO: Trata o erro de "Cachorro não encontrado" (P2025)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Cachorro não encontrado.' });
    }
    // COMENTÁRIO: Trata o erro de "Permissão negada" (Regra de Negócio)
    if (error.message && error.message.includes('permissão')) {
        return res.status(403).json({ message: error.message });
    }
    console.error('Erro ao deletar cachorro:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};