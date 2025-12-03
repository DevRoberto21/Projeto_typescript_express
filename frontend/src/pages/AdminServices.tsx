import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';


// 1. Importa as funções de tempo de execução (com a extensão .ts)
import { fetchAllServices, updateServicePrice } from '../api/services.ts'; 
// 2. Importa os tipos usando 'import type' (para satisfazer 'verbatimModuleSyntax')
import type { UpdateServicePayload } from '../api/services.ts'; 
import type { Service } from '../types';

// Type Guard para tratar erros de Axios
interface AxiosErrorData { response?: { data?: { message?: string } } }
const isAxiosErrorResponse = (error: unknown): error is AxiosErrorData => (error as AxiosErrorData)?.response !== undefined;


export const AdminServices: React.FC = () => {
    const { isAdmin } = useAuth(); 
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    
    const [editPrices, setEditPrices] = useState<Omit<UpdateServicePayload, 'name'>>({
        pricePequeno: 0,
        priceMedio: 0,
        priceGrande: 0,
    });

    const fetchServices = useCallback(async () => {
        if (!isAdmin) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Se houver um erro de rede ou na API, a lista estará vazia, 
            // mas o estado de erro será atualizado.
            const data = await fetchAllServices();
            setServices(data);
        } catch (err: unknown) {
            console.error('Erro ao carregar serviços:', err);
            let errorMessage = 'Erro ao carregar dados de serviços. Verifique a API.';
            if (isAxiosErrorResponse(err)) {
                errorMessage = err.response?.data?.message || errorMessage;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const handleEditClick = (service: Service) => {
        setIsEditing(service.id);
        setEditPrices({
            pricePequeno: service.pricePequeno,
            priceMedio: service.priceMedio,
            priceGrande: service.priceGrande,
        });
    };

    const handlePriceChange = (porte: keyof Omit<UpdateServicePayload, 'name'>, value: string) => {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) && numericValue >= 0) {
            // Aqui garantimos que o valor é mantido como número (float)
            setEditPrices(prev => ({ ...prev, [porte]: numericValue }));
        }
    };

    const handleSave = async (serviceId: string) => {
        // Garantindo que não estamos tentando salvar com valores nulos/inválidos
        if (loading || isNaN(editPrices.pricePequeno) || isNaN(editPrices.priceMedio) || isNaN(editPrices.priceGrande)) {
            setError('Preços inválidos. Certifique-se de que todos os campos são números válidos.');
            return;
        }

        try {
            setLoading(true);
            setError(null); // Limpa erros anteriores
            await updateServicePrice(serviceId, editPrices);
            setIsEditing(null);
            await fetchServices(); 
        } catch (err: unknown) {
            console.error('Erro ao salvar serviço:', err);
            let errorMessage = 'Erro ao salvar o preço do serviço.';
            if (isAxiosErrorResponse(err)) {
                errorMessage = err.response?.data?.message || errorMessage;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // 1. Proteção de rota
    if (!isAdmin) return <div style={{ padding: '20px', color: 'white', backgroundColor: '#dc3545', borderRadius: '5px', textAlign: 'center' }}>Acesso Negado. Esta página é restrita a Administradores.</div>;

    // 2. Estado de carregamento inicial
    if (loading && services.length === 0 && !error) {
        return <div style={{ padding: '20px' }}>Carregando serviços...</div>;
    }

    // 3. Estado de Erro
    if (error) {
        return <div style={{ padding: '20px', color: 'white', backgroundColor: '#dc3545', borderRadius: '5px', textAlign: 'center' }}>❌ Erro: {error}</div>;
    }

    return (
        <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>Gerenciamento de Valores de Serviços 💰</h1>
            <p style={{ marginBottom: '20px' }}>
                Aqui você pode visualizar e atualizar os preços dos serviços (Banho, Tosa, etc.) para cada porte de cão (Pequeno, Médio, Grande).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {services.map((service) => (
                    <div 
                        key={service.id} 
                        style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                    >
                        <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{service.name}</h3>
                        
                        {isEditing === service.id ? (
                            // Modo de Edição
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 0.5fr', gap: '10px', alignItems: 'center' }}>
                                
                                {['pricePequeno', 'priceMedio', 'priceGrande'].map(key => {
                                    const priceKey = key as keyof Omit<UpdateServicePayload, 'name'>;
                                    return (
                                        <label key={key} style={{ fontWeight: 'bold', fontSize: '0.9em' }}>
                                            {key.replace('price', '')}:
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                // O valor do input precisa ser uma string, usamos .toString()
                                                value={editPrices[priceKey].toString()} 
                                                onChange={(e) => handlePriceChange(priceKey, e.target.value)}
                                                style={{ width: '90%', padding: '5px', marginTop: '5px', border: '1px solid #007bff' }}
                                            />
                                        </label>
                                    );
                                })}

                                <div style={{ display: 'flex', gap: '5px', marginTop: '20px' }}>
                                    <button 
                                        onClick={() => handleSave(service.id)} 
                                        disabled={loading}
                                        style={{ padding: '8px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        {loading ? 'Salvando...' : 'Salvar'}
                                    </button>
                                    <button 
                                        onClick={() => setIsEditing(null)} 
                                        disabled={loading}
                                        style={{ padding: '8px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Modo de Visualização
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p>Pequeno: <strong>{formatPrice(service.pricePequeno)}</strong></p>
                                    <p>Médio: <strong>{formatPrice(service.priceMedio)}</strong></p>
                                    <p>Grande: <strong>{formatPrice(service.priceGrande)}</strong></p>
                                </div>
                                <button 
                                    onClick={() => handleEditClick(service)}
                                    style={{ padding: '10px 15px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Editar Preços
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {loading && services.length > 0 && <p style={{ marginTop: '20px' }}>Processando solicitação...</p>}
        </div>
    );
};

export default AdminServices;