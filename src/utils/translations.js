// src/utils/translations.js
import i18n from '@/i18n';

export const translateList = async (items, sourceLang = 'pt', targetLang = null) => {
  const target = targetLang || i18n.language;
  
  if (target === 'pt' || !items || items.length === 0) {
    return items;
  }
  
  // Verificar cache
  const cacheKey = `translated_list_${target}_${JSON.stringify(items).slice(0, 100)}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  try {
    // Traduzir via API
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: items.join('\n'),
        source: sourceLang,
        target: target,
        format: 'text'
      })
    });
    
    const data = await response.json();
    const translated = data.translatedText.split('\n');
    
    // Cache por 1 hora
    localStorage.setItem(cacheKey, JSON.stringify(translated));
    
    return translated;
  } catch (error) {
    console.warn('Erro ao traduzir lista:', error);
    return items; // Fallback
  }
};