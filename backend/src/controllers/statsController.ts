import { Request, Response } from 'express';
import { getDogBreedStatisticsService } from '../services/statsService';

/**
 * [GET] /admin/stats/dog-breeds - Calcula a contagem de raças de cães em agendamentos.
 * Requer Admin.
 */
export const getDogBreedStatistics = async (req: Request, res: Response) => {
    try {
        // COMENTÁRIO: Delega toda a lógica de cálculo e agregação ao Service.
        const statistics = await getDogBreedStatisticsService();
        
        return res.status(200).json({ 
            message: 'Estatísticas de raças carregadas com sucesso.',
            statistics 
        });

    } catch (error) {
        console.error('Erro ao calcular estatísticas de raças:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao carregar estatísticas.' });
    }
};