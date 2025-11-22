// ADICIONE ESTA LINHA:
import { Request, Response, NextFunction } from 'express'; 
import { AuthUser } from './auth'; // OPCIONAL: Para garantir o tipo AuthUser no escopo

// Estende a interface Request do Express para incluir req.user
declare global {
  namespace Express {
    interface Request {
      user: AuthUser;
    }
  }
}

/**
 * Middleware para checar se o usuário autenticado é um ADMIN.
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // O req.user é populado pelo authenticateToken (que agora inclui o role)
  // A tipagem req.user.role é garantida pelo auth.ts e pela declaração global
  if (req.user.role !== 'ADMIN') { 
    return res.status(403).json({ 
      message: 'Acesso Proibido. Esta rota requer privilégios de Administrador.', 
    });
  }
  next();
};