import React, { useState, useEffect, useCallback } from 'react';
import { fetchMyAppointments, cancelAppointment } from '../api/appointments';
// COMENTÁRIO: Importa apenas o tipo 'Appointment', resolvendo o erro 'AppointmentStatus' unused.
import type { Appointment } from '../types'; 

// COMENTÁRIO: Importa estilos e a função getStatusStyle do arquivo dedicado.
import {
    containerStyle, listContainerStyle, cardStyle, sectionHeaderStyle, 
    listStyle, errorStyle, cancelButtonStyle, getStatusStyle
} from './AppointmentHistoryStyles'; // Assumindo este arquivo foi criado


// Type Guard para tratar erros de Axios
interface AxiosErrorData { response?: { data?: { message?: string } } }
const isAxiosErrorResponse = (error: unknown): error is AxiosErrorData => (error as AxiosErrorData)?.response !== undefined;

export const AppointmentHistory: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadAppointments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchMyAppointments();
            // Ordenar do mais recente para o mais antigo
            setAppointments(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (err: unknown) {
            // COMENTÁRIO: Trata o erro e extrai a mensagem.
            let errorMessage = 'Erro ao carregar o histórico de agendamentos.';
            if (isAxiosErrorResponse(err)) {
                errorMessage = err.response?.data?.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    // Lógica de Cancelamento (Regra de 24h)
    const handleCancel = async (id: string, dateString: string | Date) => {
        const appointmentDate = new Date(dateString);
        const now = new Date();
        
        // Diferença em horas
        const diffHours = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        // COMENTÁRIO: Regra de negócio: Requer no mínimo 24h para cancelar.
        if (diffHours < 24) {
            alert("Cancelamento não permitido. É necessário no mínimo 24h de antecedência.");
            return;
        }

        if (!window.confirm("Tem certeza que deseja cancelar este agendamento?")) return;

        try {
            await cancelAppointment(id);
            setAppointments(prev => prev.filter(app => app.id !== id));
            alert("Agendamento cancelado com sucesso.");
        } catch (error) {
            console.error("Falha ao cancelar:", error);
            alert("Erro ao cancelar agendamento. Tente novamente.");
        }
    };
    
    const formatDate = (dateString: string | Date) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    };

    if (loading) return <div style={containerStyle}>Carregando histórico de agendamentos...</div>;
    if (error) return <div style={{ ...containerStyle, ...errorStyle }}>Erro: {error}</div>; 

    return (
        <div style={containerStyle}>
            <h1>Meu Histórico de Agendamentos</h1>
            
            {appointments.length === 0 ? (
                <p style={{ marginTop: '20px' }}>Você ainda não possui agendamentos. <a href="/appointments/new">Agende seu primeiro serviço!</a></p>
            ) : (
                <div style={listContainerStyle}>
                    {appointments.map(app => (
                        <div key={app.id} style={{...cardStyle, opacity: app.status === 'CANCELADO' ? 0.6 : 1}}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                                <span style={{ fontSize: '1.1em' }}>Data: <strong>{formatDate(app.date)}</strong></span>
                                <span style={getStatusStyle(app.status)}>{app.status}</span> 
                            </div>

                            <h3 style={sectionHeaderStyle}>Cães ({app.dogs.length})</h3>
                            <ul style={listStyle}>
                                {app.dogs.map(dog => (
                                    <li key={dog.id}>{dog.nome} ({dog.raca})</li>
                                ))}
                            </ul>

                            <h3 style={sectionHeaderStyle}>Serviços ({app.services.length})</h3>
                            <ul style={listStyle}>
                                {app.services.map(service => (
                                    <li key={service.id}>{service.name}</li>
                                ))}
                            </ul>
                            
                            {/* Botão de Cancelamento (Apenas se AGENDADO) */}
                            {app.status === 'AGENDADO' && (
                                <button 
                                    onClick={() => handleCancel(app.id, app.date)}
                                    style={cancelButtonStyle}
                                >
                                    Cancelar Agendamento
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};