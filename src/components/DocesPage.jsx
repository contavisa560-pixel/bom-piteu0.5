import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Cake, Clock, ChefHat, X, ArrowRight, Flame, Leaf, Star,
    Search, SlidersHorizontal, ArrowLeft
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSpecialRecipes } from '@/hooks/useSpecialRecipes';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DIFF_STYLE = {
    'Fácil': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    'Médio': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    'Difícil': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};
const DiffBadge = ({ level }) => {
    const { t } = useTranslation();
    const levelKey = {
        'Fácil': 'easy',
        'Médio': 'medium',
        'Difícil': 'hard'
    }[level] || 'easy';
    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DIFF_STYLE[level] || DIFF_STYLE['Fácil']}`}>
            {t(`difficulty.${levelKey}`)}
        </span>
    );
};

const ALL_DIFFS = ['Todas', 'Fácil', 'Médio', 'Difícil'];

// ─── Modal ────────────────────────────────────────────────────────────────────
const DoceModal = ({ doce, onClose, onCook }) => {
    const { t } = useTranslation();
    const categoryTranslations = {
        'Biscoito': t('doces.categories.biscuit'),
        'Bolo': t('doces.categories.cake'),
        'Bowl': t('doces.categories.bowl'),
        'Cheesecake': t('doces.categories.cheesecake'),
        'Creme': t('doces.categories.cream'),
        'Doce': t('doces.categories.sweet'),
        'Doce de Ovos': t('doces.categories.eggSweet'),
        'Frito': t('doces.categories.fried'),
        'Gelado': t('doces.categories.iceCream'),
        'Merengue': t('doces.categories.meringue'),
        'Mousse': t('doces.categories.mousse'),
        'Pastelaria': t('doces.categories.pastry'),
        'Pudim': t('doces.categories.pudding'),
        'Sobremesa': t('doces.categories.dessert'),
        'Tarte': t('doces.categories.tart'),
        'Todas': t('doces.all')
    };
    if (!doce) return null;
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
                className="bg-white dark:bg-gray-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative h-52 overflow-hidden">
                    <img src={doce.imagem_url} alt={doce.nome} className="w-full h-full object-cover"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80'; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <button onClick={onClose}
                        className="absolute top-4 right-4 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 mb-1.5">
                            <DiffBadge level={doce.dificuldade} />
                            {doce.vegano && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                                    <Leaf className="h-2.5 w-2.5" /> {t('doces.vegan')}
                                </span>
                            )}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                                {doce.pais}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-white leading-tight">{doce.nome}</h2>
                    </div>
                </div>

                <div className="p-5">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                            <Clock className="h-4 w-4" /><span>{doce.tempo}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                            <Flame className="h-4 w-4 text-orange-400" /><span>{t(`difficulty.${doce.dificuldade === 'Fácil' ? 'easy' : doce.dificuldade === 'Médio' ? 'medium' : 'hard'}`)}</span>
                        </div>
                        <span className="text-xs text-pink-500 font-semibold">{categoryTranslations[doce.categoria] || doce.categoria}</span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">{doce.descricao}</p>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                        {(doce.tags || []).map(tag => (
                            <span key={tag} className="text-[11px] bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-300 px-2.5 py-1 rounded-full font-medium border border-pink-100 dark:border-pink-800">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <button
                        onClick={() => { onCook(doce); onClose(); }}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 active:scale-95 shadow-md text-sm"
                    >
                        <ChefHat className="h-5 w-5" />
                        {t('doces.prepare')}
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ─── Página principal ─────────────────────────────────────────────────────────
const DocesPage = ({ onStartChat, onNavigate }) => {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [catFilter, setCat] = useState('Todas');
    const [diffFilter, setDiff] = useState('Todas');
    const [veganOnly, setVegan] = useState(false);
    const [selected, setSelected] = useState(null);
    const [showFilters, setShowF] = useState(false);

    const { data: DOCES_DB } = useSpecialRecipes('doce');

    const ALL_CATS = useMemo(
        () => ['Todas', ...Array.from(new Set(DOCES_DB.map(d => d.categoria))).sort()],
        [DOCES_DB]
    );

    const categoryTranslations = {
        'Biscoito': t('doces.categories.biscuit'),
        'Bolo': t('doces.categories.cake'),
        'Bowl': t('doces.categories.bowl'),
        'Cheesecake': t('doces.categories.cheesecake'),
        'Creme': t('doces.categories.cream'),
        'Doce': t('doces.categories.sweet'),
        'Doce de Ovos': t('doces.categories.eggSweet'),
        'Frito': t('doces.categories.fried'),
        'Gelado': t('doces.categories.iceCream'),
        'Merengue': t('doces.categories.meringue'),
        'Mousse': t('doces.categories.mousse'),
        'Pastelaria': t('doces.categories.pastry'),
        'Pudim': t('doces.categories.pudding'),
        'Sobremesa': t('doces.categories.dessert'),
        'Tarte': t('doces.categories.tart'),
        'Todas': t('doces.all')
    };

    const filtered = useMemo(() => {
        return DOCES_DB.filter(d => {
            const matchSearch = !search ||
                d.nome.toLowerCase().includes(search.toLowerCase()) ||
                d.pais.toLowerCase().includes(search.toLowerCase()) ||
                (d.tags || []).some(tag => tag.toLowerCase().includes(search.toLowerCase()));
            const matchCat = catFilter === 'Todas' || d.categoria === catFilter;
            const matchDiff = diffFilter === 'Todas' || d.dificuldade === diffFilter;
            const matchVegan = !veganOnly || d.vegano;
            return matchSearch && matchCat && matchDiff && matchVegan;
        });
    }, [search, catFilter, diffFilter, veganOnly, DOCES_DB]);

    const handleCook = (doce) => {
        onStartChat({
            title: doce.nome,
            source: 'receita_internacional_direta',
            nomeReceita: doce.nome,
            pais: doce.pais || 'Internacional',
            query: null
        });
    };

    const hasActiveFilters = catFilter !== 'Todas' || diffFilter !== 'Todas' || veganOnly;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-400 px-4 pt-12 pb-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="absolute rounded-full bg-white"
                            style={{ width: `${70 + i * 35}px`, height: `${70 + i * 35}px`, top: `${8 + i * 18}%`, left: `${i * 20}%`, opacity: 0.3 }} />
                    ))}
                </div>
                <div className="relative max-w-2xl mx-auto">
                    <button onClick={() => onNavigate('dashboard')}
                        className="flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> {t('common.backToDashboard')}
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Cake className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{t('doces.pageTitle')}</h1>
                            <p className="text-white/70 text-sm">{t('doces.recipesCount', { count: DOCES_DB.length })}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pesquisa + Filtros */}
            <div className="max-w-2xl mx-auto px-4 -mt-14 mb-6 relative z-10">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-3">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-700/60 rounded-xl px-3 py-2.5">
                            <Search className="h-4 w-4 text-gray-400 shrink-0" />
                            <input
                                type="text"
                                placeholder={t('doces.searchPlaceholder')}
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
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            {t('doces.filtersButton')}
                        </button>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                {/* Dificuldade */}
                                <div className="mb-3">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('doces.difficulty')}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {ALL_DIFFS.map(d => {
                                            const label = d === 'Todas' ? t('doces.all') : t(`difficulty.${d === 'Fácil' ? 'easy' : d === 'Médio' ? 'medium' : 'hard'}`);
                                            return (
                                                <button key={d} onClick={() => setDiff(d)}
                                                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${diffFilter === d
                                                        ? 'bg-pink-500 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                        }`}
                                                >{label}</button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Categoria */}
                                <div className="mb-3">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('doces.category')}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {ALL_CATS.map(c => (
                                            <button key={c} onClick={() => setCat(c)}
                                                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${catFilter === c
                                                    ? 'bg-rose-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                    }`}
                                            >{c === 'Todas' ? t('doces.all') : (categoryTranslations[c] || c)}</button>
                                        ))}
                                    </div>
                                </div>

                                {/* Vegan toggle */}
                                <div className="flex items-center gap-3 mb-2">
                                    <button
                                        onClick={() => setVegan(!veganOnly)}
                                        className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${veganOnly
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                            }`}
                                    >
                                        <Leaf className="h-3.5 w-3.5" /> {t('doces.veganOnly')}
                                    </button>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={() => { setCat('Todas'); setDiff('Todas'); setVegan(false); }}
                                            className="text-xs text-pink-500 font-semibold hover:underline"
                                        >
                                            {t('doces.clearFilters')}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 ml-1">
                    {t('doces.resultsCount', { count: filtered.length })}
                    {search && ` ${t('doces.forSearch', { term: search })}`}
                </p>
            </div>

            {/* Grelha */}
            <div className="max-w-2xl mx-auto px-4 pb-24">
                {filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Cake className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">{t('doces.noResults')}</p>
                        <button onClick={() => { setSearch(''); setCat('Todas'); setDiff('Todas'); setVegan(false); }}
                            className="mt-2 text-sm text-pink-500 hover:underline">
                            {t('doces.clearFilters')}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filtered.map((doce, i) => (
                            <motion.div
                                key={doce._id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.04, 0.4) }}
                                whileHover={{ scale: 1.01 }}
                                onClick={() => setSelected(doce)}
                                className="group flex items-center gap-3 p-3 rounded-xl cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 hover:shadow-md"
                            >
                                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-pink-50 dark:bg-pink-900/20">
                                    <img src={doce.imagem_url} alt={doce.nome}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        onError={e => { e.target.style.display = 'none'; }} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 dark:text-white text-sm leading-snug truncate group-hover:text-pink-500 transition-colors">
                                        {doce.nome}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                        <DiffBadge level={doce.dificuldade} />
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">{doce.pais}</span>
                                        {doce.vegano && <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5"><Leaf className="h-2.5 w-2.5" />{t('doces.vegan')}</span>}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                            <Clock className="h-3 w-3" /> {doce.tempo}
                                        </span>
                                        <span className="text-[10px] text-pink-400 dark:text-pink-500">• {categoryTranslations[doce.categoria] || doce.categoria}</span>
                                    </div>
                                </div>

                                <div className="w-7 h-7 bg-gray-100 dark:bg-gray-600 group-hover:bg-pink-500 rounded-full flex items-center justify-center transition-colors duration-200 shrink-0">
                                    <ArrowRight className="h-3.5 w-3.5 text-gray-400 dark:text-gray-300 group-hover:text-white transition-colors" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selected && (
                    <DoceModal
                        doce={selected}
                        onClose={() => setSelected(null)}
                        onCook={handleCook}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DocesPage;