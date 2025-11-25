import { Request, Response, NextFunction } from 'express';
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
      // E, mais importante, CAPTURA o corpo validado/TRANSFORMADO (agora com Date objects)
      const validatedBody = await schema.parseAsync(req.body);

      // 2. CORREÇÃO ESSENCIAL: Atribui o corpo transformado de volta ao req.body
      req.body = validatedBody; 

      next();
    } catch (error: any) {
      // 3. Trata erros de validação do Zod
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
      
      // 4. Trata outros erros
      console.error('Erro de validação inesperado:', error);
      return res.status(500).json({ message: 'Erro interno na validação.' });
    }
  };