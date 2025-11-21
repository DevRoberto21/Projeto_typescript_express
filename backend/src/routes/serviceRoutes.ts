import { Router } from 'express';
import {
  createService,
  getServiceById,
  getAllServices,
  updateService,
  deleteService
} from '../controllers/serviceController';
import { authenticateToken } from '../middlewares/auth';
import { validateSchema } from '../middlewares/validateSchema';
import { serviceSchema } from '../schemas/zod/serviceSchema';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Gerenciamento de Serviços de Petshop
 */

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Lista todos os serviços disponíveis. (Pública)
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Lista de serviços.
 */
router.get('/', getAllServices);

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Busca um serviço pelo ID. (Pública)
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dados do serviço.
 */
router.get('/:id', getServiceById);

router.use(authenticateToken);

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Cria um novo serviço. (Requer JWT)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Serviço criado com sucesso.
 */
router.post('/', validateSchema(serviceSchema), createService);

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Atualiza um serviço pelo ID. (Requer JWT)
 *     tags: [Services]
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
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Serviço atualizado com sucesso.
 */
router.put('/:id', validateSchema(serviceSchema), updateService);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Deleta um serviço pelo ID. (Requer JWT)
 *     tags: [Services]
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
 *         description: Serviço deletado com sucesso.
 */
router.delete('/:id', deleteService);

export default router;
