import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { LoginPayload } from '../types';

// Interface para o objeto de erro esperado do Axios (sem precisar usar 'any' no catch)
interface AxiosErrorData {
    response?: {
        data?: {
            message?: string;
        };
    };
}

// Type guard para verificar se o erro possui a estrutura de resposta do Axios
const isAxiosErrorResponse = (error: unknown): error is AxiosErrorData => {
    return (error as AxiosErrorData)?.response !== undefined;
};


export const Login: React.FC = () => {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState<LoginPayload>({
    identifier: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(formData);
      // Redirecionamento acontece dentro do hook useAuth em caso de sucesso
    } catch (err: unknown) { // Usamos 'unknown' que é o padrão moderno do TS
      let errorMessage = 'Erro desconhecido. Tente novamente.';

      if (isAxiosErrorResponse(err)) {
          // O TypeScript agora sabe que 'err' tem a estrutura de AxiosErrorData
          errorMessage = err.response?.data?.message || 'Erro de rede ou servidor.';
      } else if (err instanceof Error) {
          errorMessage = err.message;
      }

      setError(errorMessage);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Campo Identificador (Email ou CPF) */}
        <input
          type="text"
          name="identifier"
          placeholder="Email ou CPF"
          value={formData.identifier}
          onChange={handleChange}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        />

        {/* Campo Senha */}
        <input
          type="password"
          name="password"
          placeholder="Senha"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        />

        {/* Exibição de Erro */}
        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        
        {/* Botão de Submissão */}
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Não tem conta? <Link to="/register">Crie uma aqui.</Link>
      </p>
    </div>
  );
};