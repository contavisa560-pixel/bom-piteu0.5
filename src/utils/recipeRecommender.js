// ─────────────────────────────────────────────────────────────────────────────
// 🧠 recipeRecommender.js
// Motor de recomendação personalizada de receitas
// Integra com: internationalRecipes, usePreferences, user object
// ─────────────────────────────────────────────────────────────────────────────

import { internationalRecipes } from '@/data/internationalRecipes';

// ── Chaves do localStorage ────────────────────────────────────────────────────
const HISTORY_KEY   = (uid) => `bomPiteu_recipeHistory_${uid}`;
const SEEN_KEY      = (uid) => `bomPiteu_recipeSeenToday_${uid}`;
const DISLIKE_KEY   = (uid) => `bomPiteu_recipeDislikes_${uid}`;

// ── Persistência do histórico ─────────────────────────────────────────────────
export const getHistory = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY(userId)) || '{}');
  } catch { return {}; }
};

const saveHistory = (userId, history) => {
  localStorage.setItem(HISTORY_KEY(userId), JSON.stringify(history));
};

// ── Registar interação com uma receita ───────────────────────────────────────
export const recordInteraction = (userId, recipeName, action) => {
  // action: 'view' | 'like' | 'dislike' | 'cook'
  if (!userId) return;

  const history = getHistory(userId);
  const now     = new Date().toISOString();
  const entry   = history[recipeName] || { views: 0, liked: false, disliked: false, cooked: 0, lastSeen: null };

  if (action === 'view')    { entry.views++;    entry.lastSeen = now; }
  if (action === 'like')    { entry.liked    = true;  entry.disliked = false; }
  if (action === 'dislike') { entry.disliked = true;  entry.liked    = false; }
  if (action === 'cook')    { entry.cooked++;  entry.lastSeen = now; }

  history[recipeName] = entry;
  saveHistory(userId, history);

  // Gerir dislikes com expiração de 7 dias
  if (action === 'dislike') {
    const dislikes = JSON.parse(localStorage.getItem(DISLIKE_KEY(userId)) || '{}');
    dislikes[recipeName] = now;
    localStorage.setItem(DISLIKE_KEY(userId), JSON.stringify(dislikes));
  }
};

// ── Marcar receita como vista hoje ───────────────────────────────────────────
export const markSeenToday = (userId, recipeName) => {
  if (!userId) return;
  const today = new Date().toISOString().split('T')[0];
  const seen  = JSON.parse(localStorage.getItem(SEEN_KEY(userId)) || '{}');
  if (seen.date !== today) { seen.date = today; seen.names = []; }
  seen.names = [...new Set([...(seen.names || []), recipeName])];
  localStorage.setItem(SEEN_KEY(userId), JSON.stringify(seen));
};

const getSeenToday = (userId) => {
  const today = new Date().toISOString().split('T')[0];
  const seen  = JSON.parse(localStorage.getItem(SEEN_KEY(userId)) || '{}');
  return seen.date === today ? (seen.names || []) : [];
};

// ── Dislikes ainda activos (< 7 dias) ────────────────────────────────────────
const getActiveDislikes = (userId) => {
  const dislikes  = JSON.parse(localStorage.getItem(DISLIKE_KEY(userId)) || '{}');
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const now       = Date.now();
  return Object.keys(dislikes).filter(name => {
    return (now - new Date(dislikes[name]).getTime()) < sevenDays;
  });
};

// ── Ler preferências do hook usePreferences (localStorage) ───────────────────
const getPreferences = (userId) => {
  // usePreferences guarda em: bomPiteu_preferences (sem userId no objeto, mas o hook lê com userId)
  // Vamos tentar as chaves mais comuns que o hook usa
  const keys = [
    `bomPiteu_preferences_${userId}`,
    `bomPiteu_preferences`,
    `smartchef_preferences_${userId}`,
  ];
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (raw && raw !== 'true') {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch { /* continua */ }
  }
  return null;
};

