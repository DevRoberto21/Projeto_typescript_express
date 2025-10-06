import { Router } from 'express';
import {
  createAppointment,
  getAppointmentById,
  getAllAppointments,
  updateAppointment,
  deleteAppointment
} from '../controllers/appointmentController';
import { authenticateToken } from '../middlewares/auth';
import { validateSchema } from '../middlewares/validateSchema';
import { createAppointmentSchema, updateAppointmentSchema } from '../schemas/zod/appointmentSchema';

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Agendamento de Serviços
 */

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Cria um novo agendamento. (Requer JWT)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, dogIds, serviceIds]
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-31T10:00:00.000Z"
 *               dogIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               serviceIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Agendamento criado com sucesso.
 */
router.post('/', validateSchema(createAppointmentSchema), createAppointment);

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Lista todos os agendamentos do usuário logado. (Requer JWT)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de agendamentos.
 */
router.get('/', getAllAppointments);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Busca um agendamento pelo ID. (Requer JWT)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dados detalhados do agendamento.
 */
router.get('/:id', getAppointmentById);

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Atualiza um agendamento. (Requer JWT)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [AGENDADO, CONCLUIDO, CANCELADO]
 *     responses:
 *       200:
 *         description: Agendamento atualizado com sucesso.
 */
router.put('/:id', validateSchema(updateAppointmentSchema), updateAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Deleta um agendamento. (Requer JWT)
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Agendamento deletado com sucesso.
 */
router.delete('/:id', deleteAppointment);

export default router;
