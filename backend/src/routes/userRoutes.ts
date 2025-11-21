import { Router } from 'express';
import {
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  createUser
} from '../controllers/userController';
import { authenticateToken } from '../middlewares/auth';
import { validateSchema } from '../middlewares/validateSchema';
import { updateUserSchema, registerSchema } from '../schemas/zod/userSchema';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gerenciamento de Usuários
 */

router.use(authenticateToken);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários. (Requer JWT)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários.
 */
router.get('/', getAllUsers);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: (USAR /auth/register) Endpoint desabilitado.
 *     tags: [Users]
 *     responses:
 *       405:
 *         description: Método não permitido.
 */
router.post('/', validateSchema(registerSchema), createUser);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Busca um usuário pelo ID. (Requer JWT)
 *     tags: [Users]
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
 *         description: Dados do usuário.
 */
router.get('/:id', getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualiza o próprio perfil. (Requer JWT)
 *     tags: [Users]
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
 *               telefone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso.
 */
router.put('/:id', validateSchema(updateUserSchema), updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Deleta o próprio perfil. (Requer JWT)
 *     tags: [Users]
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
 *         description: Usuário deletado com sucesso.
 */
router.delete('/:id', deleteUser);

export default router;
