import { Request, Response } from 'express';
import { UpdateUserInput } from '../schemas/zod/userSchema';
import { Prisma } from '@prisma/client';


import { 
    getUserByIdService, 
    getAllUsersService, 
    updateUserService, 
    deleteUserService 
} from '../services/userService';


/**
 * [GET] /users/:id - Busca um usuário por ID.
 */
export const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // Delega a busca ao Service.
        const user = await getUserByIdService(id);

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
        //Delega a busca ao Service.
        const users = await getAllUsersService();
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
    //Força o uso da rota de autenticação para registro.
    return res.status(405).json({ message: 'Use POST /auth/register para criar novos usuários.' });
};


/**
 * [PUT] /users/:id - Atualiza o próprio perfil.
 */
export const updateUser = async (req: Request<{ id: string }, {}, UpdateUserInput>, res: Response) => {
    const { id } = req.params;
    const updatedData = req.body;
    const currentUserId = req.user.id; 

    try {
        //Delega a atualização e checagem de propriedade ao Service.
        const user = await updateUserService(id, updatedData, currentUserId);

        return res.status(200).json({ message: 'Usuário atualizado com sucesso.', user });
    } catch (error: any) {
        //Trata o erro de "Permissão negada" (Regra de Negócio)
        if (error.message && error.message.includes('só pode atualizar')) {
            return res.status(403).json({ message: error.message });
        }
        // Trata erros de persistência do Prisma (404, 409)
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

    try {
        //Delega a exclusão e checagem de propriedade ao Service.
        await deleteUserService(id, currentUserId);

        return res.status(204).send(); // 204 No Content
    } catch (error: any) {
        //Trata o erro de "Permissão negada" (Regra de Negócio)
        if (error.message && error.message.includes('só pode deletar')) {
            return res.status(403).json({ message: error.message });
        }
        //Trata erro P2025 (não encontrado)
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        console.error('Erro ao deletar usuário:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};