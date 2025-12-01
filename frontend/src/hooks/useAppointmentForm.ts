import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import { fetchMyDogs } from '../api/dogs';
import { fetchAvailableServices, createAppointment, fetchBusySlots } from '../api/appointments';
import type { BusySlotsResponse } from '../api/appointments';
import { generateTimeSlots } from '../utils/scheduleUtils';
import type { Dog, Service, CreateAppointmentPayload, Porte } from '../types';

// Type Guard para tratar erros de Axios
interface AxiosErrorData { response?: { data?: { message?: string } } }
const isAxiosErrorResponse = (error: unknown): error is AxiosErrorData => (error as AxiosErrorData)?.response !== undefined;


/**
 * Hook customizado que encapsula toda a lógica de estado, validação,
 * cálculo de preço e comunicação com a API para o formulário de agendamento.
 */
export const useAppointmentForm = () => {
    const { user } = useAuth();
    
    // Estados do Formulário e Lógica
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busySlotsData, setBusySlotsData] = useState<BusySlotsResponse>({ appointments: [], blockedSlots: [] });

    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [selectedDogIds, setSelectedDogIds] = useState<string[]>([]);
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]); 
    const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null); 

    //Carregamento de dados iniciais (cães do usuário e serviços).
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

    //Efeito para buscar horários ocupados (bloqueios admin e agendamentos existentes).
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
                //Não lança erro crítico, apenas loga e falha silenciosamente.
                console.error("Falha ao buscar horários ocupados:", err);
            }
        };

        loadBusySlots();
        setAvailableTimeSlots(allSlots);
    }, [selectedDate]);

    //Lógica para verificar se um slot de 30 minutos está ocupado.
    const isSlotBusy = useCallback((time: string): boolean => {
        if (!selectedDate) return false;
        
        const checkTimeISO = `${selectedDate}T${time}:00.000Z`;
        const checkTime = new Date(checkTimeISO);
        const toDate = (isoString: string) => new Date(isoString);
        
        // Checa conflito com bloqueios administrativos
        const isBlocked = busySlotsData.blockedSlots.some(block => {
            const slotEndTime = new Date(checkTime.getTime() + 30 * 60 * 1000); 
            return toDate(block.start) < slotEndTime && toDate(block.end) > checkTime;
        });

        if (isBlocked) return true;

        // Checa conflito com outros agendamentos (conflito exato)
        const isAppointed = busySlotsData.appointments.some(appDateISO => {
            const appStartTime = toDate(appDateISO);
            return appStartTime.toISOString() === checkTime.toISOString(); 
        });

        return isAppointed;
    }, [selectedDate, busySlotsData]);

    //Memoiza o cálculo do preço total baseado no porte do PRIMEIRO cão.
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

    // Handlers para seleção de dados.
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
            //Chamada final à API de criação.
            await createAppointment(payload);
            setSuccessMessage('Agendamento criado com sucesso! O pagamento deve ser realizado no balcão.');
            // Resetar estado
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
    
    // Retorna todo o estado e funções necessárias para o componente de renderização
    return {
        // Dados
        user, dogs, services, busySlotsData, availableTimeSlots, totalPrice,
        step, selectedDate, selectedTime, selectedDogIds, selectedServiceIds,
        loading, error, successMessage,
        
        // Funções
        setStep, setSelectedDate, setSelectedTime, handleDogSelection, handleServiceSelection,
        handleSubmit, goToStep2, isSlotBusy, setError,
    };
};