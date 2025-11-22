import { Router } from 'express';
import {
  createBlockedTimeSlot,
  getAllBlockedTimeSlots,
  getBlockedTimeSlotById,
  updateBlockedTimeSlot,
  deleteBlockedTimeSlot,
} from '../controllers/blockedTimeSlotController';
// Importação explícita de authenticateToken
import { authenticateToken } from '../middlewares/auth'; 
// Importação explícita de requireAdmin
import { requireAdmin } from '../middlewares/admin'; 
import { validateSchema } from '../middlewares/validateSchema';
import { createBlockedTimeSlotSchema, updateBlockedTimeSlotSchema } from '../schemas/zod/blockedTimeSlotSchema';

const router = Router();

/**
 * Todas as rotas de gerenciamento de bloqueio exigem autenticação (authenticateToken) 
 * e privilégios de administrador (requireAdmin).
 */
router.use(authenticateToken); 
router.use(requireAdmin); // Se o erro persistir, o problema é que 'requireAdmin' é 'undefined'

/**
 * @swagger
 * tags:
 * name: Admin/BlockedSlots
 * description: Gerenciamento de Bloqueios de Agenda (Apenas Admin)
 */

/**
 * @swagger
 * /admin/blocked-slots:
 * post:
 * summary: Cria um novo período de bloqueio na agenda. (Requer Admin)
 * tags: [Admin/BlockedSlots]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [dateStart, dateEnd, reason]
 * properties:
 * dateStart:
 * type: string
 * format: date-time
 * example: "2025-11-25T12:00:00.000Z"
 * dateEnd:
 * type: string
 * format: date-time
 * example: "2025-11-25T13:00:00.000Z"
 * reason:
 * type: string
 * example: "Almoço da Equipe"
 * responses:
 * 201:
 * description: Bloqueio criado com sucesso.
 * 403:
 * description: Acesso Proibido (Não é Admin).
 */
router.post('/', validateSchema(createBlockedTimeSlotSchema), createBlockedTimeSlot);

/**
 * @swagger
 * /admin/blocked-slots:
 * get:
 * summary: Lista todos os períodos de bloqueio. (Requer Admin)
 * tags: [Admin/BlockedSlots]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Lista de horários bloqueados.
 */
router.get('/', getAllBlockedTimeSlots);

/**
 * @swagger
 * /admin/blocked-slots/{id}:
 * get:
 * summary: Busca um período de bloqueio pelo ID. (Requer Admin)
 * tags: [Admin/BlockedSlots]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * format: uuid
 * responses:
 * 200:
 * description: Dados do bloqueio.
 */
router.get('/:id', getBlockedTimeSlotById);

/**
 * @swagger
 * /admin/blocked-slots/{id}:
 * put:
 * summary: Atualiza um período de bloqueio. (Requer Admin)
 * tags: [Admin/BlockedSlots]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * format: uuid
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * dateStart:
 * type: string
 * format: date-time
 * dateEnd:
 * type: string
 * format: date-time
 * reason:
 * type: string
 * responses:
 * 200:
 * description: Bloqueio atualizado com sucesso.
 */
router.put('/:id', validateSchema(updateBlockedTimeSlotSchema), updateBlockedTimeSlot);

/**
 * @swagger
 * /admin/blocked-slots/{id}:
 * delete:
 * summary: Deleta um período de bloqueio. (Requer Admin)
 * tags: [Admin/BlockedSlots]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * format: uuid
 * responses:
 * 204:
 * description: Bloqueio deletado com sucesso.
 */
router.delete('/:id', deleteBlockedTimeSlot);

export default router;