import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { UpdateUserInput } from '../schemas/zod/userSchema';

/**
 * [GET] /users/:id - Busca um usuário por ID.
 */
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { // Não retorna o passwordHash
        id: true, nome: true, email: true, cpf: true, idade: true, 
        telefone: true, createdAt: true, updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * [GET] /users - Busca todos os usuários.
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { // Não retorna o passwordHash
        id: true, nome: true, email: true, cpf: true, idade: true, 
        telefone: true, createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * [POST] /users - MANTIDO APENAS POR CONFORMIDADE CRUD.
 */
export const createUser = async (req: Request, res: Response) => {
  // A lógica principal de criação está em /auth/register
  return res.status(405).json({ message: 'Use POST /auth/register para criar novos usuários.' });
};


/**
 * [PUT] /users/:id - Atualiza um usuário por ID. Só permite atualização do próprio perfil.
 */
export const updateUser = async (req: Request<{ id: string }, {}, UpdateUserInput>, res: Response) => {
  const { id } = req.params;
  const updatedData = req.body;
  const currentUserId = req.user.id; // Usuário autenticado (injetado pelo JWT)

  if (id !== currentUserId) {
    return res.status(403).json({ message: 'Você só pode atualizar seu próprio perfil.' });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: updatedData,
      select: { 
        id: true, nome: true, email: true, cpf: true, idade: true, 
        telefone: true, createdAt: true, updatedAt: true,
      },
    });

    return res.status(200).json({ message: 'Usuário atualizado com sucesso.', user });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'E-mail ou CPF já cadastrado.' });
    }
    console.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * [DELETE] /users/:id - Deleta o próprio perfil.
 */
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUserId = req.user.id;

  if (id !== currentUserId) {
    return res.status(403).json({ message: 'Você só pode deletar seu próprio perfil.' });
  }

  try {
    await prisma.user.delete({
      where: { id },
    });

    return res.status(204).send(); // 204 No Content
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    console.error('Erro ao deletar usuário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};