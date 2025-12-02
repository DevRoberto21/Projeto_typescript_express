const START_HOUR = 9;
const END_HOUR = 17;
const SLOT_DURATION_MINUTES = 60; // AJUSTADO: De 30 para 60 minutos (1 hora)

/**
 * Gera uma lista de horários de 1 em 1 hora entre 9h e 17h.
 * @param date - A data base (usada para o contexto do dia).
 * @returns Array de strings no formato HH:MM.
 */
export function generateTimeSlots(date: Date): string[] {
    const slots: string[] = [];
    const currentTime = new Date(date); 
    currentTime.setHours(START_HOUR, 0, 0, 0); // Começa às 9:00

    // Verifica se a hora atual é menor que o horário final
    while (currentTime.getHours() < END_HOUR) {
        // Formata a hora como HH:MM
        const timeString = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        slots.push(timeString);

        // Adiciona a duração do slot
        currentTime.setMinutes(currentTime.getMinutes() + SLOT_DURATION_MINUTES);
    }

    return slots;
}