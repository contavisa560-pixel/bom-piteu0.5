// src/services/profilesApi.js
import { getAuthHeaders } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Perfis Infantil/Sênior
export const criarPerfil = async (profileData) => {
  const res = await fetch(`${API_URL}/api/profiles`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData)
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Erro ao criar perfil');
  }

  return await res.json();
};

export const listarPerfisPorTipo = async (type) => {
  const res = await fetch(`${API_URL}/api/profiles/type/${type}`, {
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Erro ao listar perfis');
  }

  return await res.json();
};

export const gerarReceitaAdaptada = async (profileId, numberOfPeople = 1, options = {}) => {
  const data = {
    numberOfPeople,
    ...options
  };

  const res = await fetch(`${API_URL}/api/profiles/${profileId}/generate-ai`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Erro ao gerar receita');
  }

  return await res.json();
};

// Funções extras que podem ser úteis
export const getPerfil = async (profileId) => {
  const res = await fetch(`${API_URL}/api/profiles/${profileId}`, {
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Erro ao buscar perfil');
  }

  return await res.json();
};

export const adicionarReceitaPerfil = async (profileId, recipeData) => {
  const res = await fetch(`${API_URL}/api/profiles/${profileId}/recipe`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(recipeData)
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Erro ao adicionar receita');
  }

  return await res.json();
};
export const gerarReceitaPorFavorito = async (tituloReceita, userId) => {
  const res = await fetch(`${API_URL}/api/auto-recipe/gerar-favorito`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ tituloReceita, userId })
  });
  if (!res.ok) throw new Error('Erro ao gerar receita por favorito');
  return await res.json();
};
export const iniciarPassoAPasso = async (sessionId) => {
  const res = await fetch(`${API_URL}/api/auto-recipe/iniciar-passo-a-passo`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ sessionId })
  });
  if (!res.ok) throw new Error('Erro ao iniciar passo a passo');
  return await res.json();
};

export const gerarReceitaAdaptadaParaPerfil = async (profileId, numberOfPeople = 1, options = {}) => {
  const body = {
    numberOfPeople,
    ...options
  };
  const res = await fetch(`${API_URL}/api/profiles/${profileId}/generate-ai`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Erro ao gerar receita adaptada');
  }
  return await res.json();
};

export const criarSessaoDeReceita = async (dadosReceita) => {
  const res = await fetch(`${API_URL}/api/auto-recipe/criar-sessao`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dadosReceita)
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Erro ao criar sessão de receita');
  }

  return await res.json();
};