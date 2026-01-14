// hooks/useChatHistory.js
import { useState, useCallback, useEffect } from 'react';
import {
    getChatHistory,
    deleteSession,
    getHistoryStatistics,
    getSessionDetail,
    exportSession
} from '../services/historyApi';

const API_URL = import.meta.env.VITE_API_URL;

function authHeader() {
  const token = localStorage.getItem("bomPiteuUserToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useChatHistory(userId) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 1
    });
    const [statistics, setStatistics] = useState({
        totalSessions: 0,
        totalMessages: 0,
        totalImages: 0,
        completedRecipes: 0,
        avgDuration: 0
    });

    // Carrega histórico com tratamento robusto de erros
    const loadHistory = useCallback(async (page = 1, filters = {}) => {
        if (!userId) {
            console.warn("useChatHistory: userId não fornecido");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getChatHistory({ page, ...filters });
            
            // Garante que sempre temos arrays válidos
            setHistory(Array.isArray(data?.sessions) ? data.sessions : []);
            setPagination(data?.pagination || {
                page: 1,
                limit: 20,
                total: 0,
                pages: 1
            });
        } catch (err) {
            const errorMsg = err.message || "Erro ao carregar histórico";
            setError(errorMsg);
            setHistory([]);
            console.error("Erro ao carregar histórico:", err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Carrega estatísticas com fallback
    const loadStatistics = useCallback(async () => {
        if (!userId) return;

        try {
            const stats = await getHistoryStatistics();
            setStatistics(stats || {
                totalSessions: 0,
                totalMessages: 0,
                totalImages: 0,
                completedRecipes: 0,
                avgDuration: 0
            });
        } catch (err) {
            console.error("Erro ao carregar estatísticas:", err);
            setStatistics({
                totalSessions: 0,
                totalMessages: 0,
                totalImages: 0,
                completedRecipes: 0,
                avgDuration: 0
            });
        }
    }, [userId]);

    // Deleta sessão com confirmação
    const removeSession = useCallback(async (sessionId) => {
        if (!sessionId) {
            console.error("removeSession: sessionId não fornecido");
            return false;
        }

        try {
            await deleteSession(sessionId);
            
            // Remove da lista local imediatamente
            setHistory(prev => prev.filter(session => session.sessionId !== sessionId));
            
            // Atualiza estatísticas
            await loadStatistics();
            
            return true;
        } catch (err) {
            setError(err.message || "Erro ao deletar sessão");
            console.error("Erro ao deletar sessão:", err);
            return false;
        }
    }, [loadStatistics]);

    // Carrega detalhes de uma sessão
    const loadSessionDetail = useCallback(async (sessionId) => {
        if (!sessionId) {
            console.error("loadSessionDetail: sessionId não fornecido");
            return null;
        }

        try {
            const session = await getSessionDetail(sessionId);
            
            // Garante que mensagens é sempre um array
            if (session) {
                session.messages = Array.isArray(session.messages) ? session.messages : [];
            }
            
            return session;
        } catch (err) {
            setError(err.message || "Erro ao carregar detalhes da sessão");
            console.error("Erro ao carregar sessão:", err);
            return null;
        }
    }, []);

    // Busca imagens de uma sessão
    const loadSessionImages = useCallback(async (sessionId) => {
        if (!sessionId) {
            console.error("loadSessionImages: sessionId não fornecido");
            return [];
        }

        try {
            const response = await fetch(
                `${API_URL}/api/history/sessions/${sessionId}/images`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        ...authHeader()
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Erro ao buscar imagens");
            }

            const images = await response.json();
            return Array.isArray(images) ? images : [];
        } catch (err) {
            console.error("Erro ao carregar imagens:", err);
            return [];
        }
    }, []);

    // Exporta sessão
    const exportSessionData = useCallback(async (sessionId, format = 'json') => {
        if (!sessionId) {
            console.error("exportSessionData: sessionId não fornecido");
            return null;
        }

        try {
            const data = await exportSession(sessionId, format);
            
            if (format === 'html') {
                // Cria blob e faz download
                const blob = new Blob([data], { type: 'text/html' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `receita-${sessionId}.html`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                // Download JSON
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `receita-${sessionId}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
            
            return true;
        } catch (err) {
            console.error("Erro ao exportar sessão:", err);
            return false;
        }
    }, []);

    // Função de refresh
    const refreshHistory = useCallback((page, filters) => {
        loadHistory(page || pagination.page, filters);
        loadStatistics();
    }, [loadHistory, loadStatistics, pagination.page]);

    // Inicialização
    useEffect(() => {
        if (userId) {
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