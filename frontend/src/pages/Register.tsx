import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { RegisterPayload } from '../types';

// Interface para o objeto de erro esperado do Axios (reutilizado do Login.tsx)
interface AxiosErrorData {
    response?: {
        data?: {
            message?: string;
            // O backend Zod retorna um array de erros em caso de falha 400
            errors?: Array<{ path: string[], message: string }>; 
        };
    };
}
const isAxiosErrorResponse = (error: unknown): error is AxiosErrorData => {
    return (error as AxiosErrorData)?.response !== undefined;
};


export const Register: React.FC = () => {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState<RegisterPayload>({
    nome: '',
    email: '',
    cpf: '',
    idade: 18, 
    telefone: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.name === 'idade' ? parseInt(e.target.value) : e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Converte idade para número antes de enviar
    const dataToSend: RegisterPayload = {
        ...formData,
        idade: parseInt(String(formData.idade)),
    };

    try {
      await register(dataToSend);
      // Redirecionamento acontece dentro do hook useAuth em caso de sucesso
    } catch (err: unknown) {
      const backendError = isAxiosErrorResponse(err) ? err.response?.data : null;
      let errorMessage = 'Erro ao tentar registrar. Verifique seus dados.';

      if (backendError?.errors && Array.isArray(backendError.errors)) {
          // Erro de validação Zod (400)
          const firstZodError = backendError.errors[0];
          errorMessage = `Erro de validação (${firstZodError.path.join('.')}): ${firstZodError.message}`;
      } else {
          // Erro P2002 (Conflito 409 - CPF/Email) ou outro erro de servidor
          errorMessage = backendError?.message || errorMessage;
      }
      setError(errorMessage);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h2>Crie sua Conta (Petshop Cliente)</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        
        {/* Linha 1 */}
        <input type="text" name="nome" placeholder="Nome Completo" value={formData.nome} onChange={handleChange} required style={{ gridColumn: 'span 2', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
        
        {/* Linha 2 */}
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
        <input type="text" name="cpf" placeholder="CPF (Apenas 11 dígitos)" value={formData.cpf} onChange={handleChange} maxLength={11} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />

        {/* Linha 3 */}
        <input type="number" name="idade" placeholder="Idade" value={formData.idade} onChange={handleChange} required min="18" max="100" style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />
        <input type="text" name="telefone" placeholder="Telefone (Opcional, Padrão BR)" value={formData.telefone} onChange={handleChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />

        {/* Linha 4 */}
        <input type="password" name="password" placeholder="Senha (Mínimo 8 caracteres)" value={formData.password} onChange={handleChange} required minLength={8} style={{ gridColumn: 'span 2', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }} />

        {/* Exibição de Erro */}
        {error && <p style={{ color: 'red', margin: 0, gridColumn: 'span 2' }}>{error}</p>}
        
        {/* Botão de Submissão */}
        <button 
          type="submit" 
          disabled={loading}
          style={{ gridColumn: 'span 2', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Já tem conta? <Link to="/login">Faça login aqui.</Link>
      </p>
    </div>
  );
};