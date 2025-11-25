import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { fetchMyDogs, createDog, deleteDog, updateDog, availablePortes } from "../api/dogs.ts"; 
import { fetchAllBreeds } from "../api/externalDogApi";

import type { Dog, CreateDogPayload, UpdateDogPayload } from "../types"; 

// -----------------------------------------------------------
// Type Guard para tratar erros de Axios
// -----------------------------------------------------------
interface AxiosErrorData {
  response?: {
    data?: { message?: string };
  };
}

const isAxiosErrorResponse = (error: unknown): error is AxiosErrorData =>
  (error as AxiosErrorData)?.response !== undefined;

// -----------------------------------------------------------
// Componente Principal
// -----------------------------------------------------------
export const DogManagement: React.FC = () => {
  const { user } = useAuth();

  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para o formulário de CRIAÇÃO
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState<CreateDogPayload>({
    nome: "",
    idade: 1,
    raca: "",
    porte: "PEQUENO",
  });
  
  // NOVO ESTADO: Controla qual cão está sendo editado (null se nenhum)
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  // NOVO ESTADO: Dados do formulário de EDIÇÃO (parcial)
  const [editFormData, setEditFormData] = useState<UpdateDogPayload>({});

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Autocomplete
  const [breedSuggestions, setBreedSuggestions] = useState<string[]>([]);
  const [allBreeds, setAllBreeds] = useState<string[]>([]);

  // -----------------------------------------------------------
  // Carregar dados
  // -----------------------------------------------------------
  const loadDogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedDogs = await fetchMyDogs();
      setDogs(fetchedDogs);
    } catch (err: unknown) {
      let message = "Erro ao carregar seus cães.";

      if (isAxiosErrorResponse(err)) {
        message = err.response?.data?.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDogs();

    const loadBreeds = async () => {
      const breeds = await fetchAllBreeds();
      setAllBreeds(breeds);
    };

    loadBreeds();
  }, [loadDogs]);

  // -----------------------------------------------------------
  // Manipuladores Comuns (Criação e Edição)
  // -----------------------------------------------------------
  const handleBreedChange = (e: React.ChangeEvent<HTMLInputElement>, isEditingForm: boolean = false) => {
    const value = e.target.value.toLowerCase();
    
    if (isEditingForm) {
        setEditFormData((prev: UpdateDogPayload) => ({ ...prev, raca: value }));
    } else {
        setFormData((prev: CreateDogPayload) => ({ ...prev, raca: value }));
    }

    if (value.length >= 3 && allBreeds.length > 0) {
      const filtered = allBreeds.filter((breed) =>
        breed.includes(value)
      );
      setBreedSuggestions(filtered.slice(0, 10));
    } else {
      setBreedSuggestions([]);
    }
  };

  // CORREÇÃO TS: Tipagem explícita de 'prev' para evitar erro 'any' implícito
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    isEditingForm: boolean = false
  ) => {
    const { name, value } = e.target;
    const numericValue = name === "idade" ? parseInt(value, 10) : value;

    if (isEditingForm) {
        setEditFormData((prev: UpdateDogPayload) => ({ 
            ...prev,
            [name]: numericValue,
        }));
    } else {
        setFormData((prev: CreateDogPayload) => ({ 
            ...prev,
            [name]: numericValue,
        }));
    }
  };

  // -----------------------------------------------------------
  // Lógica de Criação
  // -----------------------------------------------------------
  const handleCreateDog = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isNaN(formData.idade) || formData.idade < 1) {
        setError("A idade deve ser um número válido.");
        setLoading(false);
        return;
      }

      const newDog = await createDog(formData);
      setDogs((prev) => [...prev, newDog]);
      setSuccessMessage(`Cachorro "${newDog.nome}" cadastrado com sucesso!`);
      
      // Resetar formulário
      setFormData({ nome: "", idade: 1, raca: "", porte: "PEQUENO" });
      setBreedSuggestions([]);
      setIsFormVisible(false); 
      
    } catch (err: unknown) {
      let message = "Erro ao cadastrar o cão.";

      if (isAxiosErrorResponse(err)) {
        message = err.response?.data?.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };


  // -----------------------------------------------------------
  // Lógica de Edição
  // -----------------------------------------------------------
  const handleStartEdit = (dog: Dog) => {
    setEditingDog(dog);
    // Preenche o formulário de edição com os dados atuais do cão
    setEditFormData({
        nome: dog.nome,
        idade: dog.idade,
        raca: dog.raca,
        porte: dog.porte,
    });
    // Esconde a criação
    setIsFormVisible(false);
    setSuccessMessage(null);
    setError(null);
  };
  
  const handleUpdateDog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDog) return;
    
    setError(null);
    setLoading(true);

    try {
        // Envia apenas os campos que foram alterados
        const updatedData: UpdateDogPayload = {};
        
        // Verifica e adiciona apenas os campos que mudaram (com checagem de tipo/valor)
        if (editFormData.nome !== editingDog.nome) updatedData.nome = editFormData.nome;
        if (editFormData.idade !== editingDog.idade) updatedData.idade = editFormData.idade;
        if (editFormData.raca !== editingDog.raca) updatedData.raca = editFormData.raca;
        if (editFormData.porte !== editingDog.porte) updatedData.porte = editFormData.porte;
        
        if (Object.keys(updatedData).length === 0) {
            setEditingDog(null);
            setLoading(false);
            return; // Nada para atualizar
        }

        const updatedDog = await updateDog(editingDog.id, updatedData);

        // Atualiza a lista de cães no estado
        setDogs(prev => prev.map(d => d.id === updatedDog.id ? updatedDog : d));
        setSuccessMessage(`Cachorro "${updatedDog.nome}" atualizado com sucesso!`);
        setEditingDog(null); // Sai do modo de edição

    } catch (err: unknown) {
        let message = "Erro ao atualizar o cão.";

        if (isAxiosErrorResponse(err)) {
          message = err.response?.data?.message || message;
        }
        setError(message);
    } finally {
        setLoading(false);
    }
  };


  // -----------------------------------------------------------
  // Lógica de Deleção
  // -----------------------------------------------------------
  const handleDeleteDog = useCallback(async (dogId: string) => {
    if (!window.confirm("Tem certeza que deseja deletar este cão? Isso pode afetar agendamentos passados."))
      return;

    setLoading(true);
    setError(null);

    try {
      await deleteDog(dogId);
      setDogs((prev) => prev.filter((d) => d.id !== dogId));
      setSuccessMessage("Cão deletado com sucesso!");
    } catch (err: unknown) {
      let message = "Erro ao deletar o cão.";

      if (isAxiosErrorResponse(err)) {
        message = err.response?.data?.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const firstName = user?.nome ? user.nome.split(" ")[0] : "Cliente";

  // -----------------------------------------------------------
  // Renderização
  // -----------------------------------------------------------
  if (loading && dogs.length === 0)
    return <div style={containerStyle}>Carregando dados...</div>;

  if (error && dogs.length === 0)
    return <div style={errorStyle}>Erro crítico: {error}</div>;

  return (
    <div style={containerStyle}>
      <h1>Gerenciamento de Cães 🐶</h1>
      <p>Olá, {firstName}! Cadastre, edite e gerencie seus cães.</p>

      {error && <div style={errorStyle}>Erro: {error}</div>}

      <button
        style={toggleButtonStyle}
        onClick={() => {
          setIsFormVisible((prev) => !prev);
          setEditingDog(null); // Sai do modo de edição
          setSuccessMessage(null);
        }}
      >
        {isFormVisible ? "Ocultar Formulário de Criação" : "Adicionar Novo Cão"}
      </button>

      {successMessage && (
        <div style={successMessageStyle}>
          <p>{successMessage}</p>

          <Link
            to="/appointments/new"
            style={linkToScheduleStyle}
            onClick={() => setSuccessMessage(null)}
          >
            Agendar Serviço Agora
          </Link>
        </div>
      )}

      {/* Formulário de EDIÇÃO */}
      {editingDog && (
        <>
          <h3 style={{color: '#007bff'}}>Editando: {editingDog.nome}</h3>
          <form onSubmit={handleUpdateDog} style={formContainerStyle}>
            {/* Campos de Edição */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Nome:</label>
              <input
                name="nome"
                value={editFormData.nome}
                onChange={(e) => handleInputChange(e, true)}
                required
                style={inputStyle}
              />
            </div>

            {/* Raça com Autocomplete (Edição) */}
            <div style={{ ...formGroupStyle, position: "relative" }}>
              <label style={labelStyle}>Raça:</label>
              <input
                name="raca"
                value={editFormData.raca}
                onChange={(e) => handleBreedChange(e, true)}
                required
                autoComplete="off"
                style={inputStyle}
              />
              {/* Sugestões de raça... */}
              {breedSuggestions.length > 0 && (
                <ul style={suggestionListStyle}>
                  {breedSuggestions.map((breed) => (
                    <li
                      key={breed}
                      style={suggestionItemStyle}
                      onClick={() => {
                        setEditFormData((prev: UpdateDogPayload) => ({ ...prev, raca: breed }));
                        setBreedSuggestions([]);
                      }}
                    >
                      {breed}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Idade:</label>
              <input
                type="number"
                name="idade"
                value={editFormData.idade}
                onChange={(e) => handleInputChange(e, true)}
                min={1}
                max={20}
                required
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Porte:</label>
              <select
                name="porte"
                value={editFormData.porte}
                onChange={(e) => handleInputChange(e, true)}
                style={inputStyle}
              >
                {availablePortes.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Botões de Ação */}
            <button type="submit" style={submitButtonStyle}>
              Salvar Alterações
            </button>
            <button 
                type="button" 
                onClick={() => setEditingDog(null)} 
                style={cancelEditButtonStyle}
            >
                Cancelar Edição
            </button>
          </form>
        </>
      )}


      {/* Formulário de CRIAÇÃO */}
      {isFormVisible && !successMessage && !editingDog && (
        <>
          <h3>Novo Cão</h3>

          <form onSubmit={handleCreateDog} style={formContainerStyle}>
            {/* Nome */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Nome:</label>
              <input
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Nome do Cão"
                required
                style={inputStyle}
              />
            </div>

            {/* Raça com Autocomplete (Criação) */}
            <div style={{ ...formGroupStyle, position: "relative" }}>
              <label style={labelStyle}>Raça:</label>
              <input
                name="raca"
                value={formData.raca}
                onChange={handleBreedChange}
                placeholder="Raça (mín. 3 letras)"
                required
                autoComplete="off"
                style={inputStyle}
              />

              {breedSuggestions.length > 0 && (
                <ul style={suggestionListStyle}>
                  {breedSuggestions.map((breed) => (
                    <li
                      key={breed}
                      style={suggestionItemStyle}
                      onClick={() => {
                        setFormData((prev: CreateDogPayload) => ({ ...prev, raca: breed }));
                        setBreedSuggestions([]);
                      }}
                    >
                      {breed}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Idade */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Idade:</label>
              <input
                type="number"
                name="idade"
                value={formData.idade}
                onChange={handleInputChange}
                min={1}
                max={20}
                required
                style={inputStyle}
              />
            </div>

            {/* Porte */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>Porte:</label>
              <select
                name="porte"
                value={formData.porte}
                onChange={handleInputChange}
                style={inputStyle}
              >
                {availablePortes.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>

            <button type="submit" style={submitButtonStyle}>
              Cadastrar Cão
            </button>
          </form>
        </>
      )}
      
      {/* Lista de Cães */}
      <h2>Meus Cães Cadastrados ({dogs.length})</h2>

      <div style={dogListContainerStyle}>
        {dogs.map((dog) => (
          <div key={dog.id} style={dogCardStyle}>
            <h3>
              {dog.nome} ({dog.raca.toUpperCase()})
            </h3>
            <p>Idade: {dog.idade} anos</p>
            <p>Porte: {dog.porte}</p>

            <button
                onClick={() => handleStartEdit(dog)}
                disabled={loading || !!editingDog}
                style={editButtonStyle}
            >
                Editar
            </button>
            <button
              onClick={() => handleDeleteDog(dog.id)}
              disabled={loading || !!editingDog}
              style={deleteButtonStyle}
            >
              Deletar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// -----------------------------------------------------------
// Estilos
// -----------------------------------------------------------
const containerStyle: React.CSSProperties = {
  padding: "30px",
  maxWidth: "1000px",
  margin: "0 auto",
  fontFamily: "Arial, sans-serif",
};

const errorStyle: React.CSSProperties = {
  padding: "10px",
  color: "white",
  backgroundColor: "#dc3545",
  borderRadius: "5px",
  textAlign: "center",
  marginBottom: "20px",
};

const formContainerStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "15px 30px",
  padding: "20px",
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
  marginBottom: "30px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
};

const formGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
};

const labelStyle: React.CSSProperties = {
  fontWeight: "bold",
  fontSize: "0.9em",
};

const inputStyle: React.CSSProperties = {
  padding: "10px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  width: "100%",
  minHeight: "40px",
};

const submitButtonStyle: React.CSSProperties = {
  gridColumn: "span 2",
  padding: "10px",
  backgroundColor: "var(--color-success)",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const cancelEditButtonStyle: React.CSSProperties = {
    gridColumn: "span 2",
    padding: "10px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  };

const toggleButtonStyle: React.CSSProperties = {
  marginBottom: "20px",
  padding: "10px 20px",
  backgroundColor: "var(--color-primary)",
  color: "white",
  borderRadius: "5px",
  border: "none",
  cursor: "pointer",
};

const successMessageStyle: React.CSSProperties = {
  padding: "20px",
  backgroundColor: "#d4edda",
  color: "#155724",
  borderRadius: "8px",
  border: "1px solid #c3e6cb",
  marginBottom: "30px",
  textAlign: "center",
};

const linkToScheduleStyle: React.CSSProperties = {
  display: "inline-block",
  marginTop: "10px",
  padding: "10px 20px",
  backgroundColor: "#155724",
  color: "white",
  textDecoration: "none",
  borderRadius: "4px",
};

const dogListContainerStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
  marginTop: "20px",
};

const dogCardStyle: React.CSSProperties = {
  border: "1px solid #b3d9ff",
  padding: "15px",
  borderRadius: "8px",
  backgroundColor: "#f0f8ff",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  display: 'flex',
  flexDirection: 'column',
};

const deleteButtonStyle: React.CSSProperties = {
  padding: "5px 10px",
  backgroundColor: "var(--color-danger)",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  marginTop: "10px",
};

const editButtonStyle: React.CSSProperties = {
    padding: "5px 10px",
    backgroundColor: "var(--color-primary)",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px",
  };

const suggestionListStyle: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  zIndex: 100,
  background: "white",
  border: "1px solid #ccc",
  borderRadius: "4px",
  maxHeight: "200px",
  overflowY: "auto",
  padding: 0,
  listStyle: "none",
};

const suggestionItemStyle: React.CSSProperties = {
  padding: "8px 10px",
  cursor: "pointer",
  borderBottom: "1px solid #eee",
};