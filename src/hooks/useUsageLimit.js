import { useState, useCallback, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PLAN_LIMITS = {
  free: { monthly: 7, images: 3, label: 'Gratuito' },
  premium: { monthly: 80, images: 50, label: 'Premium' },
};

export const useUsageLimit = (user) => {
  const [usageStats, setUsageStats] = useState({
    used: 0, limit: 7, remaining: 7,
    imagesUsed: 0, imagesLimit: 3, imagesRemaining: 3,
    isPremium: false, resetDate: null,
  });
  const [showLimitModal, setShowLimitModal] = useState(false);

  const isPremium = user?.isPremium || false;
  const limit = isPremium ? PLAN_LIMITS.premium.monthly : PLAN_LIMITS.free.monthly;
  const imagesLimit = isPremium ? PLAN_LIMITS.premium.images : PLAN_LIMITS.free.images;

  const getToken = () => localStorage.getItem('bomPiteuToken');
  const getUserId = () => user?._id || user?.id;

  // Data de reset: apenas se o limite foi atingido (7 dias depois)
  // Se o limite ainda não foi atingido, não há data de reset
  const calcResetDate = (cycle) => {
    if (cycle?.limitReachedAt) {
      const d = new Date(cycle.limitReachedAt);
      d.setDate(d.getDate() + 7);
      return d;
    }
    return null;
  };

  // Carrega ciclo do backend
  const loadCycleFromBackend = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return null;
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}/usage-cycle`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      return data.usageCycle || null;
    } catch {
      return null;
    }
  }, [user]);

  // Guarda ciclo no backend
  const saveCycleToBackend = useCallback(async (cycle) => {
    const userId = getUserId();
    if (!userId) return;
    try {
      await fetch(`${API_URL}/api/users/${userId}/usage-cycle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(cycle)
      });
    } catch { }
  }, [user]);

  // Verifica se o ciclo deve ser resetado (7 dias após atingir limite)
  // Nunca reseta por tempo — só reseta quando o limite foi atingido E passaram 7 dias
  const resolveReset = async (cycle) => {
    const now = new Date();
    if (cycle?.limitReachedAt) {
      const diffDays = (now - new Date(cycle.limitReachedAt)) / (1000 * 60 * 60 * 24);
      if (diffDays >= 7) {
        const fresh = { used: 0, imagesUsed: 0, startDate: now.toISOString(), limitReachedAt: null };
        await saveCycleToBackend(fresh);
        return fresh;
      }
    }
    return cycle;
  };

  // Carrega e inicializa o ciclo
  const loadStats = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;

    let cycle = await loadCycleFromBackend();
    const now = new Date();

    if (!cycle || !cycle.startDate) {
      cycle = { used: 0, imagesUsed: 0, startDate: now.toISOString(), limitReachedAt: null };
      await saveCycleToBackend(cycle);
    } else {
      cycle = await resolveReset(cycle);
    }

    const visionLimit = isPremium ? 50 : 5;

    setUsageStats({
      used: cycle.used || 0,
      limit,
      remaining: Math.max(0, limit - (cycle.used || 0)),
      imagesUsed: cycle.imagesUsed || 0,
      imagesLimit,
      imagesRemaining: Math.max(0, imagesLimit - (cycle.imagesUsed || 0)),
      visionUsed: cycle.visionUsed || 0,
      visionLimit,
      visionRemaining: Math.max(0, visionLimit - (cycle.visionUsed || 0)),
      isPremium,
      resetDate: calcResetDate(cycle),
    });
  }, [user, limit, imagesLimit, isPremium]);

  // Incrementa uso (mensagem ou imagem)
  const increment = useCallback(async (type = 'message') => {
    const userId = getUserId();
    if (!userId) return;

    let cycle = await loadCycleFromBackend();
    const now = new Date();

    if (!cycle || !cycle.startDate) {
      cycle = { used: 0, imagesUsed: 0, startDate: now.toISOString(), limitReachedAt: null };
    }

    if (type === 'image') {
      cycle.imagesUsed = (cycle.imagesUsed || 0) + 1;
    } else {
      cycle.used = (cycle.used || 0) + 1;
    }

    await saveCycleToBackend(cycle);

    const visionLimit = isPremium ? 50 : 5;

    setUsageStats({
      used: cycle.used || 0,
      limit,
      remaining: Math.max(0, limit - (cycle.used || 0)),
      imagesUsed: cycle.imagesUsed || 0,
      imagesLimit,
      imagesRemaining: Math.max(0, imagesLimit - (cycle.imagesUsed || 0)),
      visionUsed: cycle.visionUsed || 0,       // ← NOVO
      visionLimit,                                    // ← NOVO
      visionRemaining: Math.max(0, visionLimit - (cycle.visionUsed || 0)), // ← NOVO
      isPremium,
      resetDate: calcResetDate(cycle),
    });
  }, [user, limit, imagesLimit, isPremium, loadCycleFromBackend, saveCycleToBackend]);

  // Verifica e incrementa mensagem (free e premium seguem a mesma lógica)
  const checkAndIncrementBot = useCallback(async () => {
    let cycle = await loadCycleFromBackend();
    const now = new Date();

    // Tenta reset se passaram 7 dias desde que o limite foi atingido
    cycle = await resolveReset(cycle || { used: 0, imagesUsed: 0, startDate: now.toISOString(), limitReachedAt: null });

    // Se ainda está bloqueado (menos de 7 dias), recusa
    if (cycle?.limitReachedAt) {
      setUsageStats(prev => ({
        ...prev,
        resetDate: calcResetDate(cycle),
      }));
      // Pequeno delay para garantir que o React processa o setState antes do modal abrir
      setTimeout(() => setShowLimitModal(true), 0);
      return false;
    }

    const used = cycle?.used || 0;

    if (used >= limit) {
      // Atingiu o limite agora — regista o momento exato
      if (!cycle.limitReachedAt) {
        cycle.limitReachedAt = now.toISOString();
        await saveCycleToBackend(cycle);
      }
      // Actualiza o estado com a data de reset antes de abrir o modal
      setUsageStats(prev => ({
        ...prev,
        resetDate: calcResetDate(cycle),
      }));
      setShowLimitModal(true);
      return false;
    }

    await increment('message');
    return true;
  }, [limit, loadCycleFromBackend, saveCycleToBackend, increment]);

  // Verifica e incrementa imagem (free e premium seguem a mesma lógica)
  const checkAndIncrementImage = useCallback(async () => {
    let cycle = await loadCycleFromBackend();
    const now = new Date();

    cycle = await resolveReset(cycle || { used: 0, imagesUsed: 0, startDate: now.toISOString(), limitReachedAt: null });

    if (cycle?.limitReachedAt) {
      setUsageStats(prev => ({
        ...prev,
        resetDate: calcResetDate(cycle),
      }));
      // Pequeno delay para garantir que o React processa o setState antes do modal abrir
      setTimeout(() => setShowLimitModal(true), 0);
      return false;
    }

    const imagesUsed = cycle?.imagesUsed || 0;

    if (imagesUsed >= imagesLimit) {
      if (!cycle.limitReachedAt) {
        cycle.limitReachedAt = now.toISOString();
        await saveCycleToBackend(cycle);
      }
      // Actualiza o estado com a data de reset antes de abrir o modal
      setUsageStats(prev => ({
        ...prev,
        resetDate: calcResetDate(cycle),
      }));
      setShowLimitModal(true);
      return false;
    }

    await increment('image');
    return true;
  }, [imagesLimit, loadCycleFromBackend, saveCycleToBackend, increment]);

  useEffect(() => {
    if (getUserId()) {
      loadStats();
    }
  }, [user?._id, user?.id]);

  return {
    usageStats,
    showLimitModal,
    setShowLimitModal,
    checkAndIncrementBot,
    checkAndIncrementImage,
    isLimitReached: usageStats.remaining <= 0,
    isImageLimitReached: usageStats.imagesRemaining <= 0,
  };
};