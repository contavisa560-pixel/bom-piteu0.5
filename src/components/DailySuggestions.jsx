import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChefHat, X, Flame, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRecipeHistory } from '@/hooks/useRecipeHistory';
import { recipeImages } from '@/components/InternationalRecipes';
import { Skeleton } from '@/components/ui/Skeleton';
import { useQuery } from '@tanstack/react-query';

// ─── Constantes ───────────────────────────────────────────────────────────────
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80';
const ROTATION_MS    = 5 * 60 * 1000; // 5 minutos
const CARDS_COUNT    = 3;

// ─── Mapa de afinidade de países ─────────────────────────────────────────────
const COUNTRY_AFFINITY = {
  'Angola': ['Angola', 'Portugal', 'Brasil', 'Nigéria', 'República do Congo'],
  'Portugal': ['Portugal', 'Espanha', 'França', 'Brasil', 'Angola'],
  'Brasil': ['Brasil', 'Portugal', 'Argentina', 'Colômbia'],
  'Moçambique': ['Moçambique', 'Portugal', 'África do Sul', 'Quénia'],
  'Itália': ['Itália', 'Espanha', 'França', 'Grécia', 'Portugal'],
  'França': ['França', 'Espanha', 'Itália', 'Bélgica', 'Suíça', 'Canadá'],
  'Espanha': ['Espanha', 'Portugal', 'França', 'Itália', 'México', 'Argentina'],
  'Reino Unido': ['Reino Unido', 'EUA', 'Canadá', 'Irlanda', 'Austrália'],
  'Irlanda': ['Irlanda', 'Reino Unido', 'EUA', 'França'],
  'Escócia': ['Escócia', 'Reino Unido', 'Irlanda', 'EUA'],
  'Holanda': ['Holanda', 'Bélgica', 'França', 'Alemanha'],
  'Bélgica': ['Bélgica', 'França', 'Holanda', 'Alemanha'],
  'Suíça': ['Suíça', 'França', 'Alemanha', 'Itália', 'Áustria'],
  'Áustria': ['Áustria', 'Alemanha', 'Suíça', 'Hungria', 'República Checa'],
  'Alemanha': ['Alemanha', 'Áustria', 'Suíça', 'Holanda', 'Polónia'],
  'Grécia': ['Grécia', 'Itália', 'Espanha', 'Turquia', 'França'],
  'Turquia': ['Turquia', 'Alemanha', 'Grécia', 'Irão', 'Arábia Saudita'],
  'Suécia': ['Suécia', 'Noruega', 'Dinamarca', 'Finlândia'],
  'Noruega': ['Noruega', 'Suécia', 'Dinamarca', 'Reino Unido'],
  'Dinamarca': ['Dinamarca', 'Suécia', 'Noruega', 'Alemanha'],
  'Finlândia': ['Finlândia', 'Suécia', 'Rússia', 'Noruega'],
  'Polónia': ['Polónia', 'Alemanha', 'República Checa', 'Ucrânia'],
  'República Checa': ['República Checa', 'Áustria', 'Polónia', 'Alemanha'],
  'Hungria': ['Hungria', 'Áustria', 'República Checa', 'Polónia', 'Sérvia'],
  'Ucrânia': ['Ucrânia', 'Rússia', 'Polónia', 'Turquia'],
  'Rússia': ['Rússia', 'Ucrânia', 'Cazaquistão', 'Geórgia'],
  'Bósnia': ['Bósnia', 'Sérvia', 'Turquia', 'Áustria'],
  'Sérvia': ['Sérvia', 'Bósnia', 'Rússia', 'Turquia'],
  'EUA': ['EUA', 'Canadá', 'Reino Unido', 'México', 'Brasil'],
  'Canadá': ['Canadá', 'EUA', 'França', 'Reino Unido'],
  'México': ['México', 'Espanha', 'EUA', 'Colômbia', 'Argentina'],
  'Argentina': ['Argentina', 'Brasil', 'Espanha', 'Itália', 'Uruguai'],
  'Uruguai': ['Uruguai', 'Argentina', 'Brasil', 'Espanha'],
  'Chile': ['Chile', 'Argentina', 'Peru', 'Espanha'],
  'Peru': ['Peru', 'Argentina', 'Chile', 'Brasil', 'Colômbia', 'Equador'],
  'Colômbia': ['Colômbia', 'Brasil', 'Argentina', 'Venezuela', 'Espanha'],
  'Venezuela': ['Venezuela', 'Colômbia', 'Brasil', 'Espanha'],
  'Equador': ['Equador', 'Peru', 'Colômbia', 'Espanha'],
  'Bolívia': ['Bolívia', 'Peru', 'Argentina', 'Brasil', 'Espanha'],
  'Cuba': ['Cuba', 'Espanha', 'EUA', 'México'],
  'Porto Rico': ['Porto Rico', 'EUA', 'Espanha', 'República Dominicana'],
  'Haiti': ['Haiti', 'França', 'EUA', 'República Dominicana'],
  'Trinidad e Tobago': ['Trinidad e Tobago', 'Reino Unido', 'EUA', 'Venezuela'],
  'África do Sul': ['África do Sul', 'Moçambique', 'Zimbabwe', 'Namíbia', 'Lesoto'],
  'África Do Sul': ['África do Sul', 'Moçambique', 'Zimbabwe', 'Namíbia', 'Lesoto'],
  'Nigéria': ['Nigéria', 'Gâmbia', 'Camarões', 'República do Congo'],
  'Senegal': ['Senegal', 'França', 'Mali', 'Gâmbia', 'Nigéria'],
  'Mali': ['Mali', 'França', 'Senegal', 'Nigéria'],
  'Gâmbia': ['Gâmbia', 'Senegal', 'Nigéria', 'Reino Unido'],
  'Camarões': ['Camarões', 'Nigéria', 'França', 'República do Congo'],
  'República do Congo': ['República do Congo', 'França', 'Angola', 'Camarões'],
  'Quénia': ['Quénia', 'Etiópia', 'África do Sul', 'Tanzânia'],
  'Etiópia': ['Etiópia', 'Quénia', 'Egito', 'Sudão'],
  'Egito': ['Egito', 'Arábia Saudita', 'Marrocos', 'França'],
  'Marrocos': ['Marrocos', 'França', 'Espanha', 'Argélia', 'Egito'],
  'Argélia': ['Argélia', 'França', 'Marrocos', 'Tunísia', 'Egito'],
  'Zimbabwe': ['Zimbabwe', 'África do Sul', 'Moçambique', 'Zâmbia'],
  'Lesoto': ['Lesoto', 'África do Sul'],
  'Madagáscar': ['Madagáscar', 'França', 'África do Sul', 'Moçambique'],
  'Cabo Verde': ['Cabo Verde', 'Portugal', 'Brasil', 'Angola'],
  'China': ['China', 'Japão', 'Coreia do Sul', 'Vietname', 'Tailândia'],
  'Japão': ['Japão', 'Coreia do Sul', 'China', 'Tailândia'],
  'Coreia do Sul': ['Coreia do Sul', 'Japão', 'China', 'EUA'],
  'Tailândia': ['Tailândia', 'Vietname', 'Malásia', 'Japão', 'China'],
  'Vietname': ['Vietname', 'Tailândia', 'China', 'França'],
  'Malásia': ['Malásia', 'Singapura', 'Indonésia', 'Tailândia'],
  'Singapura': ['Singapura', 'Malásia', 'China', 'Reino Unido'],
  'Indonésia': ['Indonésia', 'Malásia', 'Tailândia', 'Holanda'],
  'Filipinas': ['Filipinas', 'Espanha', 'EUA', 'Japão'],
  'Índia': ['Índia', 'Paquistão', 'Nepal', 'Reino Unido', 'Tailândia'],
  'Paquistão': ['Paquistão', 'Índia', 'Irão', 'Reino Unido'],
  'Nepal': ['Nepal', 'Índia', 'China', 'Tibete'],
  'Tibete': ['Tibete', 'China', 'Nepal', 'Índia'],
  'Irão': ['Irão', 'Paquistão', 'Turquia', 'Iraque'],
  'Israel': ['Israel', 'EUA', 'França', 'Jordânia', 'Líbano'],
  'Jordânia': ['Jordânia', 'Arábia Saudita', 'Israel', 'Líbano'],
  'Líbano': ['Líbano', 'França', 'Síria', 'Jordânia'],
  'Arábia Saudita': ['Arábia Saudita', 'Egito', 'Jordânia', 'Emirados Árabes'],
  'Geórgia': ['Geórgia', 'Rússia', 'Turquia', 'Arménia'],
  'Arménia': ['Arménia', 'Rússia', 'Geórgia', 'Turquia'],
  'Usbequistão': ['Usbequistão', 'Cazaquistão', 'Rússia', 'Turquia'],
  'Cazaquistão': ['Cazaquistão', 'Rússia', 'Usbequistão', 'Turquia'],
};

