import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { CreateAppointmentInput, UpdateAppointmentInput } from '../schemas/zod/appointmentSchema';
// Importar Prisma para ajudar a inferir tipos complexos
import { Prisma } from '@prisma/client'; 

// Assumindo uma duração padrão de 60 minutos para validação de bloqueio
const APPOINTMENT_DURATION_MS = 60 * 60 * 1000; 

// 1. Tipo auxiliar para o resultado de findUnique/create (inclui todas as relações)
type AppointmentWithDogsAndServices = Prisma.AppointmentGetPayload<{
    include: {
        user: { select: { id: true, nome: true, email: true } };
        dogs: { include: { dog: true } };
        services: { include: { service: true } };
    }
}>;

// 2. Tipo auxiliar para o resultado de getAllAppointments (selects customizados)
type GetAllServicesSelect = { name: true, pricePequeno: true, priceMedio: true, priceGrande: true };

type GetAllAppointmentsResult = Prisma.AppointmentGetPayload<{
    include: {
        dogs: { include: { dog: { select: { nome: true, raca: true } } } };
        services: { include: { service: { select: GetAllServicesSelect } } };
    }
}>;


/**
 * [POST] /appointments - Cria um novo agendamento, gerencia many-to-many e valida contra bloqueios de agenda.
 */
export const createAppointment = async (req: Request<{}, {}, CreateAppointmentInput>, res: Response) => {
  const { date, dogIds, serviceIds } = req.body;
  const userId = req.user.id;

  try {
    // 0. VALIDAÇÃO DE CONFLITO COM BLOQUEIOS DE AGENDA
    const appointmentEnd = new Date(date.getTime() + APPOINTMENT_DURATION_MS);

    const conflictingSlot = await prisma.blockedTimeSlot.findFirst({
        where: {
            dateStart: { lt: appointmentEnd },
            dateEnd: { gt: date },
        },
    });

    if (conflictingSlot) {
        const start = conflictingSlot.dateStart.toISOString().slice(0, 16).replace('T', ' ');
        const end = conflictingSlot.dateEnd.toISOString().slice(0, 16).replace('T', ' ');
        return res.status(409).json({ 
            message: `Conflito de agendamento. O horário de ${start} a ${end} está bloqueado. Motivo: ${conflictingSlot.reason}`,
        });
    }

    // 1. Validar se todos os Dogs pertencem ao usuário
    const dogs = await prisma.dog.findMany({
      where: {
        id: { in: dogIds },
        ownerId: userId,
      },
    });

    if (dogs.length !== dogIds.length) {
      return res.status(400).json({ message: 'Um ou mais IDs de cachorro são inválidos ou não pertencem a você.' });
    }

    // 2. Validar se todos os Services existem
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
    });

    if (services.length !== serviceIds.length) {
      return res.status(400).json({ message: 'Um ou mais IDs de serviço são inválidos.' });
    }

    // 3. Cria o agendamento e as tabelas de junção em uma transação implícita
    const newAppointment = await prisma.appointment.create({
      data: {
        date,
        userId,
        dogs: {
          // Tipagem explícita para dogId (string)
          create: dogIds.map((dogId: string) => ({
            dog: { connect: { id: dogId } }
          })),
        },
        services: {
          // Tipagem explícita para serviceId (string)
          create: serviceIds.map((serviceId: string) => ({
            service: { connect: { id: serviceId } }
          })),
        }
      },
      // Inclui os dados relacionados para o retorno
      include: { 
        user: { select: { id: true, nome: true, email: true } },
        dogs: { include: { dog: true } },
        services: { include: { service: true } },
      }
    }) as AppointmentWithDogsAndServices; // Força a tipagem de retorno
    
    // Simplifica a resposta, removendo a estrutura da tabela de junção
    const dogsDetails = newAppointment.dogs.map(ad => ad.dog);
    const servicesDetails = newAppointment.services.map(as => as.service);

    return res.status(201).json({ 
      message: 'Agendamento criado com sucesso!', 
      appointment: {
        ...newAppointment,
        dogs: dogsDetails,
        services: servicesDetails,
      }
    });

  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * [GET] /appointments/:id - Busca um agendamento por ID com includes.
 */
