import { Router } from 'express';
import {
  createDog,
  getDogById,
  getAllDogs,
  updateDog,
  deleteDog
} from '../controllers/dogController';
import { authenticateToken } from '../middlewares/auth';
import { validateSchema } from '../middlewares/validateSchema';
import { createDogSchema, dogSchema } from '../schemas/zod/dogSchema';

const router = Router();

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Dogs
 *   description: Gerenciamento de Cães do Usuário
 */

/**
 * @swagger
 * /dogs:
 *   post:
 *     summary: Cadastra um novo cão para o usuário logado. (Requer JWT)
 *     tags: [Dogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, idade, raca, porte]
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Rex"
 *               idade:
 *                 type: integer
 *                 description: Idade em anos (máx 20)
 *                 example: 5
 *               raca:
 *                 type: string
 *                 example: "poodle"
 *               porte:
 *                 type: string
 *                 enum: [PEQUENO, MEDIO, GRANDE]
 *                 example: MEDIO
 *     responses:
 *       201:
 *         description: Cão cadastrado com sucesso.
 *       400:
 *         description: Erro de validação Zod.
 */
router.post('/', validateSchema(createDogSchema), createDog);

/**
 * @swagger
 * /dogs:
 *   get:
 *     summary: Lista todos os cães do usuário logado. (Requer JWT)
 *     tags: [Dogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cães.
 */
router.get('/', getAllDogs);

/**
 * @swagger
 * /dogs/{id}:
 *   get:
 *     summary: Busca um cão pelo ID. (Requer JWT)
 *     tags: [Dogs]
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
 *         description: Dados do cão.
 */
router.get('/:id', getDogById);

/**
 * @swagger
 * /dogs/{id}:
 *   put:
 *     summary: Atualiza um cão pelo ID (Apenas se for o dono). (Requer JWT)
 *     tags: [Dogs]
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
 *               nome:
 *                 type: string
 *               idade:
 *                 type: integer
 *               porte:
 *                 type: string
 *                 enum: [PEQUENO, MEDIO, GRANDE]
 *     responses:
 *       200:
 *         description: Cão atualizado com sucesso.
 */
router.put('/:id', validateSchema(dogSchema), updateDog);

/**
 * @swagger
 * /dogs/{id}:
 *   delete:
 *     summary: Deleta um cão pelo ID (Apenas se for o dono). (Requer JWT)
 *     tags: [Dogs]
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
 *         description: Cão deletado com sucesso.
 */
router.delete('/:id', deleteDog);

export default router;
