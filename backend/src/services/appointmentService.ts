import prisma from '../prisma/client';
import { CreateAppointmentInput, UpdateAppointmentInput } from '../schemas/zod/appointmentSchema';
import { Prisma } from '@prisma/client';

// Duração padrão do agendamento (60 minutos)
const APPOINTMENT_DURATION_MS = 60 * 60 * 1000;

// Tipos auxiliares para retorno e inclusão
type AppointmentWithDetails = Prisma.AppointmentGetPayload<{
    include: {
        user: { select: { id: true, nome: true, email: true, telefone: true } };
        dogs: { include: { dog: true } };
        services: { include: { service: true } };
    }
}>;

/**
 * Checa conflitos de horário com bloqueios administrativos e outros agendamentos.
 * @param appointmentStart Data/hora de início do novo agendamento.
 * @returns Mensagem de erro se houver conflito, ou null se estiver disponível.
 */
async function checkAppointmentConflicts(appointmentStart: Date): Promise<string | null> {
    const appointmentEnd = new Date(appointmentStart.getTime() + APPOINTMENT_DURATION_MS);

    // Checagem de Bloqueios Admin.
    const conflictingBlock = await prisma.blockedTimeSlot.findFirst({
        where: {
            dateStart: { lt: appointmentEnd },
            dateEnd: { gt: appointmentStart },
        },
    });

    if (conflictingBlock) {
        return `Horário indisponível (Bloqueio Admin). Motivo: ${conflictingBlock.reason}`;
    }

    // Checagem de Conflito de Agendamento Exato.
    const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
            status: { not: 'CANCELADO' },
            date: { equals: appointmentStart }
        }
    });

    if (conflictingAppointment) {
        return `Este horário já foi reservado por outro cliente. Escolha outro.`;
    }

    return null;
}

/**
 * Cria um novo agendamento, executando validações de conflito e checagem de propriedade.
 * @param data Dados do agendamento (date, dogIds, serviceIds).
 * @param userId ID do usuário logado.
 * @returns O objeto Appointment criado com detalhes.
 * @throws Error com mensagem de conflito/validação.
 */
export async function createAppointmentService(data: CreateAppointmentInput, userId: string): Promise<AppointmentWithDetails> {
    const appointmentStart = new Date(data.date);

    // Validação de Conflitos
    const conflictMessage = await checkAppointmentConflicts(appointmentStart);
    if (conflictMessage) {
        throw new Error(conflictMessage);
    }

    // Validações de propriedade (Dog Ownership e Service Existence)
    const dogs = await prisma.dog.findMany({
        where: { id: { in: data.dogIds }, ownerId: userId },
    });
    if (dogs.length !== data.dogIds.length) {
        throw new Error('Um ou mais cães são inválidos ou não pertencem a você.');
    }

    const services = await prisma.service.findMany({
        where: { id: { in: data.serviceIds } },
    });
    if (services.length !== data.serviceIds.length) {
        throw new Error('Um ou mais serviços são inválidos.');
    }

    // Criação do Agendamento (Transaction)
    const newAppointment = await prisma.appointment.create({
        data: {
            date: appointmentStart,
            userId,
            dogs: {
                create: data.dogIds.map((dogId: string) => ({ dog: { connect: { id: dogId } } })),
            },
            services: {
                create: data.serviceIds.map((serviceId: string) => ({ service: { connect: { id: serviceId } } })),
            }
        },
        include: { 
            user: { select: { id: true, nome: true, email: true, telefone: true } },
            dogs: { include: { dog: true } },
            services: { include: { service: true } },
        }
    }) as AppointmentWithDetails;

    return newAppointment;
}

/**
 * Deleta agendamentos antigos (mais de 30 dias) que foram CONCLUIDOS ou CANCELADOS.
 * @returns Quantidade de registros deletados.
 */
