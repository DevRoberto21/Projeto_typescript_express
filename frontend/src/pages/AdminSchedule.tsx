import React, { useState, useEffect, useCallback } from 'react';
import { fetchBlockedSlots, createBlockedSlot, deleteBlockedSlot } from '../api/blockedSlots';
import { useAuth } from '../hooks/useAuth';
import type { BlockedTimeSlot, CreateBlockedTimeSlotPayload } from '../types';

// Type Guard para tratar erros de Axios
interface AxiosErrorData { response?: { data?: { message?: string } } }
const isAxiosErrorResponse = (error: unknown): error is AxiosErrorData => (error as AxiosErrorData)?.response !== undefined;

export const AdminSchedule: React.FC = () => {
    const { isAdmin } = useAuth();
    const [slots, setSlots] = useState<BlockedTimeSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateBlockedTimeSlotPayload>({
        dateStart: '',
        dateEnd: '',
        reason: '',
    });

    // Função para carregar a lista de bloqueios
    const loadSlots = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchBlockedSlots();
            setSlots(data);
        } catch (err: unknown) {
            let errorMessage = 'Erro ao carregar agenda bloqueada.';
            if (isAxiosErrorResponse(err)) {
                errorMessage = err.response?.data?.message || 'Acesso negado ou erro no servidor.';
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSlots();
    }, [loadSlots]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleCreateSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const newSlot = await createBlockedSlot(formData);
            setSlots(prev => [...prev, newSlot]);
            // Limpa o formulário
            setFormData({ dateStart: '', dateEnd: '', reason: '' });

        } catch (err: unknown) {
            let errorMessage = 'Falha ao bloquear horário.';
            if (isAxiosErrorResponse(err)) {
                // Erro de validação Zod (data inválida) ou conflito
                errorMessage = err.response?.data?.message || 'Erro de validação ou conflito de horário.';
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSlot = async (slotId: string) => {
        if (!window.confirm('Tem certeza que deseja remover este bloqueio de agenda?')) return;
        
        setLoading(true);
        setError(null);
        try {
            await deleteBlockedSlot(slotId);
            setSlots(prev => prev.filter(slot => slot.id !== slotId));
        } catch (err: unknown) {
            let errorMessage = 'Falha ao deletar o bloqueio.';
            if (isAxiosErrorResponse(err)) {
                errorMessage = err.response?.data?.message || 'Erro ao deletar.';
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    };

    if (!isAdmin && !loading) {
        // Esta rota é protegida pelo PrivateRoute, mas esta é uma checagem extra de segurança
        return <div style={errorStyle}>❌ Acesso negado. Esta página é restrita a Administradores.</div>;
    }

    if (loading) return <div style={containerStyle}>Carregando dados de administrador...</div>;

    return (
        <div style={containerStyle}>
            <h1>Gestão de Agenda (ADMIN) 👑</h1>
            <p>Bloqueie horários que não estarão disponíveis para agendamento (feriados, almoço, manutenção, etc.).</p>

            {error && <div style={errorStyle}>Erro: {error}</div>}

            <form onSubmit={handleCreateSlot} style={formContainerStyle}>
                <h3>Bloquear Novo Período</h3>
                
                <label htmlFor="dateStart">Início:</label>
                <input name="dateStart" type="datetime-local" value={formData.dateStart} onChange={handleChange} required style={inputStyle} />
                
                <label htmlFor="dateEnd">Fim:</label>
                <input name="dateEnd" type="datetime-local" value={formData.dateEnd} onChange={handleChange} required style={inputStyle} />

                <label htmlFor="reason">Motivo:</label>
                <input name="reason" type="text" value={formData.reason} onChange={handleChange} placeholder="Motivo do Bloqueio" required style={inputStyle} />

                <button type="submit" disabled={loading} style={submitButtonStyle}>
                    {loading ? 'Bloqueando...' : 'Confirmar Bloqueio'}
                </button>
            </form>

            <h2>Horários Bloqueados Atuais ({slots.length})</h2>
            {loading ? (
                <p>Carregando lista...</p>
            ) : (
                <div style={slotListContainerStyle}>
                    {slots.length === 0 ? (
                        <p>Nenhum horário bloqueado encontrado.</p>
                    ) : (
                        slots.map(slot => (
                            <div key={slot.id} style={slotCardStyle}>
                                <p>Início: <strong>{formatDate(slot.dateStart)}</strong></p>
                                <p>Fim: <strong>{formatDate(slot.dateEnd)}</strong></p>
                                <p>Motivo: <em>{slot.reason}</em></p>
                                <button 
                                    onClick={() => handleDeleteSlot(slot.id)}
                                    style={deleteButtonStyle}
                                    disabled={loading}
                                >
                                    Remover Bloqueio
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// Estilos
const containerStyle: React.CSSProperties = { padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' };
const errorStyle: React.CSSProperties = { padding: '10px', color: 'white', backgroundColor: '#dc3545', borderRadius: '5px', textAlign: 'center', marginBottom: '20px' };
const formContainerStyle: React.CSSProperties = { 
    display: 'grid', 
    gridTemplateColumns: 'minmax(80px, 1fr) 3fr', 
    alignItems: 'center',
    gap: '15px', 
    padding: '20px', 
    border: '1px solid #007bff', 
    borderRadius: '8px', 
    marginBottom: '30px'
};
const inputStyle: React.CSSProperties = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc' };
const submitButtonStyle: React.CSSProperties = { 
    gridColumn: 'span 2', 
    padding: '10px', 
    backgroundColor: '#007bff', 
    color: 'white', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer'
};
const slotListContainerStyle: React.CSSProperties = { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
    gap: '20px',
    marginTop: '20px'
};
const slotCardStyle: React.CSSProperties = {
    border: '1px solid #bbb',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'left',
    backgroundColor: '#f8f8f8'
};
const deleteButtonStyle: React.CSSProperties = {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
    fontSize: '0.9em'
};