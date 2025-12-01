import { Request, Response } from "express";
import { RegisterInput, LoginInput } from '../schemas/zod/userSchema';
import { registerService, loginService } from '../services/userService'; 

/**
 * [POST] /auth/register - Registra um novo usuário.
 */
export const register = async (req: Request<{}, {}, RegisterInput>, res: Response) => {
    const data = req.body;

    try {
        //Delega a lógica de hash, persistência e token para o Service.
        const result = await registerService(data);

        return res.status(201).json(result);
    } catch (error: any) {
        //Trata o erro de regra de negócio (conflito de CPF/Email) lançado pelo Service (409).
        if (error.message.includes('E-mail ou CPF')) {
            return res.status(409).json({ message: error.message });
        }
        console.error('Erro no registro:', error);
        return res.status(500).json({ message: 'Erro interno ao registrar usuário.' });
    }
};

/**
 * [POST] /auth/login - Autentica o usuário e retorna um JWT.
 */
export const login = async (req: Request<{}, {}, LoginInput>, res: Response) => {
    const data = req.body; 

    try {
        //Delega a lógica de autenticação e geração de token para o Service.
        const result = await loginService(data);

        return res.status(200).json(result);
    } catch (error: any) {
        //Trata o erro de regra de negócio (credenciais inválidas) lançado pelo Service (401).
        if (error.message.includes('Credenciais inválidas')) {
            return res.status(401).json({ message: error.message });
        }
        console.error('Erro no login:', error);
        return res.status(500).json({ message: 'Erro interno ao realizar login.' });
    }
};