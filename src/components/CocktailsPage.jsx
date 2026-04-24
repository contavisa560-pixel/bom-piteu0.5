import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wine, Clock, ChefHat, X, ArrowRight, Leaf, GlassWater,
  Search, SlidersHorizontal, ArrowLeft
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSpecialRecipes } from '@/hooks/useSpecialRecipes';

// ─── Imagens por receita ──────────────────────────────────────────────────────
const COCKTAIL_IMAGES = {
  "Mojito Clássico": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80",
  "Caipirinha Brasileira": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80",
  "Margarita": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80",
  "Limonada Suíça": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=600&q=80",
  "Cocktail de Manga e Maracujá": "https://images.unsplash.com/photo-1587888637140-849b5abb8d3c?w=600&q=80",
  "Gin Tónico com Pepino": "https://images.unsplash.com/photo-1542838775-a8994c2e5782?w=600&q=80",
  "Sangria de Frutos Vermelhos": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80",
  "Negroni": "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=600&q=80",
  "Old Fashioned": "https://images.unsplash.com/photo-1527761939622-933c45e3aaeb?w=600&q=80",
  "Aperol Spritz": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80",
  "Moscow Mule": "https://images.unsplash.com/photo-1609951651556-5334e2706168?w=600&q=80",
  "Espresso Martini": "https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=600&q=80",
  "Whisky Sour": "https://images.unsplash.com/photo-1527761939622-933c45e3aaeb?w=600&q=80",
  "Tequila Sunrise": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80",
  "Sangria Branca": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80",
  "Virgin Mojito": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=600&q=80",
  "Mango Lassi": "https://images.unsplash.com/photo-1587888637140-849b5abb8d3c?w=600&q=80",
  "Iced Matcha Latte": "https://images.unsplash.com/photo-1587888637140-849b5abb8d3c?w=600&q=80",
};
const FALLBACK = "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80";
const getImg = (nome) => COCKTAIL_IMAGES[nome] || FALLBACK;

