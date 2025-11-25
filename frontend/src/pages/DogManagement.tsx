import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { fetchMyDogs, createDog, deleteDog, availablePortes } from "../api/dogs";
import { fetchAllBreeds } from "../api/externalDogApi";

import type { Dog, CreateDogPayload } from "../types";

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

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateDogPayload>({
    nome: "",
    idade: 1,
    raca: "",
    porte: "PEQUENO",
  });

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
  // Deletar Cão
  // -----------------------------------------------------------
  const handleDeleteDog = useCallback(async (dogId: string) => {
    if (!window.confirm("Tem certeza que deseja deletar este cão?"))
      return;

    setLoading(true);
    setError(null);

    try {
      await deleteDog(dogId);
      setDogs((prev) => prev.filter((d) => d.id !== dogId));
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

  // -----------------------------------------------------------
  // Autocomplete + Form
  // -----------------------------------------------------------
  const handleBreedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setFormData((prev) => ({ ...prev, raca: value.toLowerCase() }));

    if (value.length >= 3 && allBreeds.length > 0) {
      const filtered = allBreeds.filter((breed) =>
        breed.includes(value.toLowerCase())
      );
      setBreedSuggestions(filtered.slice(0, 10));
    } else {
      setBreedSuggestions([]);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "idade" ? parseInt(value, 10) : value,
    }));
  };

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

      setFormData({
        nome: "",
        idade: 1,
        raca: "",
        porte: "PEQUENO",
      });
      setBreedSuggestions([]);
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
      <p>Olá, {firstName}! Cadastre e gerencie seus cães.</p>

      {error && <div style={errorStyle}>Erro: {error}</div>}

      <button
        style={toggleButtonStyle}
        onClick={() => {
          setIsFormVisible((prev) => !prev);
          setSuccessMessage(null);
        }}
      >
        {isFormVisible ? "Ocultar Formulário" : "Adicionar Novo Cão"}
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

      {/* Formulário */}
      {isFormVisible && !successMessage && (
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

            {/* Raça com Autocomplete */}
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
                        setFormData((prev) => ({ ...prev, raca: breed }));
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
              onClick={() => handleDeleteDog(dog.id)}
              disabled={loading}
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