// ── Mapa: país do utilizador → nome do país nas receitas ─────────────────────
const COUNTRY_MAP = {
  'Angola':     'Angola',
  'Brasil':     'Brasil',
  'Portugal':   'Portugal',
  'Moçambique': 'Moçambique',
};

// ── Mapa: restrição → string a procurar em perfil_alimentar ──────────────────
const RESTRICTION_MAP = {
  'Vegana':               ['Vegano'],
  'Vegetariana':          ['Vegetariano', 'Vegano'],
  'Sem Glúten':           ['Sem Glúten'],
  'Glúten (Celíaca)':     ['Sem Glúten'],
  'Glúten (Sensibilidade)':['Sem Glúten'],
  'Lactose':              ['Sem Lactose'],
  'Amendoim':             [], // excluir receitas com "amendoim" nos ingredientes
};

// ── Categoria sugerida por hora do dia ───────────────────────────────────────
const getMealCategory = () => {
  const h = new Date().getHours();
  if (h >= 5  && h < 11) return 'Pequeno-almoço';
  if (h >= 11 && h < 15) return 'Almoço';
  if (h >= 15 && h < 21) return 'Jantar';
  return null; // fora do horário → sem preferência
};

// ── Categorias da Jornada Gastronómica que mapeiam para o campo categoria ─────
const MEAL_CATEGORIES = ['Pequeno-almoço', 'Almoço', 'Jantar', 'Acompanhamento', 'Entrada', 'Sopa', 'Brunch', 'Lanche'];

// ── Motor principal de pontuação ─────────────────────────────────────────────
const scoreRecipe = ({ recipe, userId, user, preferences, history, activeDislikes, seenToday, seed }) => {
  let score = 0;

  // ── 1. FILTRO ELIMINATÓRIO: dislikes activos ───────────────────────────────
  if (activeDislikes.includes(recipe.nome_receita)) return -Infinity;

  // ── 2. FILTRO ELIMINATÓRIO: vista hoje ────────────────────────────────────
  if (seenToday.includes(recipe.nome_receita)) return -Infinity;

  // ── 3. Compatibilidade alimentar (restrições) ─────────────────────────────
  const perfil = (recipe.perfil_alimentar || '').toLowerCase();
  const ingred = (recipe.ingredientes || '').toLowerCase();

  const diets      = preferences?.diets      || [];
  const allergies  = preferences?.allergies  || [];
  const intolerances = preferences?.intolerances || [];

  // Dietas activas do utilizador
  for (const diet of diets) {
    const required = RESTRICTION_MAP[diet];
    if (!required) continue;
    const matches = required.some(r => perfil.includes(r.toLowerCase()));
    if (required.length > 0 && !matches) return -Infinity; // elimina incompatíveis
    if (matches) score += 40;
  }

  // Alergias — eliminar se ingrediente presente
  for (const allergy of allergies) {
    const name = (allergy.name || allergy).toLowerCase();
    if (ingred.includes(name)) return -Infinity;
  }

  // Intolerâncias
  for (const intol of intolerances) {
    const name = (intol.name || intol).toLowerCase();
    if (name === 'lactose' && perfil.includes('lactose')) return -Infinity;
    if (name.includes('glúten') && !perfil.includes('sem glúten')) score -= 10;
  }

  // ── 4. País do utilizador ─────────────────────────────────────────────────
  const userCountry = user?.country || '';
  const mappedCountry = COUNTRY_MAP[userCountry] || userCountry;
  if (recipe.pais === mappedCountry) score += 30;

  // ── 5. Histórico: receitas consumidas/curtidas ────────────────────────────
  const entry = history[recipe.nome_receita];
  if (entry) {
    if (entry.liked)   score += 25;
    if (entry.cooked)  score += entry.cooked * 5; // cada vez que cozinhou +5
    if (entry.views)   score += Math.min(entry.views * 2, 10); // max +10
    // Penalizar se foi vista recentemente (últimas 48h)
    if (entry.lastSeen) {
      const hoursSince = (Date.now() - new Date(entry.lastSeen).getTime()) / 3600000;
      if (hoursSince < 48) score -= 20;
    }
  } else {
    // Receita nunca vista → bónus de novidade
    score += 15;
  }

  // ── 6. Padrão de países preferidos (baseado em histórico) ─────────────────
  const viewedCountries = {};
  for (const [name, data] of Object.entries(history)) {
    const r = internationalRecipes.find(x => x.nome_receita === name);
    if (r && (data.liked || data.cooked > 0)) {
      viewedCountries[r.pais] = (viewedCountries[r.pais] || 0) + 1;
    }
  }
  if (viewedCountries[recipe.pais]) score += Math.min(viewedCountries[recipe.pais] * 3, 20);

  // ── 7. Bónus horário (categoria) ─────────────────────────────────────────
  const mealCat = getMealCategory();
  const recipeCat = (recipe.categoria || '').toLowerCase();
  if (mealCat) {
    if (recipeCat.includes(mealCat.toLowerCase())) score += 15;
  }

  // ── 8. Variação diária personalizada (seed por user + data) ──────────────
  const nameHash = recipe.nome_receita.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  score += ((seed * 13 + nameHash * 7) % 20) - 10; // ±10 aleatório mas consistente

  return score;
};

