import {z} from 'zod';

export const serviceSchema = z.object({
    name: z.string().min(2, 'Nome do serviço é obrigatório.'),
    pricePequeno: z.number().min(0.01,'Preço Pequeno deve ser um número positivo.'),
    priceMedio: z.number().min(0.01,'Preço Médio deve ser um número positivo.'),
    priceGrande: z.number().min(0.01,'Preço Grande deve ser um número positivo.'),
});

// NOVO: Esquema para atualização. 
// Usando .partial() resolve o erro de "name: Required" ao atualizar apenas os preços,
// e permite que qualquer campo seja atualizado individualmente.
export const updateServiceSchema = serviceSchema.partial();

// Tipos de entrada
export type CreateServiceInput = z.infer<typeof serviceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>; // ATUALIZADO