// ─── Palavras proibidas por dieta ─────────────────────────────────────────────
const DIET_FORBIDDEN = {
  'Vegana':      ['carne','frango','peixe','camarão','ovo','ovos','leite','queijo','manteiga','mel','bacon','salmão','atum','natas','iogurte','bife','peru','fiambre','presunto','marisco','lagosta','lula','polvo','sardinhas','bacalhau','ghee','cream','butter','cheese','milk','egg','chicken','beef','pork','fish','shrimp','lobster','gelatina','mozzarella','parmesão','ricotta','bechamel','maionese'],
  'Vegetariana': ['carne','frango','peixe','camarão','pato','porco','bacon','salmão','atum','bife','vitela','borrego','cordeiro','peru','linguiça','chouriço','fiambre','presunto','marisco','lagosta','caranguejo','lula','polvo','sardinhas','bacalhau','chicken','beef','pork','fish','shrimp','lobster'],
  'Sem Glúten':  ['trigo','farinha','massa','pão','wheat','flour','macarrão','esparguete','noodles','tortilla','cevada','centeio','aveia','semolina','bulgur','couscous','panko'],
  'Cetogênica (Keto)': ['arroz','massa','pão','batata','açúcar','mel','milho','feijão','lentilha','grão','farinha','aveia','cevada','trigo','macarrão','esparguete','noodles','couscous','quinoa','tapioca'],
  'Low Carb':    ['arroz','massa','pão','batata','milho','feijão','lentilha','grão','macarrão','esparguete','noodles','couscous','tapioca'],
  'Paleo':       ['arroz','massa','pão','feijão','lentilha','grão','soja','tofu','leite','queijo','manteiga','iogurte','natas','milho','aveia','trigo','cevada','centeio','açúcar','farinha','macarrão','noodles'],
};

