import React, { useState, useEffect, useMemo, useCallback } from 'react'; 
import { useNavigate, Link } from 'react-router-dom'; 
import { useAuth } from '../hooks/useAuth';
import { fetchMyDogs } from '../api/dogs';
import { fetchAvailableServices, createAppointment } from '../api/appointments';
import { generateTimeSlots } from '../utils/scheduleUtils';
import type { Dog, Service, CreateAppointmentPayload, Porte } from '../types';

// Type Guard para tratar erros de Axios
interface AxiosErrorData { response?: { data?: { message?: string } } }
const isAxiosErrorResponse = (error: unknown): error is AxiosErrorData => (error as AxiosErrorData)?.response !== undefined;

// --- DEFINIÇÕES DE ESTILO (Todas as variáveis reportadas são usadas abaixo) ---

const containerStyle: React.CSSProperties = { padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' };
const errorStyle: React.CSSProperties = { padding: '10px', color: 'white', backgroundColor: '#dc3545', borderRadius: '5px', textAlign: 'center', marginBottom: '20px' };
const formStyle: React.CSSProperties = { border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginTop: '20px' };
const stepContainerStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '20px' };
const inputStyle: React.CSSProperties = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }; // AGORA USADO
const slotSelectionContainerStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }; 
const navigationButtonStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', marginTop: '20px' };
const selectedDateTimeStyle: React.CSSProperties = { padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px', fontWeight: 'bold' };
const summaryStyle: React.CSSProperties = { padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px' }; // AGORA USADO
const submitButtonStyle: React.CSSProperties = { padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1em' }; // AGORA USADO
const backButtonStyle: React.CSSProperties = { padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }; // AGORA USADO

// Estilos específicos do agendamento
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

const timeSlotStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '8px',
    borderRadius: '4px',
    border: `1px solid ${isSelected ? '#007bff' : '#ccc'}`,
    backgroundColor: isSelected ? '#e0f7ff' : '#f8f8f8',
    color: isSelected ? '#007bff' : '#333',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontWeight: isSelected ? 'bold' : 'normal',
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
    const navigate = useNavigate(); 
    
    // Dados carregados
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estado do Formulário
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [selectedDogIds, setSelectedDogIds] = useState<string[]>([]);
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]); 
    const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
    
    const [successMessage, setSuccessMessage] = useState<string | null>(null); 

    // 1. Carregar dados de cães e serviços
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

    // 2. Efeito para gerar os slots de horário quando a data for selecionada
    useEffect(() => {
        if (selectedDate) {
            const dateObj = new Date(selectedDate);
            const slots = generateTimeSlots(dateObj); 
            setAvailableTimeSlots(slots);
        } else {
            setAvailableTimeSlots([]);
        }
    }, [selectedDate]);


    // 3. Cálculo do Preço Estimado
    const totalPrice = useMemo(() => {
        if (!selectedDogIds.length || !selectedServiceIds.length) return 0;
        
        const firstDog = dogs.find(d => d.id === selectedDogIds[0]);
        if (!firstDog) return 0;
        
        return selectedServiceIds.reduce((total, serviceId) => {
            const service = services.find(s => s.id === serviceId);
            if (!service) return total;
            
            const porteKey = firstDog.porte as Porte;
            
            switch (porteKey) {
                case 'PEQUENO':
                    return total + service.pricePequeno;
                case 'MEDIO':
                    return total + service.priceMedio;
                case 'GRANDE':
                    return total + service.priceGrande;
                default:
                    return total;
            }
        }, 0);
    }, [selectedDogIds, selectedServiceIds, dogs, services]);

    // 4. Handlers de Seleção 
    const handleDogSelection = useCallback((dogId: string) => {
        setSelectedDogIds(prev =>
            prev.includes(dogId) ? prev.filter(id => id !== dogId) : [...prev, dogId]
        );
    }, []);

    const handleServiceSelection = useCallback((serviceId: string) => {
        setSelectedServiceIds(prev =>
            prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
        );
    }, []);


    // 5. Submissão do Formulário
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedDate || !selectedTime || !selectedDogIds.length || !selectedServiceIds.length) {
            setError("Por favor, preencha todas as etapas.");
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
    
    // Funções de navegação entre etapas
    const goToStep2 = () => {
        if (!selectedDate || !selectedTime) {
            setError("Por favor, selecione uma data e um horário.");
            return;
        }
        setStep(2);
        setError(null);
    };

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
            <h1>Novo Agendamento para {user?.nome?.split(' ')[0]}</h1>
            <p style={{marginBottom: '20px'}}>Etapa: {step} de 2</p>

            {error && <div style={errorStyle}>Erro: {error}</div>}

            {/* Renderiza Mensagem de Sucesso APÓS o agendamento */}
            {successMessage ? (
                <div style={successMessageStyle}>
                    <p style={{fontSize: '1.2em', fontWeight: 'bold'}}>{successMessage}</p>
                    <div style={{marginTop: '20px'}}>
                        <Link to="/appointments" style={successLinkStyle}>
                            Ver Histórico
                        </Link>
                        {/* BOTÃO: Voltar ao Dashboard */}
                        <Link to="/dashboard" style={{...successLinkStyle, backgroundColor: '#007bff'}}>
                            Voltar ao Menu Principal
                        </Link>
                    </div>
                </div>

            ) : ( /* Renderiza o Formulário */
                <form onSubmit={handleSubmit} style={formStyle}>
                    
                    {/* --- ETAPA 1: Data e Hora --- */}
                    {step === 1 && (
                        <div style={stepContainerStyle}>
                            <h2>1. Selecione a Data e Hora (9:00h - 17:00h)</h2>
                            
                            {/* 1.1 Seleção de Data */}
                            <div className="form-group">
                                <label htmlFor="date-input">Data do Serviço (Padrão BR):</label>
                                <input
                                    id="date-input"
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }} 
                                    required
                                    min={new Date().toISOString().split('T')[0]} 
                                    style={inputStyle} // USANDO inputStyle
                                />
                            </div>

                            {/* 1.2 Seleção de Horário */}
                            {selectedDate && (
                                <div style={slotSelectionContainerStyle}>
                                    {availableTimeSlots.map(time => (
                                        <button
                                            type="button"
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            style={timeSlotStyle(time === selectedTime)}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            )}
                            
                            <div style={navigationButtonStyle}>
                                <button type="button" onClick={goToStep2} style={submitButtonStyle}> // USANDO submitButtonStyle
                                    Próxima Etapa (Cães/Serviços)
                                </button>
                            </div>
                        </div>
                    )}


                    {/* --- ETAPA 2: Cães e Serviços --- */}
                    {step === 2 && (
                        <div style={stepContainerStyle}>
                            <h2>2. Cães e Serviços</h2>
                            <p style={selectedDateTimeStyle}>Horário Selecionado: <strong>{new Date(`${selectedDate}T${selectedTime}`).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })} às {selectedTime}</strong></p>

                            {/* 2.1 Seleção de Cães */}
                            <h3>Selecione o(s) Cão(s)</h3>
                            <div className="grid-2-cols" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))'}}> 
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

                            {/* 2.2 Seleção de Serviços */}
                            <h3>Selecione o(s) Serviço(s)</h3>
                            <div className="grid-2-cols" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))'}}> 
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
                            
                            <div className="card" style={summaryStyle}> {/* USANDO summaryStyle */}
                                <h3>Resumo & Pagamento</h3>
                                <p>Custo Estimado: R$ {totalPrice.toFixed(2)}</p>
                                <p style={{ fontWeight: 'bold', color: 'var(--color-danger)' }}>Atenção: O pagamento deve ser realizado diretamente no balcão.</p>
                            </div>

                            <div style={navigationButtonStyle}>
                                <button type="button" onClick={() => setStep(1)} style={backButtonStyle}> {/* USANDO backButtonStyle */}
                                    Voltar para Data
                                </button>
                                <button type="submit" disabled={loading || !selectedDogIds.length || !selectedServiceIds.length} style={submitButtonStyle}> {/* USANDO submitButtonStyle */}
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