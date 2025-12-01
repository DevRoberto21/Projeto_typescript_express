import React from 'react';

//Estilos para o componente de gerenciamento de preços AdminServices.

export const containerStyle: React.CSSProperties = { padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' };

export const errorStyle: React.CSSProperties = { 
    padding: '20px', 
    color: 'white', 
    backgroundColor: '#dc3545', 
    borderRadius: '5px', 
    textAlign: 'center' 
};

export const gridContainerStyle: React.CSSProperties = { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px' 
};

export const cardStyle: React.CSSProperties = {
    border: '1px solid #ddd', 
    padding: '15px', 
    borderRadius: '8px', 
    boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
    backgroundColor: 'white'
};

export const editFormStyle: React.CSSProperties = { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr 1fr 0.5fr', 
    gap: '10px', 
    alignItems: 'center'
};

export const editInputStyle: React.CSSProperties = { 
    width: '90%', 
    padding: '5px', 
    marginTop: '5px', 
    border: '1px solid #007bff' 
};

export const buttonGroupStyle: React.CSSProperties = { 
    display: 'flex', 
    gap: '5px', 
    marginTop: '20px',
    gridColumn: 'span 1'
};

export const saveButtonStyle: React.CSSProperties = { 
    padding: '8px', 
    backgroundColor: '#28a745', 
    color: 'white', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer' 
};

export const cancelButtonStyle: React.CSSProperties = { 
    padding: '8px', 
    backgroundColor: '#6c757d', 
    color: 'white', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer' 
};

export const viewButtonStyle: React.CSSProperties = { 
    padding: '10px 15px', 
    backgroundColor: '#ffc107', 
    color: '#333', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer', 
    fontWeight: 'bold' 
};