const ALLERGY_KEYWORDS = {
  'Amendoim':     ['amendoim','peanut'],
  'Leite':        ['leite','queijo','manteiga','natas','cream','butter','cheese','milk','iogurte','yogurt','lactose','creme','mozzarella','parmesão','ricotta','bechamel'],
  'Ovo':          ['ovo','ovos','egg','eggs','gema','clara','mayonnaise','maionese'],
  'Trigo':        ['trigo','farinha','massa','pão','wheat','flour','macarrão','esparguete','noodles','tortilla','cevada','centeio','aveia','couscous','bulgur','panko','semolina'],
  'Frutos Secos': ['noz','nozes','amêndoa','avelã','castanha','nuts','almond','pistácio','anacardo','caju','macadâmia','pecan'],
  'Marisco':      ['camarão','caranguejo','lagosta','mexilhão','ameijoa','shrimp','shellfish','lula','polvo','berbigão'],
  'Peixe':        ['peixe','salmão','atum','bacalhau','fish','salmon','tuna','sardinhas','robalo','dourada','tilápia','anchova'],
  'Soja':         ['soja','tofu','soy','edamame','miso','tempeh'],
  'Sésamo':       ['sésamo','tahini','sesame','gergelim'],
  'Sulfitos':     ['vinho','wine','vinagre','cerveja','beer'],
};

// ─── Verificar segurança da receita ──────────────────────────────────────────
function isRecipeSafe(recipe, userAllergies = [], userDiets = []) {
  const texto = [
    recipe.ingredientes || '',
    recipe.perfil_alimentar || '',
    recipe.nome_receita || recipe.name || '',
  ].join(' ').toLowerCase();

  for (const allergy of userAllergies) {
    const keywords = ALLERGY_KEYWORDS[allergy] || [allergy.toLowerCase()];
    if (keywords.some(kw => texto.includes(kw))) return false;
  }
  for (const diet of userDiets) {
    const forbidden = DIET_FORBIDDEN[diet];
    if (!forbidden) continue;
    if (forbidden.some(word => texto.includes(word))) return false;
  }
  return true;
}

