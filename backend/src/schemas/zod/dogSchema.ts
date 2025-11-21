import {z} from 'zod';
import { validateDogBreed } from '../../utils/dogApi';

const PorteEnum = z.enum(['PEQUENO', 'MEDIO', 'GRANDE']);// Define os valores permitidos para o porte do cachorro

export const dogSchema = z.object({
  nome: z.string().min(1, 'Nome do cão é obrigatório.'),
  idade: z.number().int().min(1, 'Idade deve ser no mínimo 1.').max(20, 'Idade máxima permitida é 20 anos.'),
  raca: z.string().min(1, 'Raça é obrigatória.').toLowerCase().superRefine(async (val, ctx) => {
    // Validação Assíncrona: Checa se a raça existe na API dog.ceo
    const isValid = await validateDogBreed(val);
    if (!isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `A raça '${val}' não foi encontrada na base de dados de raças (dog.ceo).`,
        path: ['raca'],
      });
    }
  }),
  porte: PorteEnum.refine(val => PorteEnum.options.includes(val), {
    message: "Porte deve ser 'PEQUENO', 'MEDIO', ou 'GRANDE'.",
  }),
});

export const createDogSchema = dogSchema.required();
export type CreateDogInput = z.infer<typeof createDogSchema>;
export type UpdateDogInput = z.infer<typeof dogSchema>;