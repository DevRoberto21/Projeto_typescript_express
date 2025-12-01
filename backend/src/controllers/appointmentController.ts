import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { CreateAppointmentInput, UpdateAppointmentInput } from '../schemas/zod/appointmentSchema';
import { Prisma } from '@prisma/client';

// IMPORTAÇÃO DOS SERVIÇOS
import { createAppointmentService, deleteAppointmentService, updateAppointmentService } from '../services/appointmentService';

// Tipos auxiliares (mantidos para tipagem de retorno)
type AppointmentWithDetails = Prisma.AppointmentGetPayload<{
    include: {
        user: { select: { id: true, nome: true, email: true, telefone: true } };
        dogs: { include: { dog: true } };
        services: { include: { service: true } };
    }
}>;
type GetAllAppointmentsResult = Prisma.AppointmentGetPayload<{
    include: {
        dogs: { include: { dog: { select: { nome: true, raca: true } } } };
        services: { include: { service: { select: { name: true, pricePequeno: true, priceMedio: true, priceGrande: true } } } };
    }
}>;

/**
 * [POST] /appointments - Cria um agendamento. Delega a lógica de negócios ao Service.
 */
export const createAppointment = async (req: Request<{}, {}, CreateAppointmentInput>, res: Response) => {
    const { date, dogIds, serviceIds } = req.body;
    const userId = req.user.id;

    try {
        // COMENTÁRIO: Delega a criação, validação de conflito e propriedade para o Service.
        const newAppointment = await createAppointmentService({ date, dogIds, serviceIds }, userId);

        // Simplifica o retorno para o padrão da API Frontend
        const dogsDetails = newAppointment.dogs.map(ad => ad.dog);
        const servicesDetails = newAppointment.services.map(as => as.service);

        return res.status(201).json({ 
            message: 'Agendamento criado com sucesso!', 
            appointment: { ...newAppointment, dogs: dogsDetails, services: servicesDetails }
        });

    } catch (error: any) {
        // COMENTÁRIO: Trata erros de validação e conflito lançados pelo Service (409 ou 400).
        if (error.message.includes('Horário indisponível') || error.message.includes('reservado')) {
            return res.status(409).json({ message: error.message });
        }
        if (error.message.includes('inválidos') || error.message.includes('pertencem')) {
            return res.status(400).json({ message: error.message });
        }
        
        console.error('Erro ao criar agendamento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * [DELETE] /appointments/:id - Cancela (deleta) um agendamento.
 */
export const deleteAppointment = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // COMENTÁRIO: Delega a lógica de transação e checagem de propriedade ao Service.
        await deleteAppointmentService(id, userId);

        return res.status(204).send();
    } catch (error: any) {
        if (error.message.includes('não encontrado') || error.code === 'P2025') {
            return res.status(404).json({ message: 'Agendamento não encontrado.' });
        }
        console.error('Erro ao deletar agendamento:', error);
        return res.status(500).json({ message: 'Erro interno ao cancelar agendamento.' });
    }
};

/**
 * [PUT] /appointments/:id - Atualiza um agendamento.
 */
export const updateAppointment = async (req: Request<{ id: string }, {}, UpdateAppointmentInput>, res: Response) => {
    const { id } = req.params;
    const updatedData = req.body;
    const userId = req.user.id;

    try {
        // COMENTÁRIO: Delega a lógica de atualização M:N e checagem de propriedade ao Service.
        const fullAppointment = await updateAppointmentService(id, updatedData, userId);

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
        if (error.message.includes('não encontrado') || error.code === 'P2025') {
            return res.status(404).json({ message: 'Agendamento não encontrado.' });
        }
        if (error.message.includes('inválidos') || error.message.includes('pertencem')) {
            return res.status(400).json({ message: error.message });
        }
        console.error('Erro ao atualizar agendamento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

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
        }) as AppointmentWithDetails | null;

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
    // COMENTÁRIO: Esta função de listagem é simples e pode permanecer no Controller.
    try {
        type GetAllAppointmentsResultInternal = Prisma.AppointmentGetPayload<{
            include: {
                dogs: { include: { dog: { select: { nome: true, raca: true } } } };
                services: { include: { service: { select: { name: true, pricePequeno: true, priceMedio: true, priceGrande: true } } } };
            }
        }>;

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
        }) as GetAllAppointmentsResultInternal[]; 

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
 * [GET] /appointments/busy?date=YYYY-MM-DD - Busca todos os horários ocupados.
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
                date: { gte: startOfDay, lte: endOfDay },
                status: { not: 'CANCELADO' }
            },
            select: { date: true },
        });

        const blockedSlots = await prisma.blockedTimeSlot.findMany({
            where: {
                dateStart: { lte: endOfDay },
                dateEnd: { gte: startOfDay },
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