import {z} from 'zod';

export const serviceSchema = z.object({
    name: z.string().min(2, 'Nome do serviço é obrigatório.'),
    pricePequeno: z.number().min(0.01,'Preço Pequeno deve ser um número positivo.'),
    priceMedio: z.number().min(0.01,'Preço Médio deve ser um número positivo.'),
    priceGrande: z.number().min(0.01,'Preço Grande deve ser um número positivo.'),
});

// Os tipos de entrada são baseados no novo esquema
export type CreateServiceInput = z.infer<typeof serviceSchema>;
export type UpdateServiceInput = z.infer<typeof serviceSchema>;