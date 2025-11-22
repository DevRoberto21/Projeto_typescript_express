import api from './client.ts'; 

// Interface para o formato de estatística retornado pela API
export interface BreedStatistic {
    breed: string;
    count: number;
}

/**
 * Busca a contagem de raças de cães em todos os agendamentos.
 * Requer privilégios de Administrador.
 */
export const fetchDogBreedStatistics = async (): Promise<BreedStatistic[]> => {
    const response = await api.get<{ statistics: BreedStatistic[] }>('/admin/stats/dog-breeds');
    // A API retorna { message: '...', statistics: [...] }
    return response.data.statistics; 
};