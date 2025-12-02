import React from 'react';

// Estilos para o componente de gestão de bloqueios de agenda.
export const containerStyle: React.CSSProperties = { padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' };
export const errorStyle: React.CSSProperties = { padding: '10px', color: 'white', backgroundColor: '#dc3545', borderRadius: '5px', textAlign: 'center', marginBottom: '20px' };
// NOVO: Ajuste do grid para melhor alinhamento Label-Input
export const formContainerStyle: React.CSSProperties = { 
    display: 'grid', 
    gridTemplateColumns: '100px 1fr', // Coluna de 100px para o label, restante para o input
    alignItems: 'center',
    gap: '15px 10px', // Ajusta o espaçamento
    padding: '20px', 
    border: '1px solid #007bff', 
    borderRadius: '8px', 
    marginBottom: '30px'
};
export const inputStyle: React.CSSProperties = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc' };
export const submitButtonStyle: React.CSSProperties = { 
    gridColumn: 'span 2', 
    padding: '10px', 
    backgroundColor: '#007bff', 
    color: 'white', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer'
};
// NOVO: Estilo para o cabeçalho do formulário dentro do grid
export const formHeaderStyle: React.CSSProperties = {
    gridColumn: 'span 2',
    textAlign: 'center',
    marginBottom: '10px',
    color: '#007bff'
};
export const slotListContainerStyle: React.CSSProperties = { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
    gap: '20px',
    marginTop: '20px'
};
export const slotCardStyle: React.CSSProperties = {
    border: '1px solid #bbb',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'left',
    backgroundColor: '#f8f8f8'
};
export const deleteButtonStyle: React.CSSProperties = {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
    fontSize: '0.9em'
};