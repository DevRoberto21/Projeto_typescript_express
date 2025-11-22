import React from 'react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  return (
    <div style={{ 
        padding: '50px 20px', 
        maxWidth: '800px', 
        margin: '50px auto', 
        textAlign: 'center', 
        fontFamily: 'Arial, sans-serif' 
    }}>
        
      <h1 style={{ color: '#007bff', fontSize: '3em', marginBottom: '10px' }}>
        🐾 Petshop Agendamento Fácil
      </h1>
      <p style={{ color: '#555', fontSize: '1.2em', marginBottom: '40px' }}>
        O seu portal de agendamento de banho e tosa para cães. Cuidado profissional, agendado em segundos.
      </p>

      <hr style={{ margin: '40px 0' }} />

      <h2 style={{ marginBottom: '20px' }}>Comece Agora</h2>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
        
        {/* Link para Login */}
        <Link 
          to="/login" 
          style={{ 
            padding: '15px 30px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '8px',
            fontSize: '1.1em',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          Fazer Login
        </Link>

        {/* Link para Registro */}
        <Link 
          to="/register" 
          style={{ 
            padding: '15px 30px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '8px',
            fontSize: '1.1em',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          Cadastre-se
        </Link>
      </div>

      <div style={{ marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
        <h3 style={{ color: '#333' }}>Por que nos escolher?</h3>
        <p>
          Gerenciamento completo: cadastre seu pet, veja a agenda de serviços e acompanhe o status do seu agendamento.
        </p>
      </div>
    </div>
  );
};