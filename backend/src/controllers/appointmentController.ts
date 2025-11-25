import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { CreateAppointmentInput, UpdateAppointmentInput } from '../schemas/zod/appointmentSchema';
import { Prisma } from '@prisma/client';

// Duração padrão: 60 minutos
const APPOINTMENT_DURATION_MS = 60 * 60 * 1000;

// Tipos auxiliares
type GetAllServicesSelect = { name: true, pricePequeno: true, priceMedio: true, priceGrande: true };
type GetAllAppointmentsResult = Prisma.AppointmentGetPayload<{
    include: {
        dogs: { include: { dog: { select: { nome: true, raca: true } } } };
        services: { include: { service: { select: GetAllServicesSelect } } };
    }
}>;
type AppointmentWithDogsAndServices = Prisma.AppointmentGetPayload<{
    include: {
        user: { select: { id: true, nome: true, email: true } };
        dogs: { include: { dog: true } };
        services: { include: { service: true } };
    }
}>;

/**
 * [POST] /appointments - Cria um agendamento com validação completa de conflitos.
 */
export const createAppointment = async (req: Request<{}, {}, CreateAppointmentInput>, res: Response) => {
  const { date, dogIds, serviceIds } = req.body;
  const userId = req.user.id;

  // Converte a data recebida (string ou Date) para objeto Date
  const appointmentStart = new Date(date);
  const appointmentEnd = new Date(appointmentStart.getTime() + APPOINTMENT_DURATION_MS);

  try {
    // 1. VALIDAÇÃO DE CONFLITO (ADMIN + OUTROS AGENDAMENTOS)
    
    // A. Checar Bloqueios do Admin
    const conflictingBlock = await prisma.blockedTimeSlot.findFirst({
        where: {
            dateStart: { lt: appointmentEnd },
            dateEnd: { gt: appointmentStart },
        },
    });

    if (conflictingBlock) {
        return res.status(409).json({ 
            message: `Horário indisponível (Bloqueio Administrativo). Motivo: ${conflictingBlock.reason}`,
        });
    }

    // B. Checar Outros Agendamentos (CORREÇÃO APLICADA AQUI)
    const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
            status: { not: 'CANCELADO' }, // Ignora cancelados
            date: {
                equals: appointmentStart, // Verifica colisão exata de horário
            }
        }
    });

    if (conflictingAppointment) {
        return res.status(409).json({ 
            message: `Este horário já foi reservado por outro cliente. Por favor, escolha outro.`,
        });
    }

    // 2. Validar Cães (Devem pertencer ao usuário)
    const dogs = await prisma.dog.findMany({
      where: {
        id: { in: dogIds },
        ownerId: userId,
      },
    });
    if (dogs.length !== dogIds.length) {
      return res.status(400).json({ message: 'Um ou mais cães são inválidos ou não pertencem a você.' });
    }

    // 3. Validar Serviços
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
    });
    if (services.length !== serviceIds.length) {
      return res.status(400).json({ message: 'Um ou mais serviços são inválidos.' });
    }

    // 4. Criar Agendamento
    const newAppointment = await prisma.appointment.create({
      data: {
        date: appointmentStart,
        userId,
        dogs: {
          create: dogIds.map((dogId: string) => ({
            dog: { connect: { id: dogId } }
          })),
        },
        services: {
          create: serviceIds.map((serviceId: string) => ({
            service: { connect: { id: serviceId } }
          })),
        }
      },
      include: { 
        user: { select: { id: true, nome: true, email: true } },
        dogs: { include: { dog: true } },
        services: { include: { service: true } },
      }
    }) as AppointmentWithDogsAndServices;

    // Simplifica retorno
    const dogsDetails = newAppointment.dogs.map(ad => ad.dog);
    const servicesDetails = newAppointment.services.map(as => as.service);

    return res.status(201).json({ 
      message: 'Agendamento criado com sucesso!', 
      appointment: { ...newAppointment, dogs: dogsDetails, services: servicesDetails }
    });

  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * [DELETE] /appointments/:id - Cancela (deleta) um agendamento e seus vínculos.
 */
export const deleteAppointment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const existingAppointment = await prisma.appointment.findUnique({ where: { id } });

    if (!existingAppointment || existingAppointment.userId !== userId) {
      return res.status(404).json({ message: 'Agendamento não encontrado ou não pertence a você.' });
    }

    // CORREÇÃO: Usar transação para deletar dependências antes do agendamento
    await prisma.$transaction([
        // 1. Remove vínculos com Cães
        prisma.appointmentDog.deleteMany({
            where: { appointmentId: id }
        }),
        // 2. Remove vínculos com Serviços
        prisma.appointmentService.deleteMany({
            where: { appointmentId: id }
        }),
        // 3. Remove o Agendamento em si
        prisma.appointment.delete({
            where: { id }
        })
    ]);

    return res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar agendamento:', error);
    if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Agendamento já foi removido.' });
    }
    return res.status(500).json({ message: 'Erro interno ao cancelar agendamento.' });
  }
};

// ... (Mantenha getAppointmentById, getAllAppointments, updateAppointment, getBusySlotsForDate iguais)
/**
 * [GET] /appointments/:id - Busca um agendamento por ID com includes.
 */
