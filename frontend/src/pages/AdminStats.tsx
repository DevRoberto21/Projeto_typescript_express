import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { fetchDogBreedStatistics } from '../api/stats.ts'; 
import type { BreedStatistic } from '../api/stats.ts';

// Registrar os componentes do Chart.js para serem usados
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Type Guard para tratar erros de Axios (necessário para o catch)
interface AxiosErrorData { response?: { data?: { message?: string } } }
const isAxiosErrorResponse = (error: unknown): error is AxiosErrorData => (error as AxiosErrorData)?.response !== undefined;


export const AdminStats: React.FC = () => {
    // CORRIGIDO: Desestruturando apenas o que será usado.
    const { isAdmin } = useAuth(); 
    const [stats, setStats] = useState<BreedStatistic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // O useEffect agora tem a lógica completa, eliminando os warnings de 'unused'
    useEffect(() => {
        if (!isAdmin) {
            setLoading(false);
            return;
        }

        const loadStats = async () => {
            try {
                const data = await fetchDogBreedStatistics();
                setStats(data);
            } catch (err: unknown) { // CORRIGIDO: Usando 'unknown' em vez de 'any'
                let errorMessage = 'Erro ao carregar dados de estatísticas.';
                if (isAxiosErrorResponse(err)) {
                    // Trata erro de permissão (403) ou erro de API
                    errorMessage = err.response?.data?.message || 'Erro ao carregar dados de estatísticas.';
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [isAdmin]); // Dependência adicionada

    if (!isAdmin && !loading) {
        return <div style={errorStyle}>❌ Acesso negado. Esta página requer privilégios de Administrador.</div>;
    }

    if (loading) {
        return <div style={{ padding: '20px' }}>Carregando estatísticas...</div>;
    }

    if (error) {
        return <div style={errorStyle}>Erro: {error}</div>;
    }

    // 2. Preparação dos dados para o Chart.js
    const chartData = {
        labels: stats.map(s => s.breed.charAt(0).toUpperCase() + s.breed.slice(1)), // Capitaliza o nome da raça
        datasets: [
            {
                label: 'Número de Agendamentos (Cães Únicos)',
                data: stats.map(s => s.count),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Raças de Cães Mais Agendadas',
            },
        },
    };

    return (
        <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h1>Dashboard de Estatísticas 👑</h1>
            <p>Estatísticas de raças para {stats.length} raças únicas encontradas nos agendamentos.</p>
            
            {stats.length === 0 ? (
                <div style={{ marginTop: '30px', textAlign: 'center', color: '#6c757d' }}>
                    <p>Nenhum dado de agendamento encontrado para calcular as estatísticas.</p>
                </div>
            ) : (
                <div style={{ marginTop: '30px' }}>
                    <Bar data={chartData} options={options} />
                </div>
            )}
            
        </div>
    );
};

const errorStyle: React.CSSProperties = {
    padding: '20px', 
    color: 'white', 
    backgroundColor: '#dc3545', 
    borderRadius: '5px', 
    textAlign: 'center'
};