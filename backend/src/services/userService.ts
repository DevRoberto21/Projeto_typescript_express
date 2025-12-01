import prisma from '../prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User, UserRole, Prisma } from '@prisma/client'; 
import { RegisterInput, LoginInput, UpdateUserInput } from '../schemas/zod/userSchema';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_invalido'; 
const SALT_ROUNDS = 10;


type SafeUser = Omit<User, 'passwordHash'>;

//Seleção de campos seguros do Prisma.
const userSelectFields = {
    id: true, nome: true, email: true, cpf: true, idade: true,
    telefone: true, createdAt: true, updatedAt: true, role: true,
};
type SafeUserPrisma = Prisma.UserGetPayload<{ select: typeof userSelectFields }>;



 //Gera um JWT para o usuário com dados essenciais.

function generateToken(user: User): string {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role, nome: user.nome }, 
        JWT_SECRET,
        { expiresIn: '1d' }
    );
};

/**
 * Registra um novo usuário no sistema.
 * @throws Error com a mensagem de conflito de email/cpf.
 */
export async function registerService(data: RegisterInput): Promise<{ user: SafeUser, token: string }> {
    const { password, ...userData } = data;

    // 1. Gera o hash da senha (bcrypt)
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    try {
        // 2. Cria o usuário no banco (Prisma)
        const user = await prisma.user.create({
            data: {
                ...userData,
                passwordHash,
                role: UserRole.CLIENTE, // NOVO CLIENTE por padrão
            },
        }) as User; 

        // 3. Gera o token
        const token = generateToken(user);

        const { passwordHash: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    } catch (error: any) {
        //Propaga o erro de unicidade (P2002) para ser tratado no Controller.
        if (error.code === 'P2002') {
            throw new Error('E-mail ou CPF já cadastrado.');
        }
        throw error;
    }
}

/**
 * Autentica o usuário e retorna o JWT.
 * @throws Error para credenciais inválidas.
 */
export async function loginService(data: LoginInput): Promise<{ user: SafeUser, token: string }> {
    const { identifier, password } = data;

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
        throw new Error('Credenciais inválidas.');
    }

    // 2. Compara a senha informada com o hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        throw new Error('Credenciais inválidas.');
    }

    // 3. Gera o token
    const token = generateToken(user);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
}

/**
 * Busca um usuário por ID, retornando apenas campos seguros.
 */
export async function getUserByIdService(id: string): Promise<SafeUserPrisma | null> {
    const user = await prisma.user.findUnique({
        where: { id },
        select: userSelectFields,
    });
    return user;
}

/**
 * Busca todos os usuários, retornando apenas campos seguros.
 */
export async function getAllUsersService(): Promise<SafeUserPrisma[]> {
    const users = await prisma.user.findMany({
        select: userSelectFields,
        orderBy: { createdAt: 'desc' },
    });
    return users;
}

/**
 * Atualiza o perfil de um usuário.
 * @throws Error se o ID não for do usuário logado (403).
 * @throws PrismaClientKnownRequestError P2025 (não encontrado) ou P2002 (conflito).
 */
export async function updateUserService(id: string, updatedData: UpdateUserInput, currentUserId: string): Promise<SafeUserPrisma> {
    if (id !== currentUserId) {
        throw new Error('Você só pode atualizar seu próprio perfil.');
    }

    const user = await prisma.user.update({
        where: { id },
        data: updatedData,
        select: userSelectFields,
    });
    return user;
}

/**
 * Deleta o próprio perfil do usuário.
 * @throws Error se o ID não for do usuário logado (403).
 * @throws PrismaClientKnownRequestError P2025 (não encontrado).
 */
export async function deleteUserService(id: string, currentUserId: string): Promise<void> {
    //Regra de negócio: checa se está deletando o próprio perfil.
    if (id !== currentUserId) {
        throw new Error('Você só pode deletar seu próprio perfil.');
    }

    // Exclui o usuário. Foreign keys configuradas garantem integridade.
    await prisma.user.delete({
        where: { id },
    });
}