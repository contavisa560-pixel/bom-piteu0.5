// hooks/useChatHistory.js
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  getChatHistory,
  deleteSession,
  getHistoryStatistics,
  getSessionDetail
} from '../services/historyApi';

export function useChatHistory(userId) {
  const [history,    setHistory]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [statistics, setStatistics] = useState({
    totalSessions: 0, totalMessages: 0,
    totalImages: 0,   completedRecipes: 0, avgDuration: 0
  });

  // Controla se já carregou para não repetir automaticamente
  const initialLoadDone = useRef(false);
  const loadingRef      = useRef(false);

  // ── Carrega lista de sessões (com protecção contra chamadas paralelas) ─
  const loadHistory = useCallback(async (page = 1, filters = {}) => {
    if (!userId) return;
    if (loadingRef.current) return;   // bloqueia chamadas paralelas

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const data = await getChatHistory({ page, ...filters });
      setHistory(Array.isArray(data?.sessions) ? data.sessions : []);
      setPagination(data?.pagination || { page: 1, limit: 20, total: 0, pages: 1 });
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
      setError(err.message || "Erro ao carregar histórico");
      setHistory([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [userId]);

  // ── Carrega estatísticas (silenciosa) ─────────────────────────
  const loadStatistics = useCallback(async () => {
    if (!userId) return;
    try {
      const stats = await getHistoryStatistics();
      setStatistics(stats || {
        totalSessions: 0, totalMessages: 0,
        totalImages: 0,   completedRecipes: 0, avgDuration: 0
      });
    } catch (err) {
      // Silencia — estatísticas não são críticas
    }
  }, [userId]);

  // ── Apaga uma sessão ──────────────────────────────────────────
  const removeSession = useCallback(async (sessionId) => {
    if (!sessionId) return false;
    try {
      await deleteSession(sessionId);
      setHistory(prev => prev.filter(s => s.sessionId !== sessionId && s._id !== sessionId));
      return true;
    } catch (err) {
      console.error("Erro ao eliminar sessão:", err);
      return false;
    }
  }, []);

  // ── Carrega detalhes completos de uma sessão ──────────────────
  const loadSessionDetail = useCallback(async (sessionId) => {
    if (!sessionId) return null;
    try {
      const session = await getSessionDetail(sessionId);
      if (session && !Array.isArray(session.messages)) {
        session.messages = [];
      }
      return session;
    } catch (err) {
      console.error("Erro ao carregar sessão:", err);
      return null;
    }
  }, []);

  // ── refreshHistory: só recarrega se o painel de histórico está aberto ─
  // Recebe `force=true` para forçar (ex: depois de eliminar uma sessão)
  const refreshHistory = useCallback((page, filters, force = false) => {
    if (!force && loadingRef.current) return;
    loadHistory(page || pagination.page, filters);
    // NÃO carrega estatísticas automaticamente — só sob demanda
  }, [loadHistory, pagination.page]);

  // ── Stubs para compatibilidade ────────────────────────────────
  const loadSessionImages = useCallback(async () => [], []);
  const exportSessionData = useCallback(async () => null, []);

  // ── Inicialização: carrega UMA vez ────────────────────────────
  useEffect(() => {
    if (userId && !initialLoadDone.current) {
      initialLoadDone.current = true;
      loadHistory();
      loadStatistics();
    }
  }, [userId, loadHistory, loadStatistics]);

  return {
    history,
    loading,
    error,
    pagination,
    statistics,
    loadHistory,
    removeSession,
    loadSessionDetail,
    loadSessionImages,
    exportSessionData,
    refreshHistory
  };
}