import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { CreateDogInput, UpdateDogInput } from '../schemas/zod/dogSchema';

/**
 * [POST] /dogs - Cadastra um novo cão para o usuário logado.
 */
export const createDog = async (req: Request<{}, {}, CreateDogInput>, res: Response) => {
  // A validação de raça (dog.ceo) acontece no middleware Zod antes de chegar aqui.
  const { nome, idade, raca, porte } = req.body;
  const ownerId = req.user.id; // Pega o ID do usuário do token JWT

  try {
    const dog = await prisma.dog.create({
      data: {
        nome,
        idade,
        raca,
        porte,
        ownerId,
      },
    });

    return res.status(201).json({ message: 'Cachorro cadastrado com sucesso!', dog });
  } catch (error) {
    console.error('Erro ao criar cachorro:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * [GET] /dogs/:id - Busca um cão por ID. Inclui o dono se `?includeOwner=true`.
 */
export const getDogById = async (req: Request, res: Response) => {
  const { id } = req.params;
  // Query param para inclusão opcional
  const includeOwner = req.query.includeOwner === 'true'; 

  try {
    const dog = await prisma.dog.findUnique({
      where: { id },
      include: {
        // Inclusão condicional (só se o parâmetro for true)
        owner: includeOwner ? {
          select: { id: true, nome: true, email: true, telefone: true }
        } : false, 
      },
    });

    if (!dog) {
      return res.status(404).json({ message: 'Cachorro não encontrado.' });
    }

    // Se a requisição pediu para incluir o dono OU o usuário logado é o dono: retorna tudo.
    if (!includeOwner || dog.ownerId === req.user.id) {
        return res.status(200).json(dog);
    }
    
    // Caso contrário, retorna o Dog, mas remove o Owner (se foi incluído) para não expor dados de outros usuários
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
  const ownerId = req.user.id; // Filtra por usuário logado

  try {
    const dogs = await prisma.dog.findMany({
      where: { ownerId },
      orderBy: { nome: 'asc' },
    });

    return res.status(200).json(dogs);
  } catch (error) {
    console.error('Erro ao buscar cachorros:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * [PUT] /dogs/:id - Atualiza um cão por ID (Apenas o dono).
 */
export const updateDog = async (req: Request<{ id: string }, {}, UpdateDogInput>, res: Response) => {
  const { id } = req.params;
  const updatedData = req.body;
  const ownerId = req.user.id;

  try {
    // 1. Verifica se o cão pertence ao usuário logado
    const dog = await prisma.dog.findUnique({ where: { id } });

    if (!dog) {
      return res.status(404).json({ message: 'Cachorro não encontrado.' });
    }

    if (dog.ownerId !== ownerId) {
      return res.status(403).json({ message: 'Você não tem permissão para editar este cachorro.' });
    }

    // 2. Atualiza
    const updatedDog = await prisma.dog.update({
      where: { id },
      data: updatedData,
    });

    return res.status(200).json({ message: 'Cachorro atualizado com sucesso.', dog: updatedDog });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Cachorro não encontrado.' });
    }
    console.error('Erro ao atualizar cachorro:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * [DELETE] /dogs/:id - Deleta um cão por ID (Apenas o dono).
 */
export const deleteDog = async (req: Request, res: Response) => {
  const { id } = req.params;
  const ownerId = req.user.id;

  try {
    // 1. Verifica se o cão pertence ao usuário logado
    const dog = await prisma.dog.findUnique({ where: { id } });

    if (!dog) {
      return res.status(404).json({ message: 'Cachorro não encontrado.' });
    }

    if (dog.ownerId !== ownerId) {
      return res.status(403).json({ message: 'Você não tem permissão para deletar este cachorro.' });
    }

    // 2. Deleta
    await prisma.dog.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Cachorro não encontrado.' });
    }
    console.error('Erro ao deletar cachorro:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};