export const getAppointmentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id; 

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id, userId }, 
      include: {
        user: { select: { id: true, nome: true, email: true, telefone: true } },
        dogs: { include: { dog: true } },
        services: { include: { service: true } },
      },
    }) as AppointmentWithDogsAndServices | null; 

    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado ou não pertence a você.' });
    }

    const dogsDetails = appointment.dogs.map(ad => ad.dog);
    const servicesDetails = appointment.services.map(as => as.service);

    return res.status(200).json({
      ...appointment,
      dogs: dogsDetails,
      services: servicesDetails,
    });
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * [GET] /appointments - Busca todos os agendamentos do usuário logado.
 */
export const getAllAppointments = async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const appointments = await prisma.appointment.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
      include: {
        dogs: { include: { dog: { select: { nome: true, raca: true } } } },
        services: { 
            include: { 
                service: { 
                    select: { 
                        name: true, 
                        pricePequeno: true, 
                        priceMedio: true,   
                        priceGrande: true   
                    } 
                } 
            } 
        },
      }
    }) as GetAllAppointmentsResult[]; 

    const simplifiedAppointments = appointments.map(app => ({
      ...app,
      dogs: app.dogs.map((ad: { dog: any }) => ad.dog), 
      services: app.services.map((as: { service: any }) => as.service),
    }));

    return res.status(200).json(simplifiedAppointments);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * [PUT] /appointments/:id - Atualiza um agendamento.
 */
export const updateAppointment = async (req: Request<{ id: string }, {}, UpdateAppointmentInput>, res: Response) => {
  const { id } = req.params;
  const { date, status, dogIds, serviceIds } = req.body;
  const userId = req.user.id;

  try {
    const existingAppointment = await prisma.appointment.findUnique({ where: { id } });

    if (!existingAppointment || existingAppointment.userId !== userId) {
      return res.status(404).json({ message: 'Agendamento não encontrado ou não pertence a você.' });
    }

    const updateData: any = { date, status };
    const transactionOperations = [];

    if (dogIds) {
        const dogs = await prisma.dog.findMany({ where: { id: { in: dogIds }, ownerId: userId } });
        if (dogs.length !== dogIds.length) {
            return res.status(400).json({ message: 'Um ou mais IDs de cachorro são inválidos ou não pertencem a você.' });
        }
        transactionOperations.push(
            prisma.appointmentDog.deleteMany({ where: { appointmentId: id } }) as Prisma.PrismaPromise<any>,
            prisma.appointmentDog.createMany({ data: dogIds.map((dogId: string) => ({ dogId, appointmentId: id })) }) as Prisma.PrismaPromise<any>
        );
    }

    if (serviceIds) {
        const services = await prisma.service.findMany({ where: { id: { in: serviceIds } } });
        if (services.length !== serviceIds.length) {
            return res.status(400).json({ message: 'Um ou mais IDs de serviço são inválidos.' });
        }
        transactionOperations.push(
            prisma.appointmentService.deleteMany({ where: { appointmentId: id } }) as Prisma.PrismaPromise<any>,
            prisma.appointmentService.createMany({ data: serviceIds.map((serviceId: string) => ({ serviceId, appointmentId: id })) }) as Prisma.PrismaPromise<any>
        );
    }

    await prisma.$transaction([
        prisma.appointment.update({
            where: { id },
            data: updateData,
        }),
        ...transactionOperations
    ]);

    const fullAppointment = await prisma.appointment.findUnique({
        where: { id },
        include: { user: { select: { id: true, nome: true, email: true } }, dogs: { include: { dog: true } }, services: { include: { service: true } } }
    }) as AppointmentWithDogsAndServices | null;
    
    if (!fullAppointment) throw new Error("Erro ao buscar agendamento após update.");

    const dogsDetails = fullAppointment.dogs.map(ad => ad.dog);
    const servicesDetails = fullAppointment.services.map(as => as.service);

    return res.status(200).json({
      message: 'Agendamento atualizado com sucesso.',
      appointment: {
          ...fullAppointment,
          dogs: dogsDetails,
          services: servicesDetails,
      }
    });

  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Agendamento não encontrado.' });
    }
    console.error('Erro ao atualizar agendamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * [GET] /appointments/busy?date=YYYY-MM-DD - Busca todos os horários ocupados (agendamentos e bloqueios) para uma dada data.
 */
export const getBusySlotsForDate = async (req: Request, res: Response) => {
    const dateString = req.query.date; // Espera YYYY-MM-DD
    
    if (!dateString || typeof dateString !== 'string') {
        return res.status(400).json({ message: 'A data (date=YYYY-MM-DD) é obrigatória.' });
    }

    const startOfDay = new Date(`${dateString}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateString}T23:59:59.999Z`);
    
    try {
        const appointments = await prisma.appointment.findMany({
            where: {
                date: {
                    gte: startOfDay, 
                    lte: endOfDay,   
                },
                status: { not: 'CANCELADO' }
            },
            select: { date: true },
        });

        const blockedSlots = await prisma.blockedTimeSlot.findMany({
            where: {
                dateStart: {
                    lte: endOfDay, 
                },
                dateEnd: {
                    gte: startOfDay, 
                }
            },
            select: { dateStart: true, dateEnd: true },
        });

        const busySlots = {
            appointments: appointments.map(app => app.date.toISOString()),
            blockedSlots: blockedSlots.map(slot => ({ 
                start: slot.dateStart.toISOString(), 
                end: slot.dateEnd.toISOString() 
            })),
        };

        return res.status(200).json(busySlots);
    } catch (error) {
        console.error('Erro ao buscar horários ocupados:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};