// ── Função principal: gerar N sugestões personalizadas ────────────────────────
export const getPersonalizedSuggestions = ({ userId, user, count = 4 }) => {
  // Ler preferências
  const preferences   = getPreferences(userId);
  const history       = getHistory(userId);
  const activeDislikes = getActiveDislikes(userId);
  const seenToday     = getSeenToday(userId);

  // Seed diária por utilizador
  const today  = new Date().toISOString().split('T')[0];
  const seedStr = `${userId || 'anon'}-${today}`;
  const seed   = seedStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  // Pool: todas as receitas internacionais
  const pool = internationalRecipes;

  // Pontuar todas
  const scored = pool.map(recipe => ({
    recipe,
    score: scoreRecipe({ recipe, userId, user, preferences, history, activeDislikes, seenToday, seed }),
  })).filter(x => x.score > -Infinity);

  // Ordenar por score descendente
  scored.sort((a, b) => b.score - a.score);

  // Tentar garantir diversidade de países (máx 2 do mesmo país)
  const selected = [];
  const countryCounts = {};
  for (const { recipe } of scored) {
    const c = recipe.pais;
    if ((countryCounts[c] || 0) >= 2) continue;
    countryCounts[c] = (countryCounts[c] || 0) + 1;
    selected.push(recipe);
    if (selected.length >= count) break;
  }

  // Fallback: se não chegou a count, preenche sem restrição de país
  if (selected.length < count) {
    for (const { recipe } of scored) {
      if (!selected.find(r => r.nome_receita === recipe.nome_receita)) {
        selected.push(recipe);
        if (selected.length >= count) break;
      }
    }
  }

  // Marcar todas como vistas hoje
  selected.forEach(r => markSeenToday(userId, r.nome_receita));

  // Adaptar para o formato que DailySuggestions espera
  return selected.map(r => ({
    nome_receita:    r.nome_receita,
    pais:            r.pais,
    categoria:       r.categoria || 'Internacional',
    tempo_preparo:   r.tempo_preparo,
    ingredientes:    r.ingredientes,
    perfil_alimentar: r.perfil_alimentar,
    passo_passo:     r.passo_passo,
    // campos de compatibilidade com o componente antigo:
    name:        r.nome_receita,
    time:        r.tempo_preparo,
    description: r.ingredientes,
    difficulty:  'Médio',
    tags:        r.perfil_alimentar?.split(',').map(s => s.trim()) || [],
    image:       null, // DailySuggestions vai buscar de recipeImages
    emoji:       '🍽️',
    category:    r.categoria || 'Internacional',
  }));
};