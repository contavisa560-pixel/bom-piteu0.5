// src/services/observacoesApi.js
import { getAuthHeaders } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Observações Pessoais
export const criarObservacao = async (formData) => {
  const res = await fetch(`${API_URL}/api/observacoes`, {
    method: 'POST',
    headers: getAuthHeaders(null), // null para FormData
    body: formData
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Erro ao criar observação');
  }

  return await res.json();
};

export const listarObservacoes = async (userId, filters = {}) => {
  const params = new URLSearchParams();

  // userId obrigatório
  if (!userId) throw new Error('userId é obrigatório');
  params.append('userId', userId);

  if (filters.tags) params.append('tags', filters.tags);
  if (filters.type) params.append('type', filters.type);
  if (filters.range) params.append('range', filters.range);
  if (filters.status) params.append('status', filters.status);

  const queryString = params.toString();
  const url = `${API_URL}/api/observacoes${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url, {
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Erro ao listar observações');
  }

  return await res.json();
};

export const toggleFavorito = async (id) => {
  const res = await fetch(`${API_URL}/api/observacoes/${id}/favorite`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Erro ao alternar favorito');
  }

  return await res.json();
};

export const atualizarReadyToCook = async (id, status) => {
  const res = await fetch(`${API_URL}/api/observacoes/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ readyToCook: status })
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Erro ao atualizar status');
  }

  return await res.json();
};

export const enviarParaAssistente = async (id) => {
  const res = await fetch(`${API_URL}/api/observacoes/${id}/enviar-assistente`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Erro ao enviar para assistente');
  }

  return await res.json();
};
export const registrarConsumoReceita = async (obsId, userId, ate = true) => {
  const res = await fetch(`${API_URL}/api/observacoes/${obsId}/register-consumption`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId, ate })
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Erro ao registar consumo');
  }

  return await res.json();
};