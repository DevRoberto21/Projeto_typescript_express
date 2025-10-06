import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { validateSchema } from '../middlewares/validateSchema';
import { registerSchema, loginSchema } from '../schemas/zod/userSchema';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação de Usuário
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: Registro bem-sucedido.
 */
router.post('/register', validateSchema(registerSchema), register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza o login do usuário.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identifier, password]
 *             properties:
 *               identifier:
 *                 type: string
 *                 example: "joao@exemplo.com"
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login bem-sucedido.
 *       401:
 *         description: Credenciais inválidas.
 */
router.post('/login', validateSchema(loginSchema), login);

export default router;
