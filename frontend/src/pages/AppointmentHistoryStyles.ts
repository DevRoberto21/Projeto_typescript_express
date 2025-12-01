import React from 'react';
import type { AppointmentStatus } from '../types'; 

export const containerStyle: React.CSSProperties = { padding: '30px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' };
export const listContainerStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' };
export const cardStyle: React.CSSProperties = { border: '1px solid #ddd', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.05)', backgroundColor: 'white', color: '#333' };
export const sectionHeaderStyle: React.CSSProperties = { fontSize: '1em', marginTop: '15px', marginBottom: '5px', color: '#007bff' };
export const listStyle: React.CSSProperties = { listStyleType: 'disc', paddingLeft: '20px', margin: '0 0 10px 0' };
export const errorStyle: React.CSSProperties = { padding: '10px', color: 'white', backgroundColor: '#dc3545', borderRadius: '5px', textAlign: 'center' };
export const cancelButtonStyle: React.CSSProperties = { 
    marginTop: '15px', 
    width: '100%', 
    padding: '10px', 
    backgroundColor: '#dc3545', 
    color: 'white', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer',
    fontWeight: 'bold'
};

/**
 * Retorna estilos de cor baseados no status do agendamento.
 */
export const getStatusStyle = (status: AppointmentStatus): React.CSSProperties => {
    switch (status) {
        case 'AGENDADO':
            return { color: '#007bff', fontWeight: 'bold' };
        case 'CONCLUIDO':
            return { color: '#28a745', fontWeight: 'bold' };
        case 'CANCELADO':
            return { color: '#dc3545', fontWeight: 'bold' };
        default:
            return {};
    }
};