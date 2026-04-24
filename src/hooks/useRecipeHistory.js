import { useState, useCallback } from 'react';

export function useRecipeHistory(userId) {
  const key = userId
    ? `bomPiteu_recipeHistory_${userId}`
    : 'bomPiteu_recipeHistory_guest';

  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const trackRecipe = useCallback((recipe) => {
    setHistory(prev => {
      const entry = {
        nome_receita: recipe.name || recipe.nome_receita,
        pais:         recipe.pais || 'Internacional',
        categoria:    recipe.category || recipe.categoria || 'Jantar',
        clickedAt:    new Date().toISOString(),
      };
      const filtered = prev.filter(h => h.nome_receita !== entry.nome_receita);
      const updated  = [entry, ...filtered].slice(0, 50);
      try { localStorage.setItem(key, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, [key]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(key);
  }, [key]);

  return { history, trackRecipe, clearHistory };
}