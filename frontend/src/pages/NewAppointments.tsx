import React, { useState, useEffect, useMemo, useCallback } from 'react'; 
import { Link } from 'react-router-dom'; // REMOVIDO: useNavigate
import { useAuth } from '../hooks/useAuth';
import { fetchMyDogs } from '../api/dogs';
// Agora essas importações funcionarão pois atualizamos o arquivo api/appointments.ts
import { fetchAvailableServices, createAppointment, fetchBusySlots } from '../api/appointments';
import type { BusySlotsResponse } from '../api/appointments'; // Import type separado
import { generateTimeSlots } from '../utils/scheduleUtils';
import type { Dog, Service, CreateAppointmentPayload, Porte } from '../types';

// Type Guard para tratar erros de Axios
interface AxiosErrorData { response?: { data?: { message?: string } } }
const isAxiosErrorResponse = (error: unknown): error is AxiosErrorData => (error as AxiosErrorData)?.response !== undefined;

// --- DEFINIÇÕES DE ESTILO ---

const containerStyle: React.CSSProperties = { padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' };
const errorStyle: React.CSSProperties = { padding: '10px', color: 'white', backgroundColor: '#dc3545', borderRadius: '5px', textAlign: 'center', marginBottom: '20px' };
const formStyle: React.CSSProperties = { border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginTop: '20px' };
const stepContainerStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputStyle: React.CSSProperties = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }; 
const slotSelectionContainerStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }; 
const navigationButtonStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', marginTop: '20px' };
const selectedDateTimeStyle: React.CSSProperties = { padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px', fontWeight: 'bold' };
const summaryStyle: React.CSSProperties = { padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px' }; 
const submitButtonStyle: React.CSSProperties = { padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1em' };
const backButtonStyle: React.CSSProperties = { padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

const successMessageStyle: React.CSSProperties = {
    padding: '20px',
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    borderRadius: '8px',
    marginBottom: '30px',
    textAlign: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
};
const successLinkStyle: React.CSSProperties = {
    display: 'inline-block',
    marginTop: '10px',
    padding: '10px 20px',
    margin: '0 5px',
    backgroundColor: '#155724',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontWeight: 'bold'
};

const timeSlotStyle = (isSelected: boolean, isBusy: boolean): React.CSSProperties => ({
    padding: '8px',
    borderRadius: '4px',
    border: `1px solid ${isSelected ? '#007bff' : isBusy ? '#dc3545' : '#ccc'}`,
    backgroundColor: isSelected ? '#e0f7ff' : isBusy ? '#ffe6e6' : '#f8f8f8',
    color: isSelected ? '#007bff' : isBusy ? '#721c24' : '#333',
    cursor: isBusy ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s',
    fontWeight: isSelected || isBusy ? 'bold' : 'normal',
    opacity: isBusy ? 0.7 : 1,
});

const dogButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '10px',
    borderRadius: '8px',
    border: `2px solid ${isSelected ? '#28a745' : '#ccc'}`,
    backgroundColor: isSelected ? '#e6ffe6' : 'white',
    color: '#333',
    cursor: 'pointer',
    textAlign: 'center',
});

const serviceButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '10px',
    borderRadius: '8px',
    border: `2px solid ${isSelected ? '#007bff' : '#ccc'}`,
    backgroundColor: isSelected ? '#e0f7ff' : 'white',
    color: '#333',
    cursor: 'pointer',
    textAlign: 'center',
});


