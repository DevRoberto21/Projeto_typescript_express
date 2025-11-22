import React from 'react'; 
import { useAuth } from '../hooks/useAuth';

// Use export const
export const AdminSchedule: React.FC = () => {
    const { user } = useAuth();
    
    return (
        <div style={{padding: '20px'}}>
            <h2>Gestão de Agenda 👑</h2>
            <p>Bem-vindo, {user?.email}. Esta área é restrita a administradores.</p>
            <p>Aqui você criará o calendário para bloquear horários (API: /admin/blocked-slots).</p>
        </div>
    );
};