export const getAppointmentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id; // Garante que apenas o dono possa ver

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id, userId }, 
      include: {
        user: { select: { id: true, nome: true, email: true, telefone: true } },
        dogs: { include: { dog: true } },
        services: { include: { service: true } },
      },
    }) as AppointmentWithDogsAndServices | null; // Força a tipagem de retorno

    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado ou não pertence a você.' });
    }

    // Limpeza e simplificação do retorno
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
                        pricePequeno: true, // CORRIGIDO: Substituindo 'price' pelo novo campo
                        priceMedio: true,   // CORRIGIDO
                        priceGrande: true   // CORRIGIDO
                    } 
                } 
            } 
        },
      }
    }) as GetAllAppointmentsResult[]; // Força a tipagem de retorno

    // Mapeamento para simplificar a resposta
    const simplifiedAppointments = appointments.map(app => ({
      ...app,
      dogs: app.dogs.map(ad => ad.dog), 
      services: app.services.map(as => as.service),
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
  // CORREÇÃO: Usar dogIds e serviceIds
  const { id } = req.params;
  const { date, status, dogIds, serviceIds } = req.body;
  const userId = req.user.id;

  try {
    // 1. Verifica se o agendamento pertence ao usuário
    const existingAppointment = await prisma.appointment.findUnique({ where: { id } });

    if (!existingAppointment || existingAppointment.userId !== userId) {
      return res.status(404).json({ message: 'Agendamento não encontrado ou não pertence a você.' });
    }

    const updateData: any = { date, status };

    const transactionOperations = [];

    // Lógica para atualizar Dogs (deleta os antigos e cria os novos)
    if (dogIds) {
        const dogs = await prisma.dog.findMany({ where: { id: { in: dogIds }, ownerId: userId } });
        if (dogs.length !== dogIds.length) {
            return res.status(400).json({ message: 'Um ou mais IDs de cachorro são inválidos ou não pertencem a você.' });
        }
        transactionOperations.push(
            prisma.appointmentDog.deleteMany({ where: { appointmentId: id } }) as Prisma.PrismaPromise<any>,
            // Tipagem explícita
            prisma.appointmentDog.createMany({ data: dogIds.map((dogId: string) => ({ dogId, appointmentId: id })) }) as Prisma.PrismaPromise<any>
        );
    }

    // Lógica para atualizar Services
    if (serviceIds) {
        const services = await prisma.service.findMany({ where: { id: { in: serviceIds } } });
        if (services.length !== serviceIds.length) {
            return res.status(400).json({ message: 'Um ou mais IDs de serviço são inválidos.' });
        }
        transactionOperations.push(
            prisma.appointmentService.deleteMany({ where: { appointmentId: id } }) as Prisma.PrismaPromise<any>,
            // Tipagem explícita
            prisma.appointmentService.createMany({ data: serviceIds.map((serviceId: string) => ({ serviceId, appointmentId: id })) }) as Prisma.PrismaPromise<any>
        );
    }

    // 2. Executa a atualização principal junto com a manipulação das junções em uma transação
    await prisma.$transaction([
        prisma.appointment.update({
            where: { id },
            data: updateData,
        }),
        ...transactionOperations
    ]);

    // 3. Busca o agendamento completo para o retorno
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
 * [DELETE] /appointments/:id - Deleta um agendamento.
 */
export const deleteAppointment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const existingAppointment = await prisma.appointment.findUnique({ where: { id } });

    if (!existingAppointment || existingAppointment.userId !== userId) {
      return res.status(404).json({ message: 'Agendamento não encontrado ou não pertence a você.' });
    }

    await prisma.appointment.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Agendamento não encontrado.' });
    }
    console.error('Erro ao deletar agendamento:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};