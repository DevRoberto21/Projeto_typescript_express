import React from 'react';


export const containerStyle: React.CSSProperties = { padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' };
export const errorStyle: React.CSSProperties = { padding: '10px', color: 'white', backgroundColor: '#dc3545', borderRadius: '5px', textAlign: 'center', marginBottom: '20px' };
export const formContainerStyle: React.CSSProperties = { 
    display: 'grid', 
    gridTemplateColumns: 'minmax(80px, 1fr) 3fr', 
    alignItems: 'center',
    gap: '15px', 
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