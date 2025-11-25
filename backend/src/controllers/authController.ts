import { Request,Response } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';
import { User, UserRole } from '@prisma/client'; 
import {RegisterInput,LoginInput} from '../schemas/zod/userSchema';
import dotenv from 'dotenv';


dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_invalido';

// generateToken AGORA INCLUI O NOME
const generateToken = (userId:string, email:string, role: UserRole, nome: string) =>{ // NOME ADICIONADO AQUI
    return jwt.sign(
        {id:userId, email:email, role: role, nome: nome}, // NOME ADICIONADO AO PAYLOAD
        JWT_SECRET,
        {expiresIn:'1d'}
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
    }) as User; 

    // 3. Gera e retorna o token, USANDO O user.role E user.nome
    const token = generateToken(user.id, user.email, user.role, user.nome); // PASSANDO user.nome

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

    // Usamos 'user as User' para garantir que o TypeScript reconheça a tipagem completa, incluindo 'role'
    const typedUser = user as User;

    // 2. Compara a senha informada com o hash (bcrypt.compare)
    const isPasswordValid = await bcrypt.compare(password, typedUser.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // 3. Gera e retorna o token, USANDO O user.role E user.nome
    const token = generateToken(typedUser.id, typedUser.email, typedUser.role, typedUser.nome); // PASSANDO typedUser.nome

    const { passwordHash: _, ...userWithoutPassword } = typedUser;
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