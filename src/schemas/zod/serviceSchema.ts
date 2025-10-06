import {z} from 'zod';
export const serviceSchema = z.object({
    name: z.string().min(2, 'Nome do serviço é obrigatório.'),
    price: z.number().min(0.01,'Preço deve ser um número positivo.'),

});
export type CreateServiceInput = z.infer<typeof serviceSchema>;
export type UpdateServiceInput = z.infer<typeof serviceSchema>;