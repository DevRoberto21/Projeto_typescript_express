import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_invalido'; 

// Define o formato esperado para o payload do JWT
const jwtPayloadSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
});

export type AuthUser = z.infer<typeof jwtPayloadSchema>;

// Estende a interface Request do Express para incluir req.user
declare global {
  namespace Express {
    interface Request {
      user: AuthUser;
    }
  }
}

/**
 * Middleware para validar o JWT e autenticar o usuário.
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Espera formato "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Valida o payload do token com Zod
    const validatedPayload = jwtPayloadSchema.parse(decoded);
    
    req.user = validatedPayload;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
    
    console.error('Erro de autenticação:', error);
    return res.status(403).json({ message: 'Token inválido.' });
  }
};