export const NewAppointment: React.FC = () => {
    const { user } = useAuth();
    // REMOVIDO: const navigate = useNavigate(); (Não estava sendo usado)
    
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Tipagem correta aplicada aqui
    const [busySlotsData, setBusySlotsData] = useState<BusySlotsResponse>({ appointments: [], blockedSlots: [] });

    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [selectedDogIds, setSelectedDogIds] = useState<string[]>([]);
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]); 
    const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
    
    const [successMessage, setSuccessMessage] = useState<string | null>(null); 

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                const dogsData = await fetchMyDogs();
                setDogs(dogsData);
                const servicesData = await fetchAvailableServices();
                setServices(servicesData);
            } catch (err: unknown) {
                let errorMessage = 'Erro ao carregar dados iniciais.';
                if (isAxiosErrorResponse(err)) {
                    errorMessage = err.response?.data?.message || errorMessage;
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // Efeito para buscar horários ocupados
    useEffect(() => {
        if (!selectedDate) {
            setAvailableTimeSlots([]);
            setBusySlotsData({ appointments: [], blockedSlots: [] });
            return;
        }
        
        const dateObj = new Date(selectedDate);
        const allSlots = generateTimeSlots(dateObj); 
        
        const loadBusySlots = async () => {
            try {
                const data = await fetchBusySlots(selectedDate);
                setBusySlotsData(data);
            } catch (err) {
                console.error("Failed to fetch busy slots:", err);
            }
        };

        loadBusySlots();
        setAvailableTimeSlots(allSlots);
    }, [selectedDate]);

    // Lógica de verificação de ocupação
    const isSlotBusy = useCallback((time: string): boolean => {
        if (!selectedDate) return false;
        
        const checkTimeISO = `${selectedDate}T${time}:00.000Z`;
        const checkTime = new Date(checkTimeISO);
        const toDate = (isoString: string) => new Date(isoString);
        
        // TypeScript agora sabe que 'block' tem { start: string, end: string } graças à interface BusySlotsResponse
        const isBlocked = busySlotsData.blockedSlots.some(block => {
            const slotEndTime = new Date(checkTime.getTime() + 30 * 60 * 1000); 
            return toDate(block.start) < slotEndTime && toDate(block.end) > checkTime;
        });

        if (isBlocked) return true;

        // TypeScript agora sabe que 'appDateISO' é string
        const isAppointed = busySlotsData.appointments.some(appDateISO => {
            const appStartTime = toDate(appDateISO);
            return appStartTime.toISOString() === checkTime.toISOString(); 
        });

        return isAppointed;

    }, [selectedDate, busySlotsData]);


    const totalPrice = useMemo(() => {
        if (!selectedDogIds.length || !selectedServiceIds.length) return 0;
        
        const firstDog = dogs.find(d => d.id === selectedDogIds[0]);
        if (!firstDog) return 0;
        
        return selectedServiceIds.reduce((total, serviceId) => {
            const service = services.find(s => s.id === serviceId);
            if (!service) return total;
            
            const porteKey = firstDog.porte as Porte;
            switch (porteKey) {
                case 'PEQUENO': return total + service.pricePequeno;
                case 'MEDIO': return total + service.priceMedio;
                case 'GRANDE': return total + service.priceGrande;
                default: return total;
            }
        }, 0);
    }, [selectedDogIds, selectedServiceIds, dogs, services]);

    const handleDogSelection = useCallback((dogId: string) => {
        setSelectedDogIds(prev => prev.includes(dogId) ? prev.filter(id => id !== dogId) : [...prev, dogId]);
    }, []);

    const handleServiceSelection = useCallback((serviceId: string) => {
        setSelectedServiceIds(prev => prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedDate || !selectedTime || !selectedDogIds.length || !selectedServiceIds.length) {
            setError("Por favor, preencha todas as etapas.");
            return;
        }

        if (isSlotBusy(selectedTime)) {
            setError("Este horário acabou de ser ocupado. Por favor, escolha outro.");
            return;
        }

        const combinedDateTime = `${selectedDate}T${selectedTime}:00`; 
        const payload: CreateAppointmentPayload = {
            date: combinedDateTime,
            dogIds: selectedDogIds,
            serviceIds: selectedServiceIds,
        };

        setLoading(true);
        try {
            await createAppointment(payload);
            setSuccessMessage('Agendamento criado com sucesso! O pagamento deve ser realizado no balcão.');
            setSelectedDogIds([]);
            setSelectedServiceIds([]);
            setSelectedDate('');
            setSelectedTime('');
        } catch (err: unknown) {
            let errorMessage = 'Falha ao agendar. Verifique os dados.';
            if (isAxiosErrorResponse(err)) {
                errorMessage = err.response?.data?.message || errorMessage;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    const goToStep2 = () => {
        if (!selectedDate || !selectedTime) {
            setError("Por favor, selecione uma data e um horário.");
            return;
        }
        if (isSlotBusy(selectedTime)) {
            setError("O horário selecionado está indisponível. Escolha outro.");
            return;
        }
        setStep(2);
        setError(null);
    };

    const firstName = user?.nome?.split(' ')[0];

    if (loading) return <div style={containerStyle}>Carregando dados...</div>;
    if (error && dogs.length === 0 && services.length === 0) return <div style={errorStyle}>Erro crítico: {error}</div>;

    if (dogs.length === 0) {
        return <div style={containerStyle}>Você precisa cadastrar um cão antes de agendar. <Link to="/dogs">Ir para Gestão de Cães</Link></div>;
    }
    if (services.length === 0) {
        return <div style={containerStyle}>Nenhum serviço disponível no momento.</div>;
    }

    return (
        <div style={containerStyle}>
            <h1>Novo Agendamento para {firstName}</h1>
            <p style={{marginBottom: '20px'}}>Etapa: {step} de 2</p>

            {error && <div style={errorStyle}>Erro: {error}</div>}

            {successMessage ? (
                <div style={successMessageStyle}>
                    <p style={{fontSize: '1.2em', fontWeight: 'bold'}}>{successMessage}</p>
                    <div style={{marginTop: '20px'}}>
                        <Link to="/appointments" style={successLinkStyle}>Ver Histórico</Link>
                        <Link to="/dashboard" style={{...successLinkStyle, backgroundColor: '#007bff'}}>Voltar ao Menu Principal</Link>
                    </div>
                </div>

            ) : ( 
                <form onSubmit={handleSubmit} style={formStyle}>
                    
                    {/* --- ETAPA 1 --- */}
                    {step === 1 && (
                        <div style={stepContainerStyle}>
                            <h2>1. Selecione a Data e Hora (9:00h - 17:00h)</h2>
                            
                            <div className="form-group">
                                <label htmlFor="date-input">Data do Serviço (Padrão BR):</label>
                                <input
                                    id="date-input"
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }} 
                                    required
                                    min={new Date().toISOString().split('T')[0]} 
                                    style={inputStyle} 
                                />
                            </div>

                            {selectedDate && (
                                <div style={slotSelectionContainerStyle}>
                                    {availableTimeSlots.map(time => {
                                        const isBusy = isSlotBusy(time);
                                        return (
                                            <button
                                                type="button"
                                                key={time}
                                                onClick={() => !isBusy && setSelectedTime(time)}
                                                disabled={isBusy}
                                                style={timeSlotStyle(time === selectedTime, isBusy)}
                                            >
                                                {time} {isBusy ? '(Ocupado)' : ''}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            
                            <div style={navigationButtonStyle}>
                                <button type="button" onClick={goToStep2} style={submitButtonStyle}> 
                                    Próxima Etapa (Cães/Serviços)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- ETAPA 2 --- */}
                    {step === 2 && (
                        <div style={stepContainerStyle}>
                            <h2>2. Cães e Serviços</h2>
                            <p style={selectedDateTimeStyle}>Horário Selecionado: <strong>{new Date(`${selectedDate}T${selectedTime}`).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })} às {selectedTime}</strong></p>

                            <h3>Selecione o(s) Cão(s)</h3>
                            <div style={slotSelectionContainerStyle}> 
                                {dogs.map(dog => (
                                    <button
                                        type="button"
                                        key={dog.id}
                                        onClick={() => { handleDogSelection(dog.id); }}
                                        style={dogButtonStyle(selectedDogIds.includes(dog.id))}
                                    >
                                        {dog.nome} ({dog.porte})
                                    </button>
                                ))}
                            </div>

                            <h3>Selecione o(s) Serviço(s)</h3>
                            <div style={slotSelectionContainerStyle}> 
                                {services.map(service => (
                                    <button
                                        type="button"
                                        key={service.id}
                                        onClick={() => { handleServiceSelection(service.id); }}
                                        style={serviceButtonStyle(selectedServiceIds.includes(service.id))}
                                    >
                                        {service.name}
                                    </button>
                                ))}
                            </div>
                            
                            <div style={summaryStyle}> 
                                <h3>Resumo & Pagamento</h3>
                                <p>Custo Estimado: R$ {totalPrice.toFixed(2)}</p>
                                <p style={{ fontWeight: 'bold', color: 'var(--color-danger)' }}>Atenção: O pagamento deve ser realizado diretamente no balcão.</p>
                            </div>

                            <div style={navigationButtonStyle}>
                                <button type="button" onClick={() => setStep(1)} style={backButtonStyle}> 
                                    Voltar para Data
                                </button>
                                <button type="submit" disabled={loading || !selectedDogIds.length || !selectedServiceIds.length} style={submitButtonStyle}> 
                                    {loading ? 'Agendando...' : 'Confirmar Agendamento'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            )}
        </div>
    );
};