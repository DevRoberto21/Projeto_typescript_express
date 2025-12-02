import React, { useState, useEffect, useCallback } from 'react';
import { fetchBlockedSlots, createBlockedSlot, deleteBlockedSlot } from '../api/blockedSlots';
import { useAuth } from '../hooks/useAuth';
import type { BlockedTimeSlot, CreateBlockedTimeSlotPayload } from '../types';

import {
    containerStyle, errorStyle, formContainerStyle, inputStyle, 
    submitButtonStyle, slotListContainerStyle, slotCardStyle, deleteButtonStyle,
    formHeaderStyle // NOVO: Importa o novo estilo de cabeçalho e aplica ele no H3
} from './AdminScheduleStyles'; 


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

        const startTime = new Date(formData.dateStart);
        const endTime = new Date(formData.dateEnd);
        
        // Validação básica de datas: Início deve ser anterior ao fim
        if (startTime.getTime() >= endTime.getTime()) {
            setError('A data/hora de início deve ser anterior à data/hora de fim.');
            setLoading(false);
            return;
        }

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
        return <div style={errorStyle}>❌ Acesso negado. Esta página é restrita a Administradores.</div>;
    }

    if (loading) return <div style={containerStyle}>Carregando dados de administrador...</div>;
    
    // Calcula a data e hora mínima (agora) para evitar bloqueios no passado
    const now = new Date();
    // Garante que o minDateTime está em formato YYYY-MM-DDTHH:MM
    const minDateTime = now.toISOString().slice(0, 16);

    return (
        <div style={containerStyle}>
            <h1>Gestão de Agenda (ADMIN) 👑</h1>
            <p>Bloqueie horários que não estarão disponíveis para agendamento (feriados, almoço, manutenção, etc.).</p>

            {error && <div style={errorStyle}>Erro: {error}</div>}

            <form onSubmit={handleCreateSlot} style={formContainerStyle}>
                <h3 style={formHeaderStyle}>Bloquear Novo Período</h3>
                
                <label htmlFor="dateStart">Início:</label>
                <input 
                    name="dateStart" 
                    type="datetime-local" 
                    value={formData.dateStart} 
                    onChange={handleChange} 
                    required 
                    style={inputStyle}
                    min={minDateTime} // Mantido para evitar bloqueios no passado
                />
                
                <label htmlFor="dateEnd">Fim:</label>
                <input 
                    name="dateEnd" 
                    type="datetime-local" 
                    value={formData.dateEnd} 
                    onChange={handleChange} 
                    required 
                    style={inputStyle} 
                    min={formData.dateStart || minDateTime} // O fim deve ser depois do início
                />

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