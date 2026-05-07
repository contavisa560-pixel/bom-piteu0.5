import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// ─── SVG Icons inline (sem emojis) ───────────────────────────────────────────
const Icons = {
  Leaf: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  ),
  Globe: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Heart: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Clock: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  User: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Coffee: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/>
      <line x1="10" y1="1" x2="10" y2="4"/>
      <line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
  ),
  Baby: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="7" r="4"/>
      <path d="M8.56 2.69A4 4 0 0 1 12 2a4 4 0 0 1 3.44 1.94"/>
      <path d="M2 21v-2a7 7 0 0 1 7-7h6a7 7 0 0 1 7 7v2"/>
    </svg>
  ),
  Flame: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  ),
  ShoppingCart: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  Star: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  TrendingUp: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  BookOpen: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  Smile: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  ),
  Award: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="8" r="7"/>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>
  ),
  ArrowRight: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
};

// ─── 15 Sugestões ─────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  {
    id: 'vegetarian',
    category: 'Dieta',
    title: 'Alimentação plant-based',
    desc: 'Descobre receitas vegetarianas e veganas criadas a pensar em ti. O teu chef pessoal adapta-se ao teu estilo de vida.',
    icon: 'Leaf',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=420&q=80&auto=format&fit=crop',
    btnLabel: 'Falar com o Chef',
    type: 'chat',
    chatTitle: 'Olá! Sou vegetariano, podes sugerir-me receitas plant-based deliciosas e nutritivas para esta semana?',
    chatContext: 'vegetariano',
    palette: { bg: '#f0fdf4', accent: '#166534', tag: '#bbf7d0', tagText: '#14532d', bar: '#22c55e', btn: '#166534' },
    darkPalette: { bg: '#052e16', accent: '#4ade80', tag: '#14532d', tagText: '#86efac', bar: '#22c55e', btn: '#166534' },
  },
  {
    id: 'gastronomicJourney',
    category: 'Explorar',
    title: 'Viagem gastronómica',
    desc: 'De Tóquio a Lisboa, do México à Índia. Explora sabores autênticos de todo o mundo sem sair de casa.',
    icon: 'Globe',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=420&q=80&auto=format&fit=crop',
    btnLabel: 'Explorar o Mundo',
    type: 'navigate',
    route: 'internationalRecipes',
    palette: { bg: '#eff6ff', accent: '#1e3a8a', tag: '#bfdbfe', tagText: '#1e3a8a', bar: '#3b82f6', btn: '#1d4ed8' },
    darkPalette: { bg: '#0c1a3a', accent: '#93c5fd', tag: '#1e3a8a', tagText: '#bfdbfe', bar: '#3b82f6', btn: '#1d4ed8' },
  },
  {
    id: 'healthCorner',
    category: 'Saúde',
    title: 'Cuida do teu corpo',
    desc: 'Receitas equilibradas, contagem de calorias e acompanhamento nutricional. O bem-estar começa na cozinha.',
    icon: 'Heart',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=420&q=80&auto=format&fit=crop',
    btnLabel: 'Abrir Saúde',
    type: 'navigate',
    route: 'meuCantoDeSaude',
    palette: { bg: '#fff1f2', accent: '#9f1239', tag: '#fecdd3', tagText: '#9f1239', bar: '#f43f5e', btn: '#be123c' },
    darkPalette: { bg: '#3b0a17', accent: '#fb7185', tag: '#9f1239', tagText: '#fecdd3', bar: '#f43f5e', btn: '#be123c' },
  },
  {
    id: 'quickRecipes',
    category: 'Praticidade',
    title: 'Pronto em 20 minutos',
    desc: 'Refeições completas e saborosas para os dias mais agitados. Sem complicações, com muito sabor.',
    icon: 'Clock',
    image: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=420&q=80&auto=format&fit=crop',
    btnLabel: 'Ver Receitas Rápidas',
    type: 'chat',
    chatTitle: 'Estou com pouco tempo! Que receitas rápidas e saborosas me recomendas para fazer em menos de 20 minutos?',
    chatContext: 'receitas_rapidas',
    palette: { bg: '#fff7ed', accent: '#7c2d12', tag: '#fed7aa', tagText: '#7c2d12', bar: '#f97316', btn: '#c2410c' },
    darkPalette: { bg: '#2c1200', accent: '#fb923c', tag: '#7c2d12', tagText: '#fed7aa', bar: '#f97316', btn: '#c2410c' },
  },
  {
    id: 'profile',
    category: 'Personalização',
    title: 'O teu perfil culinário',
    desc: 'Diz-nos o que gostas, o que evitas e os teus objetivos. Recebes sugestões feitas só para ti.',
    icon: 'User',
    image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=420&q=80&auto=format&fit=crop',
    btnLabel: 'Completar Perfil',
    type: 'navigate',
    route: 'userProfile',
    routeOptions: { initialTab: 'alimentacao' },
    palette: { bg: '#faf5ff', accent: '#4c1d95', tag: '#e9d5ff', tagText: '#4c1d95', bar: '#8b5cf6', btn: '#6d28d9' },
    darkPalette: { bg: '#1a0a3b', accent: '#c4b5fd', tag: '#4c1d95', tagText: '#e9d5ff', bar: '#8b5cf6', btn: '#6d28d9' },
  },
  {
    id: 'cocktails',
    category: 'Bebidas',
    title: 'Arte em cada copo',
    desc: 'Cocktails clássicos, tropicais e opções sem álcool. Torna cada ocasião memorável com as tuas criações.',
    icon: 'Coffee',
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=420&q=80&auto=format&fit=crop',
    btnLabel: 'Ver Cocktails',
    type: 'chat',
    chatTitle: 'Quero impressionar os meus convidados este fim de semana! Podes ensinar-me a fazer cocktails especiais?',
    chatContext: 'cocktails',
    palette: { bg: '#f0fdfa', accent: '#134e4a', tag: '#99f6e4', tagText: '#134e4a', bar: '#14b8a6', btn: '#0f766e' },
    darkPalette: { bg: '#021a18', accent: '#2dd4bf', tag: '#134e4a', tagText: '#99f6e4', bar: '#14b8a6', btn: '#0f766e' },
  },
  {
    id: 'infant',
    category: 'Família',
    title: 'Alimentação infantil',
    desc: 'Receitas nutritivas e deliciosas para os mais pequenos. Introdução alimentar, papas e refeições para crianças.',
    icon: 'Baby',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=420&q=80&auto=format&fit=crop',
    btnLabel: 'Receitas Infantis',
    type: 'navigate',
    route: 'alimentacaoInfantil',
    palette: { bg: '#fefce8', accent: '#713f12', tag: '#fef08a', tagText: '#713f12', bar: '#eab308', btn: '#a16207' },
    darkPalette: { bg: '#1f1400', accent: '#facc15', tag: '#713f12', tagText: '#fef08a', bar: '#eab308', btn: '#a16207' },
  },
  {
    id: 'seasonal',
    category: 'Sazonal',
    title: 'Ingredientes da estação',
    desc: 'Pratos com os melhores ingredientes de cada época do ano. Mais sabor, mais nutrição, mais economia.',
    icon: 'Flame',
    image: 'https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=420&q=80&auto=format&fit=crop',
    btnLabel: 'Ver Pratos Sazonais',
    type: 'chat',
    chatTitle: 'Que receitas devo fazer com ingredientes sazonais desta época do ano?',
    palette: { bg: '#fff8f1', accent: '#92400e', tag: '#fcd9a0', tagText: '#92400e', bar: '#f59e0b', btn: '#b45309' },
    darkPalette: { bg: '#271500', accent: '#fbbf24', tag: '#92400e', tagText: '#fcd9a0', bar: '#f59e0b', btn: '#b45309' },
  },
  {
    id: 'marketplace',
    category: 'Compras',
    title: 'Mercado de ingredientes',
    desc: 'Encontra ingredientes frescos e especiais perto de ti. Lista de compras inteligente gerada pelo teu chef.',
    icon: 'ShoppingCart',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=420&q=80&auto=format&fit=crop',
    btnLabel: 'Ir ao Mercado',
    type: 'navigate',
    route: 'marketplace',
    palette: { bg: '#f0f9ff', accent: '#0c4a6e', tag: '#bae6fd', tagText: '#0c4a6e', bar: '#0ea5e9', btn: '#0369a1' },
    darkPalette: { bg: '#021828', accent: '#38bdf8', tag: '#0c4a6e', tagText: '#bae6fd', bar: '#0ea5e9', btn: '#0369a1' },
  },
  {
    id: 'topRated',
    category: 'Em Destaque',
    title: 'Receitas mais apreciadas',
    desc: 'As receitas favoritas da nossa comunidade. Classificadas, testadas e aprovadas por quem cozinha todos os dias.',
    icon: 'Star',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=420&q=80&auto=format&fit=crop',
    btnLabel: 'Ver Destaques',
    type: 'chat',
    chatTitle: 'Quais são as receitas mais populares e bem avaliadas da plataforma? Quero experimentar algo novo!',
    palette: { bg: '#fdfaff', accent: '#3b0764', tag: '#e9d5ff', tagText: '#3b0764', bar: '#a855f7', btn: '#7e22ce' },
    darkPalette: { bg: '#150828', accent: '#d8b4fe', tag: '#3b0764', tagText: '#e9d5ff', bar: '#a855f7', btn: '#7e22ce' },
  },
  {
    id: 'budget',
    category: 'Económico',
    title: 'Comer bem, gastar pouco',
    desc: 'Refeições completas com orçamento reduzido. Descobre como tirar o máximo de cada ingrediente.',
    icon: 'TrendingUp',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=420&q=80&auto=format&fit=crop',
    btnLabel: 'Receitas Económicas',
    type: 'chat',
    chatTitle: 'Estou com o orçamento apertado este mês. Que receitas saborosas e completas me recomendas sem gastar muito?',
    palette: { bg: '#f7fee7', accent: '#1a2e05', tag: '#d9f99d', tagText: '#1a2e05', bar: '#84cc16', btn: '#3f6212' },
    darkPalette: { bg: '#0d1f00', accent: '#a3e635', tag: '#1a2e05', tagText: '#d9f99d', bar: '#84cc16', btn: '#3f6212' },
  },
  {
    id: 'learn',
    category: 'Aprender',
    title: 'Técnicas de cozinha',
    desc: 'Aprende a saltear, emulsionar, confitar e muito mais. Eleva as tuas competências culinárias ao próximo nível.',
    icon: 'BookOpen',
    image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=420&q=80&auto=format&fit=crop',
    btnLabel: 'Aprender Técnicas',
    type: 'chat',
    chatTitle: 'Quero melhorar as minhas técnicas na cozinha! Por onde devo começar para cozinhar como um profissional?',
    palette: { bg: '#fff0f0', accent: '#7f1d1d', tag: '#fecaca', tagText: '#7f1d1d', bar: '#ef4444', btn: '#b91c1c' },
    darkPalette: { bg: '#2a0a0a', accent: '#f87171', tag: '#7f1d1d', tagText: '#fecaca', bar: '#ef4444', btn: '#b91c1c' },
  },
  {
    id: 'mood',
    category: 'Humor',
    title: 'Cozinha para o teu estado de espírito',
    desc: 'Stressado? Feliz? A celebrar? Há uma receita para cada momento. Deixa o chef perceber como te sentes.',
    icon: 'Smile',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=420&q=80&auto=format&fit=crop',
    btnLabel: 'Como me sinto hoje',
    type: 'chat',
    chatTitle: 'Hoje estou a precisar de algo especial na cozinha... Podes sugerir-me uma receita de acordo com o meu humor?',
    palette: { bg: '#fff8f0', accent: '#7c2d12', tag: '#fdba74', tagText: '#7c2d12', bar: '#fb923c', btn: '#ea580c' },
    darkPalette: { bg: '#271200', accent: '#fb923c', tag: '#7c2d12', tagText: '#fdba74', bar: '#fb923c', btn: '#ea580c' },
  },
  {
    id: 'notes',
    category: 'Pessoal',
    title: 'As tuas notas culinárias',
    desc: 'Guarda as tuas receitas favoritas, ajustes e segredos da cozinha num só lugar. O teu caderno digital.',
    icon: 'Award',
    image: 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=420&q=80&auto=format&fit=crop',
    btnLabel: 'Ver Notas',
    type: 'navigate',
    route: 'observacoesPessoais',
    palette: { bg: '#f0f4ff', accent: '#1e1b4b', tag: '#c7d2fe', tagText: '#1e1b4b', bar: '#6366f1', btn: '#4338ca' },
    darkPalette: { bg: '#0d0b2a', accent: '#a5b4fc', tag: '#1e1b4b', tagText: '#c7d2fe', bar: '#6366f1', btn: '#4338ca' },
  },
  {
    id: 'senior',
    category: 'Família',
    title: 'Alimentação sénior',
    desc: 'Receitas adaptadas para seniores — nutritivas, de fácil digestão e preparadas com todo o carinho.',
    icon: 'Smile',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=420&q=80&auto=format&fit=crop',
    btnLabel: 'Receitas Sénior',
    type: 'navigate',
    route: 'alimentacaoSenior',
    palette: { bg: '#fdf4ff', accent: '#581c87', tag: '#f3e8ff', tagText: '#581c87', bar: '#c084fc', btn: '#7e22ce' },
    darkPalette: { bg: '#1a0828', accent: '#e879f9', tag: '#581c87', tagText: '#f3e8ff', bar: '#c084fc', btn: '#7e22ce' },
  },
];

