import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UtensilsCrossed, Clock, ChefHat, X, ArrowRight, ArrowLeft,
  Flame, Wine, Beer, Coffee, Droplets, Search, SlidersHorizontal,
  Leaf
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSpecialRecipes } from '@/hooks/useSpecialRecipes';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80';

// ─── Derivar estilo da bebida ─────────────────────────────────────────────────
function getDrinkStyle(bebida) {
  if (!bebida) return { color: 'from-gray-400 to-gray-500', bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', textColor: 'text-gray-600 dark:text-gray-300', Icon: Droplets };
  const b = bebida.toLowerCase();
  if (b.includes('vinho tinto'))   return { color: 'from-purple-500 to-red-500',   bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', textColor: 'text-purple-700 dark:text-purple-300', Icon: Wine };
  if (b.includes('vinho'))         return { color: 'from-yellow-400 to-amber-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', textColor: 'text-yellow-700 dark:text-yellow-300', Icon: Wine };
  if (b.includes('cerveja'))       return { color: 'from-amber-400 to-orange-400', bg: 'bg-amber-50 dark:bg-amber-900/20',  border: 'border-amber-200 dark:border-amber-800',  textColor: 'text-amber-700 dark:text-amber-300',  Icon: Beer };
  if (b.includes('sake'))          return { color: 'from-pink-400 to-rose-400',    bg: 'bg-pink-50 dark:bg-pink-900/20',    border: 'border-pink-200 dark:border-pink-800',    textColor: 'text-pink-700 dark:text-pink-300',    Icon: Wine };
  if (b.includes('café') || b.includes('chá') || b.includes('cha')) return { color: 'from-amber-700 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', textColor: 'text-amber-800 dark:text-amber-300', Icon: Coffee };
  if (b.includes('whisky') || b.includes('margarita') || b.includes('cocktail')) return { color: 'from-cyan-400 to-teal-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800', textColor: 'text-cyan-700 dark:text-cyan-300', Icon: Wine };
  if (b.includes('sem bebida') || b.includes('sem ')) return { color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', textColor: 'text-emerald-700 dark:text-emerald-300', Icon: Leaf };
  return { color: 'from-gray-400 to-gray-500', bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', textColor: 'text-gray-600 dark:text-gray-300', Icon: Droplets };
}

const ALL_DIFFS = ['Todos', 'Fácil', 'Médio', 'Difícil'];

// ─── DiffBadge ────────────────────────────────────────────────────────────────
const DiffBadge = ({ level }) => {
  const { t } = useTranslation();
  const levelKey = { 'Fácil': 'easy', 'Médio': 'medium', 'Difícil': 'hard' }[level] || 'easy';
  const map = {
    'Fácil': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    'Médio': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    'Difícil': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${map[level] || map['Fácil']}`}>
      {t(`difficulty.${levelKey}`)}
    </span>
  );
};

// ─── Modal de detalhe ─────────────────────────────────────────────────────────
const PetiscoModal = ({ petisco, onClose, onCook }) => {
  const { t } = useTranslation();
  if (!petisco) return null;
  const drink = getDrinkStyle(petisco.bebida_sugerida);
  const DrinkIcon = drink.Icon;

  return (
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
            src={petisco.imagem_url || FALLBACK_IMAGE}
            alt={petisco.nome}
            className="w-full h-full object-cover"
            onError={e => { e.target.src = FALLBACK_IMAGE; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-1.5">
              {petisco.bebida_sugerida && (
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${drink.color} text-white shadow-sm`}>
                  <DrinkIcon className="h-3 w-3" />{petisco.bebida_sugerida}
                </span>
              )}
              <DiffBadge level={petisco.dificuldade} />
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">{petisco.nome}</h2>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
              <Clock className="h-4 w-4" />
              <span>{petisco.tempo}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
              <Flame className="h-4 w-4 text-orange-400" />
              <span>{t(`difficulty.${petisco.dificuldade === 'Fácil' ? 'easy' : petisco.dificuldade === 'Médio' ? 'medium' : 'hard'}`)}</span>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">{petisco.pais}</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">{petisco.descricao}</p>
          {petisco.bebida_sugerida && (
            <div className={`flex items-center gap-3 ${drink.bg} border ${drink.border} rounded-xl px-4 py-3 mb-5`}>
              <DrinkIcon className={`h-5 w-5 ${drink.textColor} shrink-0`} />
              <div>
                <p className={`text-xs font-bold ${drink.textColor}`}>{t('petiscos.recommendedPairing')}</p>
                <p className={`text-sm font-semibold ${drink.textColor}`}>{petisco.bebida_sugerida}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => { onCook(petisco); onClose(); }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg text-sm"
          >
            <ChefHat className="h-5 w-5" />
            {t('petiscos.prepare')}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Página completa ──────────────────────────────────────────────────────────
const PetiscosPage = ({ onStartChat, onNavigate }) => {
  const { t } = useTranslation();
  const { data: PETISCOS_DB } = useSpecialRecipes('petisco');

  const ALL_CATEGORIES = useMemo(
    () => ['Todos', ...Array.from(new Set(PETISCOS_DB.map(p => p.categoria))).sort()],
    [PETISCOS_DB]
  );
  const ALL_COUNTRIES = useMemo(
    () => ['Todos', ...Array.from(new Set(PETISCOS_DB.map(p => p.pais))).sort()],
    [PETISCOS_DB]
  )
    const ALL_DRINKS = useMemo(
    () => ['Todos', ...Array.from(new Set(
      PETISCOS_DB.map(p => p.bebida_sugerida).filter(Boolean)
    )).sort()],
    [PETISCOS_DB]
  );

  const categoryTranslations = {
    'Fritos': t('petiscos.filters.categories.fried'),
    'Grelhados': t('petiscos.filters.categories.grilled'),
    'Frios': t('petiscos.filters.categories.cold'),
    'Assados': t('petiscos.filters.categories.baked'),
    'Tostas': t('petiscos.filters.categories.toasts'),
    'Guisados': t('petiscos.filters.categories.stews'),
    'Snacks': t('petiscos.filters.categories.snacks'),
    'Cozinhados': t('petiscos.filters.categories.cooked'),
    'Partilha': t('petiscos.filters.categories.sharing'),
    'Festivo': t('petiscos.filters.categories.festive'),
  };

  const [search, setSearch] = useState('');
  const [catFilter, setCat] = useState('Todos');
  const [countryFilter, setCountry] = useState('Todos');
  const [diffFilter, setDiff] = useState('Todos');
  const [drinkFilter, setDrink] = useState('Todos');
  const [selected, setSelected] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return PETISCOS_DB.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        p.nome.toLowerCase().includes(q) ||
        p.pais.toLowerCase().includes(q) ||
        (p.tags || []).some(tag => tag.toLowerCase().includes(q));
      const matchCat = catFilter === 'Todos' || p.categoria === catFilter;
      const matchCountry = countryFilter === 'Todos' || p.pais === countryFilter;
      const matchDiff = diffFilter === 'Todos' || p.dificuldade === diffFilter;
      const matchDrink = drinkFilter === 'Todos' || p.bebida_sugerida === drinkFilter;
      return matchSearch && matchCat && matchCountry && matchDiff && matchDrink;
    });
  }, [search, catFilter, countryFilter, diffFilter , drinkFilter, PETISCOS_DB]);

  const handleCook = (p) => {
    onStartChat({
      title: p.nome,
      source: 'receita_internacional_direta',
      nomeReceita: p.nome,
      pais: p.pais || 'Internacional',
      query: null
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-6 rounded-2xl mb-6">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.backToDashboard')}
        </button>
        <div className="flex items-center gap-3 mb-1">
          <UtensilsCrossed className="h-7 w-7" />
          <h1 className="text-2xl font-bold">{t('petiscos.pageTitle')}</h1>
        </div>
        <p className="text-white/80 text-sm">{t('petiscos.pageSubtitle', { count: PETISCOS_DB.length })}</p>
      </div>

      {/* Barra de pesquisa */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('petiscos.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${showFilters
            ? 'bg-orange-500 text-white border-orange-500'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t('petiscos.filtersButton')}
        </button>
      </div>

      {/* Filtros */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
              {/* Categoria */}
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  {t('petiscos.category')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCat(cat)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${catFilter === cat
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {cat === 'Todos' ? t('petiscos.filters.all') : (categoryTranslations[cat] || cat)}
                    </button>
                  ))}
                </div>
              </div>

              {/* País */}
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  {t('petiscos.country')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_COUNTRIES.map(country => (
                    <button
                      key={country}
                      onClick={() => setCountry(country)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${countryFilter === country
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {country === 'Todos' ? t('petiscos.filters.all') : country}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dificuldade */}
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  {t('petiscos.difficulty')}
                </p>
                <div className="flex gap-1.5">
                  {ALL_DIFFS.map(diff => (
                    <button
                      key={diff}
                      onClick={() => setDiff(diff)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${diffFilter === diff
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {diff === 'Todos' ? t('petiscos.filters.all') : t(`difficulty.${diff === 'Fácil' ? 'easy' : diff === 'Médio' ? 'medium' : 'hard'}`)}
                    </button>
                  ))}
                </div>
              </div>
                      {/* Bebida */}
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Bebida
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_DRINKS.map(drink => (
                    <button
                      key={drink}
                      onClick={() => setDrink(drink)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                        drinkFilter === drink
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {drink === 'Todos' ? 'Todos' : drink}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contagem */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {filtered.length === PETISCOS_DB.length
          ? t('petiscos.showingAll', { count: filtered.length })
          : t('petiscos.showingFiltered', { filtered: filtered.length, total: PETISCOS_DB.length })}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <UtensilsCrossed className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">{t('petiscos.noResults')}</p>
          <p className="text-sm mt-1">{t('petiscos.tryAnother')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((petisco, i) => {
            const drink = getDrinkStyle(petisco.bebida_sugerida);
            const DrinkIcon = drink.Icon;
            return (
              <motion.div
                key={petisco._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                whileHover={{ y: -3 }}
                onClick={() => setSelected(petisco)}
                className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="relative h-40 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={petisco.imagem_url || FALLBACK_IMAGE}
                    alt={petisco.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  {petisco.bebida_sugerida && (
                    <span className={`absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${drink.color} text-white`}>
                      <DrinkIcon className="h-2.5 w-2.5" />{petisco.bebida_sugerida}
                    </span>
                  )}
                  <span className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />{petisco.tempo}
                  </span>
                </div>
                <div className="p-3">
                  <p className="font-bold text-gray-900 dark:text-white text-sm leading-snug mb-1 line-clamp-1 group-hover:text-orange-500 transition-colors">
                    {petisco.nome}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">{petisco.pais}</p>
                  <div className="flex items-center justify-between">
                    <DiffBadge level={petisco.dificuldade} />
                    <ArrowRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 group-hover:text-orange-500 transition-colors" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selected && <PetiscoModal petisco={selected} onClose={() => setSelected(null)} onCook={handleCook} />}
      </AnimatePresence>
    </div>
  );
};

export default PetiscosPage;