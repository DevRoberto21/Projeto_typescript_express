import React from 'react'; 
import { Link } from 'react-router-dom';
import { useAppointmentForm } from '../hooks/useAppointmentForm'; 

import { 
    containerStyle, errorStyle, formStyle, stepContainerStyle, inputStyle, 
    slotSelectionContainerStyle, navigationButtonStyle, selectedDateTimeStyle, 
    summaryStyle, submitButtonStyle, backButtonStyle, successMessageStyle, 
    successLinkStyle, timeSlotStyle, dogButtonStyle, serviceButtonStyle 
} from './newAppointmentsStyles'; 


// Lógica para limitar a seleção de data ao último dia do ano atual.
const getMaxDate = () => {
    const currentYear = new Date().getFullYear();
    return `${currentYear}-12-31`;
};


export const NewAppointment: React.FC = () => {
    // Consome toda a lógica de estado, API e handlers do hook customizado.
    const { 
        user, dogs, services, availableTimeSlots, totalPrice,
        step, selectedDate, selectedTime, selectedDogIds, selectedServiceIds,
        loading, error, successMessage,
        setStep, setSelectedDate, setSelectedTime, handleDogSelection, handleServiceSelection,
        handleSubmit, goToStep2, isSlotBusy,
    } = useAppointmentForm();
    
    const firstName = user?.nome?.split(' ')[0];

    if (loading) return <div style={containerStyle}>Carregando dados...</div>;
    // Checagem de estado crítico (erro E dados iniciais ausentes)
    if (error && (dogs.length === 0 || services.length === 0)) return <div style={errorStyle}>Erro crítico: {error}</div>;

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
                                    max={getMaxDate()} // VALIDAÇÃO DE ANO APLICADA AQUI
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