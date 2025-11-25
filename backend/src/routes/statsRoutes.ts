import { Router } from 'express';
import { getDogBreedStatistics } from '../controllers/statsController'; 
import { authenticateToken } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/admin'; 

const router = Router();

/**
 * Todas as rotas de estatísticas exigem autenticação e privilégios de administrador.
 */
router.use(authenticateToken); 
router.use(requireAdmin); 

/**
 * @swagger
 * tags:
 * name: Admin/Stats
 * description: Estatísticas do Sistema (Apenas Admin)
 */

/**
 * @swagger
 * /admin/stats/dog-breeds:
 * get:
 * summary: Retorna a contagem de raças de cães em agendamentos. (Requer Admin)
 * tags: [Admin/Stats]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: Estatísticas de raças.
 */
router.get('/dog-breeds', getDogBreedStatistics);

export default router;