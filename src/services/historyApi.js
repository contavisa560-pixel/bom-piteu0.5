// services/historyApi.js
// ─────────────────────────────────────────────────────────────
// Todas as chamadas usam /api/history/* que é servido pelo
// historyController.js (baseado em RecipeSession).
// ─────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('bomPiteuToken') || localStorage.getItem('token');
  return {
    'Content-Type':  'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

async function handleResponse(res) {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const d = await res.json(); msg = d.error || msg; } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
}

// ── Lista de sessões (histórico) ──────────────────────────────
export async function getChatHistory({ page = 1, limit = 20, search, status } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set('search', search);
  if (status) params.set('status', status);

  const res = await fetch(
    `${API_URL}/api/history/sessions?${params}`,
    { headers: authHeaders() }
  );
  return handleResponse(res);
}

// ── Detalhes de uma sessão (com mensagens reconstruídas) ──────
export async function getSessionDetail(sessionId) {
  const res = await fetch(
    `${API_URL}/api/history/sessions/${sessionId}`,
    { headers: authHeaders() }
  );
  return handleResponse(res);
}

// ── Estatísticas ──────────────────────────────────────────────
export async function getHistoryStatistics() {
  const res = await fetch(
    `${API_URL}/api/history/statistics`,
    { headers: authHeaders() }
  );
  return handleResponse(res);
}

// ── Apagar sessão ─────────────────────────────────────────────
export async function deleteSession(sessionId) {
  const res = await fetch(
    `${API_URL}/api/history/sessions/${sessionId}`,
    { method: 'DELETE', headers: authHeaders() }
  );
  return handleResponse(res);
}

// ── Guardar sessão (NOP — o backend já guarda automaticamente) ─
export async function saveSession(sessionData) {
  // O autoRecipeController guarda tudo em RecipeSession.
  // Este endpoint existe só para não quebrar o ChatBot.jsx.
  try {
    const res = await fetch(
      `${API_URL}/api/history/save`,
      {
        method:  'POST',
        headers: authHeaders(),
        body:    JSON.stringify(sessionData)
      }
    );
    if (!res.ok) return { success: true }; // silencia erros de save
    return res.json();
  } catch (_) {
    return { success: true }; // nunca quebra o fluxo principal
  }
}

// ── Exportar sessão ───────────────────────────────────────────
export async function exportSession(sessionId, format = 'json') {
  const res = await fetch(
    `${API_URL}/api/history/sessions/${sessionId}?format=${format}`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error('Erro ao exportar');
  return format === 'html' ? res.text() : res.json();
}

export default {
  getChatHistory,
  getSessionDetail,
  getHistoryStatistics,
  deleteSession,
  saveSession,
  exportSession
};