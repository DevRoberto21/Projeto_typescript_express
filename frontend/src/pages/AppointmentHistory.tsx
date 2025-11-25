import React, { useState, useEffect, useCallback } from 'react';
import { fetchMyAppointments } from '../api/appointments';
import type { Appointment, AppointmentStatus } from '../types';

// Type Guard para tratar erros de Axios (reutilizado de outros componentes)
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
            // Chama a nova função de serviço
            const data = await fetchMyAppointments();
            setAppointments(data);
        } catch (err: unknown) {
            let errorMessage = 'Erro ao carregar o histórico de agendamentos.';
            if (isAxiosErrorResponse(err)) {
                errorMessage = err.response?.data?.message || errorMessage;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    const getStatusStyle = (status: AppointmentStatus): React.CSSProperties => {
        switch (status) {
            case 'AGENDADO':
                return { color: '#007bff', fontWeight: 'bold' };
            case 'CONCLUIDO':
                return { color: '#28a745', fontWeight: 'bold' };
            case 'CANCELADO':
                return { color: '#dc3545', fontWeight: 'bold' };
            default:
                return {};
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
                        <div key={app.id} style={cardStyle}>
                            <p style={{ fontSize: '1.1em', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                Data: **{formatDate(app.date)}**
                            </p>
                            <p>
                                Status: <span style={getStatusStyle(app.status)}>{app.status}</span>
                            </p>

                            <h3 style={sectionHeaderStyle}>Cães ({app.dogs.length})</h3>
                            <ul style={listStyle}>
                                {/* O backend retorna um array de objetos Dog aninhados na junção */}
                                {app.dogs.map(dog => (
                                    <li key={dog.id}>{dog.nome} ({dog.raca})</li>
                                ))}
                            </ul>

                            <h3 style={sectionHeaderStyle}>Serviços ({app.services.length})</h3>
                            <ul style={listStyle}>
                                {/* O backend retorna um array de objetos Service aninhados na junção */}
                                {app.services.map(service => (
                                    <li key={service.id}>{service.name}</li>
                                ))}
                            </ul>
                            
                            <button style={detailButtonStyle}>Ver Detalhes</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Estilos
const containerStyle: React.CSSProperties = { padding: '30px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' };
const listContainerStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' };
const cardStyle: React.CSSProperties = { border: '1px solid #ddd', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.05)', backgroundColor: 'white', color: '#333' };
const sectionHeaderStyle: React.CSSProperties = { fontSize: '1em', marginTop: '15px', marginBottom: '5px', color: '#007bff' };
const listStyle: React.CSSProperties = { listStyleType: 'disc', paddingLeft: '20px', margin: '0 0 10px 0' };
const errorStyle: React.CSSProperties = { padding: '10px', color: 'white', backgroundColor: '#dc3545', borderRadius: '5px', textAlign: 'center' };
const detailButtonStyle: React.CSSProperties = { padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' };