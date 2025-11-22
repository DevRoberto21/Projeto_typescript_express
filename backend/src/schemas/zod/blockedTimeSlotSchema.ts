import { z } from 'zod';
import { ZodTypeAny } from 'zod'; // Importar ZodTypeAny para tipagem mais clara (opcional, mas ajuda)

// Helper para converter string/Date em objeto Date para validação
const dateTransformer = (arg: unknown) => {
    if (typeof arg === 'string' || arg instanceof Date) {
        const date = new Date(arg);
        // Retorna a data apenas se for uma data válida, caso contrário retorna o valor original para falhar a validação z.date()
        return isNaN(date.getTime()) ? arg : date;
    }
    return arg;
};

// 1. Esquema BASE sem o .refine (USADO PARA CREATE E UPDATE)
const blockedTimeSlotBaseSchema = z.object({
    dateStart: z.preprocess(
        dateTransformer,
        z.date({
            message: 'A data/hora de início é obrigatória e deve ser um formato de data/hora válido.', 
        })
    ),
    dateEnd: z.preprocess(
        dateTransformer,
        z.date({
            message: 'A data/hora de fim é obrigatória e deve ser um formato de data/hora válido.', 
        })
    ),
    reason: z.string().min(3, 'O motivo do bloqueio deve ter no mínimo 3 caracteres.'),
});


// 2. Esquema de Criação: Base com a validação de datas (refine)
export const createBlockedTimeSlotSchema = blockedTimeSlotBaseSchema
.refine((data) => data.dateEnd.getTime() > data.dateStart.getTime(), {
    message: 'A data/hora de fim deve ser estritamente posterior à data/hora de início.',
    path: ['dateEnd'],
});
export type CreateBlockedTimeSlotInput = z.infer<typeof createBlockedTimeSlotSchema>;


// 3. Esquema de Atualização: Base com .partial() e a validação de datas (superRefine)
export const updateBlockedTimeSlotSchema = blockedTimeSlotBaseSchema.partial()
// Os parâmetros 'data' e 'ctx' são inferidos corretamente pelo Zod após a correção da estrutura
.superRefine((data, ctx) => {
    // Se ambas as datas estiverem presentes, a regra de 'fim > início' deve ser aplicada.
    if (data.dateStart && data.dateEnd) {
        if (data.dateEnd.getTime() <= data.dateStart.getTime()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'A data/hora de fim deve ser estritamente posterior à data/hora de início.',
                path: ['dateEnd'],
            });
        }
    }
});

export type UpdateBlockedTimeSlotInput = z.infer<typeof updateBlockedTimeSlotSchema>;