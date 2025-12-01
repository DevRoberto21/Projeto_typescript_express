import prisma from '../prisma/client';

export interface BreedStatistic {
    breed: string;
    count: number;
}

/**
 * Calcula a contagem de raças de cães únicos envolvidos em agendamentos ativos (não cancelados).
 * @returns Array de estatísticas de raças ordenado por contagem.
 */
export async function getDogBreedStatisticsService(): Promise<BreedStatistic[]> {
    // 1. COMENTÁRIO: Busca IDs de cães em agendamentos ativos.
    const dogsInAppointments = await prisma.appointmentDog.findMany({
        select: { dogId: true },
        where: {
            appointment: {
                status: { not: 'CANCELADO' }
            }
        },
    });

    // 2. COMENTÁRIO: Filtra IDs únicos para contar cães, não agendamentos.
    const uniqueDogIds = Array.from(new Set(dogsInAppointments.map(ad => ad.dogId)));

    // 3. Busca as raças desses cães únicos
    const dogs = await prisma.dog.findMany({
        where: { id: { in: uniqueDogIds } },
        select: { raca: true }
    });

    // 4. Agrupa e conta as raças (Lógica de Negócio)
    const breedCounts: { [key: string]: number } = dogs.reduce((acc, dog) => {
        const breed = dog.raca.toLowerCase();
        acc[breed] = (acc[breed] || 0) + 1;
        return acc;
    }, {} as { [key: string]: number });

    // 5. Converte para o formato de array e ordena
    const statistics = Object.entries(breedCounts)
        .map(([breed, count]) => ({ breed, count }))
        .sort((a, b) => b.count - a.count);
        
    return statistics;
}