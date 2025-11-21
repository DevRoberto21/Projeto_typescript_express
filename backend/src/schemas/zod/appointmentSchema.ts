import {z} from 'zod';


const AppointmentStatusEnum = z.enum(['AGENDADO', 'CONCLUIDO', 'CANCELADO']);// Define os valores permitidos para o status da consulta

export const createAppointmentSchema = z.object({
    date:z.preprocess((arg) => {
        if(typeof arg === 'string' || arg instanceof Date) return new Date(arg);
        return arg;
    }, z.date().min(new Date(Date.now()+60000), 'A data da consulta deve ser no futuro.')), // Garante que a data seja no futuro (pelo menos 10 minutos à frente)

    dogIds: z.array(z.string().uuid('ID do cachorro inválido.')).min(1, 'Pelo menos um ID de cachorro é obrigatório.'), // Array de IDs de cachorros (UUIDs)
    serviceIds: z.array(z.string().uuid('ID do serviço inválido.')).min(1, 'Pelo menos um ID de serviço é obrigatório.'), // Array de IDs de serviços (UUIDs)
});


export const updateAppointmentSchema = z.object({
  date: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date().min(new Date(Date.now() + 60000), 'A data do agendamento deve ser futura.').optional()),
  status: AppointmentStatusEnum.optional(),
  dogIds: z.array(z.string().uuid()).min(1).optional(),
  serviceIds: z.array(z.string().uuid()).min(1).optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;