// ─── Seed diária por utilizador ───────────────────────────────────────────────
function dailySeed(userId) {
  const today = new Date().toISOString().split('T')[0];
  const str   = `${userId || 'guest'}-${today}`;
  return str.split('').reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0) >>> 0;
}

// ─── MELHORIA 1: Perfil de gosto do utilizador (Content-Based) ───────────────
// Constrói um dicionário tag→peso com base no histórico de cliques do utilizador.
// Receitas clicadas recentemente têm mais peso (recency decay com 7 dias).
function buildUserTasteProfile(history, pool) {
  const tagWeights = {};
  
  //  CORREÇÃO: Garantir que history é um array
  const historyArray = Array.isArray(history) ? history : [];
  
  if (!historyArray || historyArray.length === 0) return tagWeights;

  historyArray.forEach(h => {
    const recipe = pool.find(r => (r.nome_receita || r.name) === h.nome_receita);
    if (!recipe) return;

    // Peso decresce exponencialmente com o tempo (7 dias = meio-vida)
    const hoursAgo  = (Date.now() - new Date(h.clickedAt).getTime()) / 3_600_000;
    const recency   = Math.exp(-hoursAgo / (7 * 24));
    const intentMultiplier = h.cooked ? 2.0 : 1.0;
    const weight = recency * intentMultiplier;

    const tags = (recipe.perfil_alimentar || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    tags.forEach(tag => {
      tagWeights[tag] = (tagWeights[tag] || 0) + weight;
    });

    if (recipe.pais) {
      const countryKey = `country:${recipe.pais}`;
      tagWeights[countryKey] = (tagWeights[countryKey] || 0) + weight * 1.5;
    }

    if (recipe.categoria) {
      const catKey = `cat:${recipe.categoria.toLowerCase()}`;
      tagWeights[catKey] = (tagWeights[catKey] || 0) + weight * 0.8;
    }
  });

  return tagWeights;
}
// ─── MELHORIA 2: Score de similaridade de conteúdo ───────────────────────────
// Compara a receita com o perfil de gosto do utilizador.
// Cap em 60 para não dominar os outros sinais.
function contentSimilarityScore(recipe, tasteProfile) {
  if (!tasteProfile || Object.keys(tasteProfile).length === 0) return 0;

  let similarity = 0;
  const tags = (recipe.perfil_alimentar || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

  tags.forEach(tag => {
    if (tasteProfile[tag]) similarity += tasteProfile[tag] * 20;
  });

  const countryKey = `country:${recipe.pais}`;
  if (tasteProfile[countryKey]) similarity += tasteProfile[countryKey] * 15;

  const catKey = `cat:${(recipe.categoria || '').toLowerCase()}`;
  if (tasteProfile[catKey]) similarity += tasteProfile[catKey] * 10;

  return Math.min(similarity, 60); // cap
}

// ─── MELHORIA 3: Bónus contextual por hora e dia da semana ───────────────────
// Segunda a sexta → receitas rápidas favorecidas; fim de semana → elaboradas.
// Hora do dia ajusta a categoria preferida com granularidade fina.
function getContextualBonus(recipe) {
  const now        = new Date();
  const hour       = now.getHours();
  const dayOfWeek  = now.getDay(); // 0=Dom, 6=Sáb
  const categoria  = (recipe.categoria || '').toLowerCase();
  const tempo      = parseInt(recipe.tempo_preparo) || 30;
  let bonus        = 0;

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Fim de semana: receitas elaboradas ganham bónus
  if (isWeekend && tempo > 60) bonus += 20;
  // Dias de semana: receitas rápidas são preferíveis
  if (!isWeekend && tempo <= 30) bonus += 18;
  if (!isWeekend && tempo > 90)  bonus -= 10; // penalizar receitas muito demoradas em dias úteis

  // Pequeno-almoço: 6h–10h
  if (hour >= 6  && hour < 10  && categoria.includes('pequeno')) bonus += 28;
  // Almoço: 11h–14h30
  if (hour >= 11 && hour < 15  && (categoria.includes('almoço') || categoria.includes('almoco'))) bonus += 28;
  // Lanche: 15h–17h
  if (hour >= 15 && hour < 18  && (categoria.includes('lanche') || categoria.includes('entrada'))) bonus += 18;
  // Jantar: 18h–21h
  if (hour >= 18 && hour < 22  && (categoria.includes('jantar'))) bonus += 28;
  // Late night snack
  if ((hour >= 22 || hour < 2) && tempo <= 20) bonus += 12;

  return bonus;
}

// ─── MELHORIA 4: Similaridade de Jaccard entre duas receitas (para MMR) ──────
// Mede o quanto duas receitas são parecidas em termos de tags + país.
// Retorna valor entre 0 (diferentes) e 1 (iguais).
function computeRecipeSimilarity(r1, r2) {
  let sim = 0;

  // País igual → alta similaridade
  if ((r1.pais || '') === (r2.pais || '') && r1.pais) sim += 0.4;

  // Jaccard das tags de perfil alimentar
  const tags1 = new Set((r1.perfil_alimentar || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean));
  const tags2 = new Set((r2.perfil_alimentar || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean));
  const intersection = [...tags1].filter(t => tags2.has(t)).length;
  const union = new Set([...tags1, ...tags2]).size;
  if (union > 0) sim += 0.6 * (intersection / union);

  return Math.min(sim, 1);
}

// ─── MELHORIA 5: MMR — Maximal Marginal Relevance (Spotify-style) ─────────────
// Selecciona receitas equilibrando RELEVÂNCIA com DIVERSIDADE.
// lambda=1 → só relevância; lambda=0 → só diversidade.
// Evita mostrar 3 receitas de frango angolano com tags idênticas.
function mmrSelection(scoredList, count = CARDS_COUNT, lambda = 0.72) {
  if (scoredList.length <= count) return scoredList.map(s => s.recipe);

  const selected    = [];
  const remaining   = [...scoredList]; // { recipe, score }

  while (selected.length < count && remaining.length > 0) {
    let bestIdx   = 0;
    let bestScore = -Infinity;

    remaining.forEach(({ recipe, score }, idx) => {
      // Penalização máxima por similaridade com qualquer receita já seleccionada
      const maxSimilarity = selected.reduce((max, sel) => {
        return Math.max(max, computeRecipeSimilarity(recipe, sel));
      }, 0);

      const mmrScore = lambda * score - (1 - lambda) * maxSimilarity * 100;
      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIdx   = idx;
      }
    });

    selected.push(remaining[bestIdx].recipe);
    remaining.splice(bestIdx, 1);
  }

  return selected;
}

// ─── Score principal — agrega todos os sinais ────────────────────────────────
function scoreRecipe(recipe, { user, preferences, history, seed, rotationOffset, tasteProfile }) {
  let score = 0;
  const nome   = recipe.nome_receita || recipe.name || '';
  const perfil = (recipe.perfil_alimentar || '').toLowerCase();
  const pais   = recipe.pais || '';

  // ── Sinal 1: País do utilizador ──────────────────────────────────────────
  const userCountry = user?.country || 'Angola';
  const affine      = COUNTRY_AFFINITY[userCountry] || [];
  if (pais === userCountry)       score += 50;
  else if (affine.includes(pais)) score += 30;

  // ── Sinal 2: Decay exponencial do histórico (MELHORADO) ──────────────────
  // Substitui a penalização em degraus por uma curva suave.
  // Penalização máxima nas 1ªs horas; depois decresce. Bónus de nostalgia após 7 dias.
  const histEntry = history.find(h => h.nome_receita === nome);
  if (histEntry) {
    const hoursAgo     = (Date.now() - new Date(histEntry.clickedAt).getTime()) / 3_600_000;
    const decayPenalty = -80 * Math.exp(-hoursAgo / 24); // -80 nas 0h, ~-40 nas 24h, ~-10 nas 72h
    score += decayPenalty;
    if (hoursAgo > 168) score += 15; // nostalgia: voltou depois de 7+ dias
  } else {
    score += 25; // receita nunca vista → bónus de novidade
  }

  // ── Sinal 3: Padrão de preferências do histórico (países e categorias) ───
  const countryClicks  = {};
  const categoryClicks = {};
  const historyArray = Array.isArray(history) ? history : [];
  history.forEach(h => {
    if (h.pais)      countryClicks[h.pais]      = (countryClicks[h.pais]      || 0) + 1;
    if (h.categoria) categoryClicks[h.categoria] = (categoryClicks[h.categoria] || 0) + 1;
  });
  if (countryClicks[pais])                   score += Math.min(countryClicks[pais] * 10, 50);
  const recipeCat = recipe.categoria || recipe.category || '';
  if (categoryClicks[recipeCat])             score += Math.min(categoryClicks[recipeCat] * 8, 40);

  // ── Sinal 4: Compatibilidade com dieta activa ─────────────────────────────
  const diets = (preferences?.diets || []).map(d => d.name || d.label || d);
  diets.forEach(diet => {
    if (diet === 'Vegana'            && perfil.includes('vegan'))      score += 35;
    if (diet === 'Vegetariana'       && perfil.includes('vegetar'))    score += 30;
    if (diet === 'Sem Glúten'        && perfil.includes('sem glúten')) score += 25;
    if (diet === 'Mediterrânica'     && perfil.includes('mediterr'))   score += 25;
    if (diet === 'Paleo'             && perfil.includes('paleo'))      score += 25;
    if (diet === 'Cetogênica (Keto)' && perfil.includes('keto'))       score += 25;
  });

  // ── Sinal 5: Content-Based Similarity (NOVO) ─────────────────────────────
  score += contentSimilarityScore(recipe, tasteProfile);

  // ── Sinal 6: Contexto hora + dia da semana (NOVO) ─────────────────────────
  score += getContextualBonus(recipe);

  // ── Sinal 7: Feedback implícito de hover (NOVO) ───────────────────────────
  // Se o utilizador fez hover longo numa receita, ela tem implicitScore no histórico
  if (histEntry?.implicitScore) {
    score += Math.min(histEntry.implicitScore * 15, 30);
  }

  // ── Sinal 8: Variação diária (mantido do original) ────────────────────────
  const nameHash = nome.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  score += ((seed * 17 + nameHash * 11 + rotationOffset * 7) % 30) - 15;

  return score;
}

// ─── Persistência do feedback implícito ──────────────────────────────────────
// Guarda sinais de hover no localStorage para o algoritmo usar na próxima sessão.
function saveImplicitSignal(userId, recipeName, signal) {
  if (!userId) return;
  const weights = {
    'hover_2s':         0.1,
    'modal_open':       0.5,
    'modal_close_fast': 0.2,
    'cook_clicked':     1.0,
  };
  try {
    const key     = `bomPiteu_recipeHistory_${userId}`;
    const history = JSON.parse(localStorage.getItem(key) || '{}');
    const entry   = history[recipeName] || { implicitScore: 0 };
    entry.implicitScore = Math.min((entry.implicitScore || 0) + (weights[signal] || 0), 5);
    history[recipeName] = entry;
    localStorage.setItem(key, JSON.stringify(history));
  } catch { /* silencioso */ }
}

// ─── Seleccionar N receitas com todos os melhoramentos ───────────────────────
function pickRecipes(pool, { user, preferences, history, seed, rotationOffset, count = CARDS_COUNT, applyRestrictions = true }) {
  const userAllergies = (preferences?.allergies || []).map(a => a.name || a.label || a);
  const userDiets     = (preferences?.diets     || []).map(d => d.name || d.label || d);

  // Filtro de segurança (alergias + dietas)
  const safe    = applyRestrictions
    ? pool.filter(r => isRecipeSafe(r, userAllergies, userDiets))
    : pool;
    const working = safe.length >= count ? safe : pool;
    const safeHistory = Array.isArray(history) ? history : [];

  // Construir perfil de gosto do utilizador (content-based)
  const tasteProfile = buildUserTasteProfile(history, pool);

  // Pontuar todas as receitas com o algoritmo completo
  const scored = working.map(recipe => ({
    recipe,
    score: scoreRecipe(recipe, { user, preferences, history, seed, rotationOffset, tasteProfile }),
  })).sort((a, b) => b.score - a.score);

  // Aplicar MMR para garantir diversidade (substitui o tryAdd manual)
  const finalRecipes = mmrSelection(scored, count, 0.72);

  // Fallback: se MMR não chegou ao count (pool muito pequeno), preenche sem restrição
  if (finalRecipes.length < count) {
    for (const { recipe } of scored) {
      if (finalRecipes.length >= count) break;
      if (!finalRecipes.find(r => (r.nome_receita || r.name) === (recipe.nome_receita || recipe.name))) {
        finalRecipes.push(recipe);
      }
    }
  }

  return finalRecipes;
}

// ─── Normalizar receita para o formato do componente ─────────────────────────
function normalizeRecipe(r) {
  const nome = r.nome_receita || r.name || '';
  return {
    ...r,
    name:        nome,
    pais:        r.pais || 'Internacional',
    category:    r.categoria || r.category || 'Internacional',
    time:        r.tempo_preparo || r.time || '30 min',
    difficulty:  r.dificuldade || r.difficulty || 'Médio',
    description: (r.ingredientes || r.description || '').substring(0, 120) + '...',
    tags:        (r.perfil_alimentar || '').split(',').map(t => t.trim()).filter(Boolean),
    image:       r.imagem_url || recipeImages?.[nome] || FALLBACK_IMAGE,
    _isPersonalized: true,
  };
}

// ─── DiffBadge ────────────────────────────────────────────────────────────────
const DiffBadge = ({ level }) => {
  const { t } = useTranslation();
  const map = {
    'Fácil':   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    'Médio':   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    'Difícil': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };
  const keyMap = { 'Fácil': 'easy', 'Médio': 'medium', 'Difícil': 'hard' };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${map[level] || map['Médio']}`}>
      {t(`difficulty.${keyMap[level] || 'medium'}`)}
    </span>
  );
};

// ─── Modal de detalhe ─────────────────────────────────────────────────────────
const RecipeModal = ({ recipe, onClose, onCook, userId }) => {
  const { t } = useTranslation();
  const openedAt = useRef(Date.now());

  // Registar abertura do modal como sinal implícito
  useEffect(() => {
    if (recipe && userId) {
      saveImplicitSignal(userId, recipe.name, 'modal_open');
    }
    return () => {
      // Se fechou menos de 5s depois → fechou rápido (interesse baixo)
      if (recipe && userId) {
        const duration = Date.now() - openedAt.current;
        if (duration < 5000) saveImplicitSignal(userId, recipe.name, 'modal_close_fast');
      }
    };
  }, [recipe, userId]);

  if (!recipe) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="bg-white dark:bg-gray-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="relative h-52 overflow-hidden">
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-full object-cover"
              onError={e => { e.target.src = FALLBACK_IMAGE; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full mb-1">
                {recipe.category}
              </div>
              <h2 className="text-xl font-bold text-white leading-tight">{recipe.name}</h2>
              {recipe.pais && <p className="text-white/70 text-xs mt-0.5">📍 {recipe.pais}</p>}
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                <Clock className="h-4 w-4" />
                <span>{recipe.time}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                <Flame className="h-4 w-4 text-orange-400" />
                <span>{recipe.difficulty}</span>
              </div>
              {recipe.tags?.slice(0, 2).map(tag => (
                <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-5">
              {recipe.description}
            </p>

            {recipe._isPersonalized && (
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5 mb-5">
                <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  Sugestão personalizada para o teu perfil
                </p>
              </div>
            )}

            <button
              onClick={() => {
                if (userId) saveImplicitSignal(userId, recipe.name, 'cook_clicked');
                onCook(recipe);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg text-sm"
            >
              <ChefHat className="h-5 w-5" />
              Quero cozinhar isto
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const DailySuggestions = ({ onStartChat, user, preferences, settings }) => {
  const userId = user?._id || user?.id;
  const { history: rawHistory, trackRecipe } = useRecipeHistory(userId);
    const history = React.useMemo(() => {
    if (!rawHistory) return [];
    if (Array.isArray(rawHistory)) return rawHistory;
    
    return Object.values(rawHistory);
  }, [rawHistory]);

  // Pool da viagem gastronómica (vem do backend)
  const { data: dbRecipes, isLoading } = useQuery({
    queryKey: ['international-recipes-public'],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/international-recipes/public`)
        .then(r => r.json())
        .then(json => json.data || []),
    staleTime: 5 * 60 * 1000,
  });

  const [rotationOffset, setRotationOffset] = useState(() => Math.floor(Date.now() / ROTATION_MS));
  const [recipes, setRecipes]               = useState([]);
  const [isRefreshing, setIsRefreshing]     = useState(false);
  const [selectedRecipe, setSelected]       = useState(null);
  const [imgErrors, setImgErrors]           = useState({});
  const timerRef                            = useRef(null);
  const hoverTimers                         = useRef({});

  // Re-calcular receitas sempre que pool, histórico, offset ou preferências mudam
  const compute = useCallback(() => {
    if (!dbRecipes || dbRecipes.length === 0) return;
    const seed              = dailySeed(userId);
    const applyRestrictions = settings?.restrictionsInSuggestions !== false;

    const picked = pickRecipes(dbRecipes, {
      user, preferences, history, seed, rotationOffset, applyRestrictions,
    });
    setRecipes(picked.map(normalizeRecipe));
  }, [dbRecipes, user, preferences, history, rotationOffset, userId, settings?.restrictionsInSuggestions]);

  // Rotação automática a cada 5 min
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRotationOffset(Math.floor(Date.now() / ROTATION_MS));
    }, ROTATION_MS);
    return () => clearInterval(timerRef.current);
  }, []);

  // Recalcular quando rotationOffset ou compute mudar
  useEffect(() => {
    compute();
  }, [compute, rotationOffset]);

  // Refresh manual
  const handleRefresh = () => {
    setIsRefreshing(true);
    setRotationOffset(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleCook = (recipe) => {
    trackRecipe(recipe);
    onStartChat({
      title:       recipe.name,
      source:      'receita_internacional_direta',
      nomeReceita: recipe.name,
      pais:        recipe.pais || 'Internacional',
      query:       null,
    });
  };

  // ─── Registo de hover implícito ───────────────────────────────────────────
  // Se o utilizador mantiver o rato sobre um card por 2+ segundos,
  // isso é registado como um sinal de interesse fraco (peso 0.1).
  const handleMouseEnter = (recipeName) => {
    if (!userId) return;
    hoverTimers.current[recipeName] = setTimeout(() => {
      saveImplicitSignal(userId, recipeName, 'hover_2s');
    }, 2000);
  };

  const handleMouseLeave = (recipeName) => {
    if (hoverTimers.current[recipeName]) {
      clearTimeout(hoverTimers.current[recipeName]);
      delete hoverTimers.current[recipeName];
    }
  };

  // Limpar timers de hover ao desmontar
  useEffect(() => {
    return () => {
      Object.values(hoverTimers.current).forEach(clearTimeout);
    };
  }, []);

  // ─── Skeleton ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <Skeleton className="h-44 w-full" />
            <div className="p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full mb-3" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recipes.length === 0) return null;

  return (
    <>
      {/* Botão de atualização manual */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 font-semibold transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar agora
        </button>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {recipes.map((recipe, i) => (
            <motion.div
              key={`${recipe.name}-${rotationOffset}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              onClick={() => setSelected(recipe)}
              onMouseEnter={() => handleMouseEnter(recipe.name)}
              onMouseLeave={() => handleMouseLeave(recipe.name)}
              className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-700">
                {!imgErrors[recipe.name] ? (
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={() => setImgErrors(p => ({ ...p, [recipe.name]: true }))}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-gray-100 dark:bg-gray-700">
                    🍽️
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {recipe.category}
                </div>

                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {recipe.time}
                </div>

                {recipe.pais && (
                  <div className="absolute bottom-3 left-3 text-white text-[10px] font-semibold bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    {recipe.pais}
                  </div>
                )}

                {recipe._isPersonalized && (
                  <div className="absolute bottom-3 right-3">
                    <Sparkles className="h-3.5 w-3.5 text-yellow-300 drop-shadow" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug mb-1 line-clamp-1 group-hover:text-orange-500 transition-colors">
                  {recipe.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                  {recipe.description}
                </p>
                <div className="flex items-center justify-between">
                  <DiffBadge level={recipe.difficulty} />
                  <div className="flex items-center gap-1 text-orange-500 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver receita <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <RecipeModal
            recipe={selectedRecipe}
            onClose={() => setSelected(null)}
            onCook={handleCook}
            userId={userId}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default DailySuggestions;