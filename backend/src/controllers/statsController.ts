import { Request, Response } from 'express';
import prisma from '../prisma/client';

/**
 * [GET] /admin/stats/dog-breeds - Calcula a contagem de raças de cães em agendamentos.
 * Requer Admin.
 */
export const getDogBreedStatistics = async (req: Request, res: Response) => {
    try {
        // 1. Encontrar IDs de cães que estão em agendamentos não cancelados
        const dogsInAppointments = await prisma.appointmentDog.findMany({
            select: {
                dogId: true,
            },
            where: {
                appointment: {
                    status: { not: 'CANCELADO' }
                }
            },
        });

        // 2. Usar Set para pegar apenas IDs únicos de cães envolvidos
        const uniqueDogIds = Array.from(new Set(dogsInAppointments.map(ad => ad.dogId)));

        // 3. Buscar as raças desses cães únicos
        const dogs = await prisma.dog.findMany({
            where: {
                id: { in: uniqueDogIds }
            },
            select: {
                raca: true
            }
        });

        // 4. Agrupar e contar as raças
        const breedCounts: { [key: string]: number } = dogs.reduce((acc, dog) => {
            const breed = dog.raca.toLowerCase();
            acc[breed] = (acc[breed] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });
        
        // 5. Converte para o formato de array e ordena por contagem (maior primeiro)
        const statistics = Object.entries(breedCounts)
            .map(([breed, count]) => ({ breed, count }))
            .sort((a, b) => b.count - a.count);
        
        return res.status(200).json({ 
            message: 'Estatísticas de raças carregadas com sucesso.',
            statistics 
        });

    } catch (error) {
        console.error('Erro ao calcular estatísticas de raças:', error);
        return res.status(500).json({ message: 'Erro interno do servidor ao carregar estatísticas.' });
    }
};