const INTERVAL_MS = 4500;
const TICK_MS = 40;

// ─── Hook para detectar dark mode ────────────────────────────────────────────
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
};

// ─── Componente ───────────────────────────────────────────────────────────────
const SmartSuggestionCarousel = ({ onStartChat, onNavigate, user }) => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [imgErrors, setImgErrors] = useState({});
  const isDark = useDarkMode();

  // Refs para evitar stale closures no interval
  const pausedRef = useRef(false);
  const progressRef = useRef(0);
  const timerRef = useRef(null);
  const total = SUGGESTIONS.length;

  // ─── Auto-play — interval único, nunca recriado ───────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (pausedRef.current) return;
      progressRef.current += (TICK_MS / INTERVAL_MS) * 100;
      if (progressRef.current >= 100) {
        progressRef.current = 0;
        setProgress(0);
        setCurrent(c => (c + 1) % total);
      } else {
        setProgress(progressRef.current);
      }
    }, TICK_MS);
    return () => clearInterval(timerRef.current);
  }, [total]);

  const goTo = useCallback((idx) => {
    progressRef.current = 0;
    setProgress(0);
    setCurrent(((idx % total) + total) % total);
  }, [total]);

  const handleAction = useCallback((card) => {
    if (card.type === 'chat') {
      onStartChat({
        title: card.chatTitle,
        query: card.chatTitle,
        chatContext: card.chatContext || null,
      });
    } else {
      onNavigate(card.route, card.routeOptions);
    }
  }, [onStartChat, onNavigate]);

  const card = SUGGESTIONS[current];
  const IconComp = Icons[card.icon] || Icons.Star;

  // Selecciona a paleta correcta consoante o tema
  const palette = isDark && card.darkPalette ? card.darkPalette : card.palette;

  // Borda adaptada ao tema
  const cardBorder = isDark
    ? '1px solid rgba(255,255,255,0.08)'
    : '1px solid rgba(0,0,0,0.06)';

  // Barra de fundo do progresso adaptada
  const progressTrackBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <div className="space-y-2">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-none">
            {t('dashboard.smartSuggestions.title', 'Minhas Sugestões')}
          </h2>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => goTo(current - 1)}
            onMouseEnter={() => { pausedRef.current = true; }}
            onMouseLeave={() => { pausedRef.current = false; }}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
          </button>
          <button
            onClick={() => goTo(current + 1)}
            onMouseEnter={() => { pausedRef.current = true; }}
            onMouseLeave={() => { pausedRef.current = false; }}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Próximo"
          >
            <ChevronRight className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* ── Card ── */}
      <div
        className="relative overflow-hidden rounded-2xl"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
        onTouchStart={() => { pausedRef.current = true; }}
        onTouchEnd={() => { pausedRef.current = false; }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col sm:flex-row rounded-2xl overflow-hidden"
            style={{
              background: palette.bg,
              border: cardBorder,
            }}
          >
            {/* Imagem mobile — banda horizontal no topo */}
            <div className="block sm:hidden relative h-24 w-full shrink-0 overflow-hidden">
              {!imgErrors[card.id] ? (
                <img
                  src={card.image}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  onError={() => setImgErrors(p => ({ ...p, [card.id]: true }))}
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: palette.tag }}>
                  <IconComp className="w-8 h-8" style={{ color: palette.accent }} />
                </div>
              )}
              {/* fade para baixo */}
              <div className="absolute bottom-0 left-0 right-0 h-8"
                style={{ background: `linear-gradient(to bottom, transparent, ${palette.bg})` }} />
            </div>

            {/* Imagem desktop — coluna lateral */}
            <div className="hidden sm:block relative w-40 shrink-0 overflow-hidden">
              {!imgErrors[card.id] ? (
                <img
                  src={card.image}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => setImgErrors(p => ({ ...p, [card.id]: true }))}
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: palette.tag }}>
                  <IconComp className="w-10 h-10" style={{ color: palette.accent }} />
                </div>
              )}
              <div className="absolute inset-y-0 right-0 w-10"
                style={{ background: `linear-gradient(to right, transparent, ${palette.bg})` }} />
            </div>

            {/* Conteúdo */}
            <div className="flex-1 p-3.5 sm:p-5 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full"
                  style={{ background: palette.tag, color: palette.tagText }}
                >
                  <IconComp className="w-2.5 h-2.5 sm:w-3 sm:h-3" style={{ color: palette.tagText }} />
                  {card.category}
                </span>
              </div>

              <h3
                className="text-sm sm:text-base font-bold leading-snug mb-1"
                style={{ color: palette.accent }}
              >
                {card.title}
              </h3>

              <p className="text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 text-gray-500 dark:text-gray-400 line-clamp-2">
                {card.desc}
              </p>

              <button
                onClick={() => handleAction(card)}
                className="group inline-flex items-center gap-1.5 text-[12px] sm:text-[13px] font-semibold text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all active:scale-95 hover:opacity-90"
                style={{ background: palette.btn }}
              >
                {card.btnLabel}
                <Icons.ArrowRight
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Barra de progresso */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: progressTrackBg }}
        >
          <div
            className="h-full"
            style={{ width: `${progress}%`, background: palette.bar }}
          />
        </div>
      </div>

      {/* ── Dots ── */}
      <div className="flex justify-center items-center gap-1 pt-0.5">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className="h-1 rounded-full border-none focus:outline-none transition-all duration-300"
            style={{
              width: i === current ? '18px' : '5px',
              background: i === current ? palette.bar : (isDark ? '#4b5563' : '#d1d5db'),
              opacity: i === current ? 1 : 0.45,
            }}
            aria-label={`Sugestão ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default SmartSuggestionCarousel;