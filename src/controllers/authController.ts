import { Request,Response } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';
import {RegisterInput,LoginInput} from '../schemas/zod/userSchema';
import dotenv from 'dotenv';


dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_invalido';//Usa o fallback, mas ele deve estar no .env

const generateToken = (userId:string,email:string) =>{
    return jwt.sign(
        {id:userId,email:email},
        JWT_SECRET,
        {expiresIn:'1d'}// Token válido por 1 dia
    );
};
    
// --- Endpoints de Autenticação ---

/**
 * [POST] /auth/register - Registra um novo usuário.
 */
export const register = async (req: Request<{}, {}, RegisterInput>, res: Response) => {
  const { password, ...userData } = req.body;

  try {
    // 1. Gera o hash da senha (bcrypt)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 2. Cria o usuário no banco (Model: User)
    const user = await prisma.user.create({
      data: {
        ...userData,
        passwordHash,
      },
    });

    // 3. Gera e retorna o token
    const token = generateToken(user.id, user.email);

    // Retorna dados do usuário (exceto passwordHash) e o token
    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.status(201).json({
      message: 'Registro realizado com sucesso!',
      user: userWithoutPassword,
      token,
    });
  } catch (error: any) {
    if (error.code === 'P2002') { // Erro de violação de unicidade (email ou cpf)
      return res.status(409).json({ message: 'E-mail ou CPF já cadastrado.' });
    }
    console.error('Erro no registro:', error);
    return res.status(500).json({ message: 'Erro interno ao registrar usuário.' });
  }
};

/**
 * [POST] /auth/login - Autentica o usuário e retorna um JWT.
 */
export const login = async (req: Request<{}, {}, LoginInput>, res: Response) => {
  const { identifier, password } = req.body; // identifier pode ser email ou cpf

  try {
    // 1. Busca o usuário por email ou cpf
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { cpf: identifier },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // 2. Compara a senha informada com o hash (bcrypt.compare)
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // 3. Gera e retorna o token
    const token = generateToken(user.id, user.email);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return res.status(200).json({
      message: 'Login realizado com sucesso!',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ message: 'Erro interno ao realizar login.' });
  }
};
