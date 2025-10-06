import { Request, Response, NextFunction } from 'express';
// Importação corrigida: Usamos 'ZodSchema' do módulo principal do Zod.
import { ZodSchema } from 'zod'; 

/**
 * Middleware genérico para validar o corpo da requisição usando qualquer esquema Zod.
 * Ele usa .parseAsync para suportar validações assíncronas (como a consulta ao dog.ceo).
 * @param schema O esquema Zod (síncrono ou assíncrono) para validar req.body.
 */
export const validateSchema = (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Tenta validar o corpo da requisição de forma assíncrona
      await schema.parseAsync(req.body);
      next();
    } catch (error: any) {
      // 2. Trata erros de validação do Zod
      if (error.errors) {
        const errors = error.errors.map((err: any) => ({
          path: err.path,
          message: err.message,
        }));
        return res.status(400).json({
          message: 'Erro de validação de dados.',
          errors,
        });
      }
      
      // 3. Trata outros erros (ex: erro na API dog.ceo que dispara um erro Zod customizado)
      console.error('Erro de validação inesperado:', error);
      return res.status(500).json({ message: 'Erro interno na validação.' });
    }
  };