// ─── Estilos por perfil ───────────────────────────────────────────────────────
const PROFILE_STYLE = {
  "Com Álcool": { color: "from-purple-500 to-indigo-500", text: "text-purple-700 dark:text-purple-300", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-800", icon: Wine },
  "Sem Álcool": { color: "from-emerald-400 to-teal-500", text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800", icon: Leaf },
  "Vegano": { color: "from-green-400 to-lime-400", text: "text-green-700 dark:text-green-300", bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800", icon: Leaf },
};
const getStyle = (perfil) => {
  if (!perfil) return PROFILE_STYLE["Com Álcool"];
  const key = Object.keys(PROFILE_STYLE).find(k => perfil.includes(k));
  return PROFILE_STYLE[key] || PROFILE_STYLE["Com Álcool"];
};


// ─── Modal ────────────────────────────────────────────────────────────────────
const CocktailModal = ({ cocktail, onClose, onMake }) => {
  const { t } = useTranslation();
  if (!cocktail) return null;
  const img = cocktail.imagem_url || getImg(cocktail.nome);
  const style = getStyle(cocktail.perfil_alimentar);
  const Icon = style.icon;

  const steps = cocktail.passo_passo
    .split(/\d+\.\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="bg-white dark:bg-gray-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Hero */}
        <div className="relative h-52 overflow-hidden shrink-0">
          <img src={img} alt={cocktail.nome} className="w-full h-full object-cover"
            onError={e => { e.target.src = FALLBACK; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <button onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${style.color} text-white shadow-sm`}>
                <Icon className="h-3 w-3" />
                {cocktail.perfil_alimentar?.split(',')[0]}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                {cocktail.pais}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">{cocktail.nome}</h2>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-5 overflow-y-auto flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
              <Clock className="h-4 w-4" /><span>{cocktail.tempo}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
              <GlassWater className="h-4 w-4 text-cyan-400" /><span>{cocktail.categoria}</span>
            </div>
          </div>

          {/* Ingredientes */}
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{t('cocktails.ingredients')}</p>
            <div className="flex flex-wrap gap-1.5">
              {cocktail.ingredientes.split(',').map((ing, i) => (
                <span key={i} className="text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full font-medium">
                  {ing.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Passos */}
          <div className="mb-5">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">{t('cocktails.preparation')}</p>
            <div className="space-y-2.5">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Perfil alimentar */}
          <div className={`flex items-center gap-3 ${style.bg} border ${style.border} rounded-xl px-4 py-3 mb-5`}>
            <Icon className={`h-5 w-5 ${style.text} shrink-0`} />
            <div>
              <p className={`text-xs font-bold ${style.text}`}>{t('cocktails.profile')}</p>
              <p className={`text-sm font-semibold ${style.text}`}>{cocktail.perfil_alimentar}</p>
            </div>
          </div>

          <button
            onClick={() => { onMake(cocktail); onClose(); }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg text-sm"
          >
            <ChefHat className="h-5 w-5" />
            {t('cocktails.prepare')}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────────
const CocktailsPage = ({ onStartChat, onNavigate }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [catFilter, setCat] = useState('Todos');
  const [profileFilter, setProf] = useState('Todos');
  const [selected, setSelected] = useState(null);
  const [showFilters, setShowF] = useState(false);
const { data: cocktails = [] } = useSpecialRecipes('cocktail');
const ALL_CATS = useMemo(() => ['Todos', ...Array.from(new Set((cocktails || []).map(c => c.categoria))).sort()], [cocktails]);
const ALL_PROFILES = ['Todos', 'Com Álcool', 'Sem Álcool'];
  // Objetos de tradução para categorias e perfis
  const categoryTranslations = useMemo(() => {
    const uniqueCats = Array.from(new Set((cocktails || []).map(c => c.categoria)));
    const translations = {};
    uniqueCats.forEach(cat => {
      // Converte a categoria para uma chave amigável (ex: "Clássicos" -> "classic")
      const key = cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '_');
      translations[cat] = t(`cocktails.categories.${key}`, { defaultValue: cat });
    });
    return translations;
  }, [t]);

  const profileTranslations = {
    'Com Álcool': t('cocktails.profiles.alcoholic'),
    'Sem Álcool': t('cocktails.profiles.nonAlcoholic'),
  };

  const filtered = useMemo(() => {
    return cocktails.filter(c => {
        const matchSearch = !search || c.nome.toLowerCase().includes(search.toLowerCase()) ||
        c.pais.toLowerCase().includes(search.toLowerCase()) ||
        (c.ingredientes || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === 'Todos' || c.categoria === catFilter;
      const matchProfile = profileFilter === 'Todos' || (c.perfil_alimentar || '').includes(profileFilter);
      return matchSearch && matchCat && matchProfile;
    });
  }, [search, catFilter, profileFilter , cocktails]);

  const handleMake = (cocktail) => {
    onStartChat({
      title: cocktail.nome,
      source: 'receita_internacional_direta',
      nomeReceita: cocktail.nome,
      pais: cocktail.pais || 'Internacional',
      query: null
    });
  };

  const hasActiveFilters = catFilter !== 'Todos' || profileFilter !== 'Todos';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-4 pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width: `${80 + i * 40}px`, height: `${80 + i * 40}px`, top: `${10 + i * 15}%`, left: `${i * 18}%`, opacity: 0.3 }} />
          ))}
        </div>
        <div className="relative max-w-2xl mx-auto">
          <button onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> {t('common.backToDashboard')}
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Wine className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t('cocktails.pageTitle')}</h1>
              <p className="text-white/70 text-sm">{t('cocktails.pageSubtitle', { count: cocktails.length })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filtros */}
      <div className="max-w-2xl mx-auto px-4 -mt-14 mb-6 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-3">
          {/* Barra de pesquisa */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-700/60 rounded-xl px-3 py-2.5">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder={t('cocktails.searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowF(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${showFilters || hasActiveFilters
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t('cocktails.filtersButton')}
            </button>
          </div>

          {/* Filtros expandíveis */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {/* Perfil alimentar */}
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('cocktails.profile')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_PROFILES.map(p => (
                      <button key={p}
                        onClick={() => setProf(p)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${profileFilter === p
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                      >
                        {p === 'Todos' ? t('cocktails.all') : profileTranslations[p]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categoria */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('cocktails.category')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_CATS.map(cat => (
                      <button key={cat}
                        onClick={() => setCat(cat)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${catFilter === cat
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                      >
                        {cat === 'Todos' ? t('cocktails.all') : categoryTranslations[cat]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Limpar filtros */}
                {hasActiveFilters && (
                  <button
                    onClick={() => { setCat('Todos'); setProf('Todos'); }}
                    className="mt-3 text-xs text-orange-500 font-semibold hover:underline"
                  >
                    {t('cocktails.clearFilters')}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Contador */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 ml-1">
          {t('cocktails.resultsCount', { count: filtered.length })}
          {search && ` ${t('cocktails.forSearch', { term: search })}`}
        </p>
      </div>

      {/* Grelha de cocktails */}
      <div className="max-w-2xl mx-auto px-4 pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <GlassWater className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">{t('cocktails.noResults')}</p>
            <button onClick={() => { setSearch(''); setCat('Todos'); setProf('Todos'); }}
              className="mt-2 text-sm text-orange-500 hover:underline">
              {t('cocktails.clearFilters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((cocktail, i) => {
              const img = cocktail.imagem_url || getImg(cocktail.nome);
              const style = getStyle(cocktail.perfil_alimentar);
              const Icon = style.icon;

              return (
                <motion.div
                  key={cocktail._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelected(cocktail)}
                  className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-gray-800 cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 hover:shadow-md"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-700">
                    <img src={img} alt={cocktail.nome}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={e => { e.target.src = FALLBACK; }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm leading-snug truncate group-hover:text-orange-500 transition-colors">
                      {cocktail.nome}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${style.color} text-white`}>
                        <Icon className="h-2.5 w-2.5" />
                        {cocktail.perfil_alimentar?.split(',')[0]}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">{cocktail.pais}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <Clock className="h-3 w-3" /> {cocktail.tempo}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">• {cocktail.categoria}</span>
                    </div>
                  </div>

                  {/* Seta */}
                  <div className="w-7 h-7 bg-gray-100 dark:bg-gray-600 group-hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors duration-200 shrink-0">
                    <ArrowRight className="h-3.5 w-3.5 text-gray-400 dark:text-gray-300 group-hover:text-white transition-colors" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <CocktailModal
            cocktail={selected}
            onClose={() => setSelected(null)}
            onMake={handleMake}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CocktailsPage;