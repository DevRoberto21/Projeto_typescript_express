// Caminho: frontend/src/pages/Dashboard.tsx

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

// Estilos básicos
const cardStyle: React.CSSProperties = {
  border: '1px solid #e0e0e0',
  padding: '15px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
};

const linkStyle: React.CSSProperties = {
  display: 'inline-block',
  marginTop: '10px',
  padding: '8px 15px',
  backgroundColor: '#007bff',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '4px',
};

const adminCardStyle: React.CSSProperties = {
  ...cardStyle,
  backgroundColor: '#f8f9fa',
  border: '1px solid #ffc107',
};

const adminLinkStyle: React.CSSProperties = {
  ...linkStyle,
  backgroundColor: '#ffc107',
  color: '#333',
};


export const Dashboard: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();

  if (!user) {
    return <div>Carregando ou Não Autenticado...</div>; 
  }

  const firstName = user.nome ? user.nome.split(' ')[0] : 'Usuário';
  const welcomeMessage = `Bem-vindo(a), Sr(a). ${firstName}! Seu perfil é: ${user.role}.`;

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Dashboard Petshop</h1>
      <p style={{ fontSize: '1.2em', marginBottom: '20px', fontWeight: 'bold' }}>{welcomeMessage}</p>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <button 
          onClick={logout}
          style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Sair
        </button>
      </div>
      
      <hr />

      {/* --- Seção Comum (CLIENTE) --- */}
      {/* CORREÇÃO: Mostrar esta seção SOMENTE se o usuário NÃO for Admin */}
      {!isAdmin && (
        <>
          <h2>Gerenciamento de Cliente</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={cardStyle}>
              <h3>Meus Cães</h3>
              <p>Adicione, edite ou visualize seus cães.</p>
              <Link to="/dogs" style={linkStyle}>Gerenciar Cães</Link>
            </div>
            
            <div style={cardStyle}>
              <h3>Agendar Serviço</h3>
              <p>Crie um novo agendamento ou veja os próximos.</p>
              <Link to="/appointments/new" style={linkStyle}>Novo Agendamento</Link>
            </div>
            
            <div style={cardStyle}>
              <h3>Meus Agendamentos</h3>
              <p>Visualize o histórico e status de seus serviços.</p>
              <Link to="/appointments" style={linkStyle}>Ver Histórico</Link>
            </div>
          </div>
        </>
      )}

      {/* --- Seção Exclusiva para ADMIN --- */}
      
      {isAdmin && (
        <div style={{ marginTop: '50px' }}>
          <h1>Controle Administrativo 👑</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            
            <div style={adminCardStyle}>
              <h3>Estatísticas de Raças</h3>
              <p>Dashboard com as raças mais agendadas (API /admin/stats/dog-breeds).</p>
              <Link to="/admin/stats" style={adminLinkStyle}>Ver Dashboard</Link>
            </div>

            <div style={adminCardStyle}>
              <h3>Gestão de Agenda</h3>
              <p>Bloqueie horários ou dias de trabalho (API /admin/blocked-slots).</p>
              <Link to="/admin/schedule" style={adminLinkStyle}>Bloquear Agenda</Link>
            </div>

            {/* NOVO: Link para Gestão de Serviços */}
            <div style={adminCardStyle}>
              <h3>Gerenciar Serviços</h3>
              <p>Definir e atualizar os preços dos serviços.</p>
              <Link to="/admin/services" style={adminLinkStyle}>Editar Preços</Link>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};