export async function cleanupExpiredAppointmentsService(): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // 1. Encontra IDs de agendamentos antigos
    const appointmentsToClean = await prisma.appointment.findMany({
        where: {
            updatedAt: { lt: thirtyDaysAgo },
            status: { in: ['CONCLUIDO', 'CANCELADO'] } 
        },
        select: { id: true }
    });

    const appointmentIds = appointmentsToClean.map(app => app.id);
    
    if (appointmentIds.length === 0) return 0;
    
    // 2. Transação para remover dependências M:N e o registro principal
    const deletedCount = await prisma.$transaction(async (tx) => {
        // Deleta dependências M:N
        await tx.appointmentDog.deleteMany({ where: { appointmentId: { in: appointmentIds } } });
        await tx.appointmentService.deleteMany({ where: { appointmentId: { in: appointmentIds } } });
        
        // Deleta os agendamentos principais
        const result = await tx.appointment.deleteMany({ where: { id: { in: appointmentIds } } });
        return result.count;
    });

    return deletedCount;
}

/**
 * Deleta um agendamento com suas dependências (Foreign Keys).
 * @param id ID do agendamento.
 * @param userId ID do usuário logado (para checar propriedade).
 * @throws Error se não encontrado ou se o usuário não for o dono.
 */
export async function deleteAppointmentService(id: string, userId: string): Promise<void> {
    const existingAppointment = await prisma.appointment.findUnique({ where: { id } });

    // Checa se o agendamento existe e pertence ao usuário.
    if (!existingAppointment || existingAppointment.userId !== userId) {
        throw new Error('Agendamento não encontrado ou não pertence a você.');
    }

    // Transação para deletar M:N e o registro principal (Foreign Key safety).
    await prisma.$transaction([
        prisma.appointmentDog.deleteMany({ where: { appointmentId: id } }),
        prisma.appointmentService.deleteMany({ where: { appointmentId: id } }),
        prisma.appointment.delete({ where: { id } })
    ]);
}

/**
 * Atualiza um agendamento, tratando a complexa atualização de listas M:N.
 * @param id ID do agendamento.
 * @param updatedData Dados a serem atualizados.
 * @param userId ID do usuário logado (para checar propriedade).
 * @returns O objeto Appointment atualizado com detalhes.
 * @throws Error para validação ou não encontrado.
 */
export async function updateAppointmentService(id: string, updatedData: UpdateAppointmentInput, userId: string): Promise<AppointmentWithDetails> {
    const { date, status, dogIds, serviceIds } = updatedData;

    const existingAppointment = await prisma.appointment.findUnique({ where: { id } });

    // Checa se o agendamento existe e pertence ao usuário.
    if (!existingAppointment || existingAppointment.userId !== userId) {
        throw new Error('Agendamento não encontrado ou não pertence a você.');
    }

    const updateDbData: any = { date, status };
    const transactionOperations = [];

    // Lógica para reescrever as listas M:N se dogIds for fornecido
    if (dogIds) {
        const dogs = await prisma.dog.findMany({ where: { id: { in: dogIds }, ownerId: userId } });
        if (dogs.length !== dogIds.length) {
            throw new Error('Um ou mais IDs de cachorro são inválidos ou não pertencem a você.');
        }
        transactionOperations.push(
            prisma.appointmentDog.deleteMany({ where: { appointmentId: id } }) as Prisma.PrismaPromise<any>,
            prisma.appointmentDog.createMany({ data: dogIds.map((dogId: string) => ({ dogId, appointmentId: id })) }) as Prisma.PrismaPromise<any>
        );
    }

    // Lógica para reescrever as listas M:N se serviceIds for fornecido
    if (serviceIds) {
        const services = await prisma.service.findMany({ where: { id: { in: serviceIds } } });
        if (services.length !== serviceIds.length) {
            throw new Error('Um ou mais IDs de serviço são inválidos.');
        }
        transactionOperations.push(
            prisma.appointmentService.deleteMany({ where: { appointmentId: id } }) as Prisma.PrismaPromise<any>,
            prisma.appointmentService.createMany({ data: serviceIds.map((serviceId: string) => ({ serviceId, appointmentId: id })) }) as Prisma.PrismaPromise<any>
        );
    }

    await prisma.$transaction([
        prisma.appointment.update({
            where: { id },
            data: updateDbData,
        }),
        ...transactionOperations
    ]);

    // Busca o resultado final completo
    const fullAppointment = await prisma.appointment.findUnique({
        where: { id },
        include: { user: { select: { id: true, nome: true, email: true } }, dogs: { include: { dog: true } }, services: { include: { service: true } } }
    }) as AppointmentWithDetails | null;

    if (!fullAppointment) {
        throw new Error("Erro ao buscar agendamento após update.");
    }
    
    return fullAppointment;
}