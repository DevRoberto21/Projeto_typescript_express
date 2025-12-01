import React from 'react';

export const containerStyle: React.CSSProperties = { padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' };
export const errorStyle: React.CSSProperties = { padding: '10px', color: 'white', backgroundColor: '#dc3545', borderRadius: '5px', textAlign: 'center', marginBottom: '20px' };
export const formStyle: React.CSSProperties = { border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginTop: '20px' };
export const stepContainerStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '20px' };
export const inputStyle: React.CSSProperties = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }; 
export const slotSelectionContainerStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }; 
export const navigationButtonStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', marginTop: '20px' };
export const selectedDateTimeStyle: React.CSSProperties = { padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px', fontWeight: 'bold' };
export const summaryStyle: React.CSSProperties = { padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px' }; 
export const submitButtonStyle: React.CSSProperties = { padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1em' };
export const backButtonStyle: React.CSSProperties = { padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export const successMessageStyle: React.CSSProperties = {
    padding: '20px',
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    borderRadius: '8px',
    marginBottom: '30px',
    textAlign: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
};
export const successLinkStyle: React.CSSProperties = {
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

// COMENTÁRIO: Funções auxiliares de estilo (mantidas no arquivo de estilo para serem exportadas).
export const timeSlotStyle = (isSelected: boolean, isBusy: boolean): React.CSSProperties => ({
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

export const dogButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '10px',
    borderRadius: '8px',
    border: `2px solid ${isSelected ? '#28a745' : '#ccc'}`,
    backgroundColor: isSelected ? '#e6ffe6' : 'white',
    color: '#333',
    cursor: 'pointer',
    textAlign: 'center',
});

export const serviceButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '10px',
    borderRadius: '8px',
    border: `2px solid ${isSelected ? '#007bff' : '#ccc'}`,
    backgroundColor: isSelected ? '#e0f7ff' : 'white',
    color: '#333',
    cursor: 'pointer',
    textAlign: 'center',
});