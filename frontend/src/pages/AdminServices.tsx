import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
// Importação separada para valores e tipos (Boas Práticas + Vite Strict)
import { fetchAllServices, updateServicePrice } from '../api/services';
import type { UpdateServicePayload } from '../api/services'; 
import type { Service } from '../types';

export const AdminServices: React.FC = () => {
    const { isAdmin } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<UpdateServicePayload>({ pricePequeno: 0, priceMedio: 0, priceGrande: 0 });

    // 1. Carregamento Inicial (Definido dentro do useEffect para evitar problemas de dependência/linter)
    useEffect(() => {
        if (!isAdmin) return;

        const loadData = async () => {
            try {
                const data = await fetchAllServices();
                setServices(data);
            } catch (error) {
                console.error("Erro ao carregar serviços:", error);
            }
        };

        loadData();
    }, [isAdmin]); // Depende apenas de isAdmin

    // 2. Função auxiliar para recarregar dados (usada após salvar)
    const refreshServices = async () => {
        try {
            const data = await fetchAllServices();
            setServices(data);
        } catch (error) {
            console.error("Erro ao recarregar:", error);
        }
    };

    const startEdit = (service: Service) => {
        setEditingId(service.id);
        setEditForm({
            pricePequeno: service.pricePequeno,
            priceMedio: service.priceMedio,
            priceGrande: service.priceGrande
        });
    };

    const handleSave = async () => {
        if (!editingId) return;
        try {
            await updateServicePrice(editingId, editForm);
            setEditingId(null);
            await refreshServices(); // Recarrega a lista
            alert('Preços atualizados com sucesso!');
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert('Erro ao atualizar preços.');
        }
    };

    if (!isAdmin) return <div>Acesso Negado</div>;

    return (
        <div className="container">
            <h1>Gerenciar Serviços e Preços 💰</h1>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {services.map(service => (
                    <div key={service.id} className="card">
                        <h3>{service.name}</h3>
                        
                        {editingId === service.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label>
                                    Pequeno: R$ <input type="number" value={editForm.pricePequeno} onChange={e => setEditForm({...editForm, pricePequeno: parseFloat(e.target.value)})} style={{width: '100%', padding: '5px'}} />
                                </label>
                                <label>
                                    Médio: R$ <input type="number" value={editForm.priceMedio} onChange={e => setEditForm({...editForm, priceMedio: parseFloat(e.target.value)})} style={{width: '100%', padding: '5px'}} />
                                </label>
                                <label>
                                    Grande: R$ <input type="number" value={editForm.priceGrande} onChange={e => setEditForm({...editForm, priceGrande: parseFloat(e.target.value)})} style={{width: '100%', padding: '5px'}} />
                                </label>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button onClick={handleSave} className="btn btn-success">Salvar</button>
                                    <button onClick={() => setEditingId(null)} className="btn btn-danger">Cancelar</button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p>Pequeno: <strong>R$ {service.pricePequeno.toFixed(2)}</strong></p>
                                <p>Médio: <strong>R$ {service.priceMedio.toFixed(2)}</strong></p>
                                <p>Grande: <strong>R$ {service.priceGrande.toFixed(2)}</strong></p>
                                <button onClick={() => startEdit(service)} className="btn btn-primary" style={{marginTop: '15px'}}>Editar Preços</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};