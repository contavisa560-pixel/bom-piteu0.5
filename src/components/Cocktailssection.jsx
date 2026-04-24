import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, Clock, ChefHat, X, ArrowRight, Flame, Leaf, AlertCircle, GlassWater, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { useSpecialRecipes } from '@/hooks/useSpecialRecipes';
import { Skeleton } from '@/components/ui/Skeleton';
// ─── Imagens por receita ──────────────────────────────────────────────────────
const COCKTAIL_IMAGES = {
    "Mojito Clássico": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80",
    "Caipirinha Brasileira": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80",
    "Margarita": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80",
    "Limonada Suíça": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=600&q=80",
    "Cocktail de Manga e Maracujá": "https://images.unsplash.com/photo-1587888637140-849b5abb8d3c?w=600&q=80",
    "Gin Tónico com Pepino": "https://images.unsplash.com/photo-1542838775-a8994c2e5782?w=600&q=80",
    "Sangria de Frutos Vermelhos": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80",
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80";

// ─── Cores por perfil alimentar ───────────────────────────────────────────────
const PROFILE_STYLE = {
    "Com Álcool": { color: "from-purple-500 to-indigo-500", text: "text-purple-700 dark:text-purple-300", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-800", icon: Wine },
    "Sem Álcool": { color: "from-emerald-400 to-teal-500", text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800", icon: Leaf },
    "Vegano": { color: "from-green-400 to-lime-400", text: "text-green-700 dark:text-green-300", bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800", icon: Leaf },
};

const getProfileStyle = (perfil) => {
    if (!perfil) return PROFILE_STYLE["Com Álcool"];
    const key = Object.keys(PROFILE_STYLE).find(k => perfil.includes(k));
    return PROFILE_STYLE[key] || PROFILE_STYLE["Com Álcool"];
};

// ─── Badge de perfil alimentar ────────────────────────────────────────────────
const ProfileBadge = ({ perfil }) => {
    const { t } = useTranslation();
    const style = getProfileStyle(perfil);
    const Icon = style.icon;
    // Primeiro label apenas (antes da vírgula)
    const label = perfil?.split(',')[0] || perfil;
    return (
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${style.color} text-white`}>
            <Icon className="h-3 w-3" />
            {label}
        </span>
    );
};

// ─── Modal de cocktail ────────────────────────────────────────────────────────
const CocktailModal = ({ cocktail, onClose, onMake }) => {
    const { t } = useTranslation();
    if (!cocktail) return null;
    const img = cocktail.imagem_url || COCKTAIL_IMAGES[cocktail.nome] || FALLBACK_IMAGE;
    const style = getProfileStyle(cocktail.perfil_alimentar);
    const Icon = style.icon;

    // Transforma passo_passo em array
    const steps = cocktail.passo_passo
        .split(/\d+\.\s+/)
        .map(s => s.trim())
        .filter(Boolean);

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
                className="bg-white dark:bg-gray-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Hero */}
                <div className="relative h-52 overflow-hidden shrink-0">
                    <img
                        src={img}
                        alt={cocktail.nome}
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
                            <ProfileBadge perfil={cocktail.perfil_alimentar} />
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                                {cocktail.pais}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-white leading-tight">{cocktail.nome}</h2>
                    </div>
                </div>

                {/* Conteúdo com scroll */}
                <div className="p-5 overflow-y-auto flex-1">
                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>{cocktail.tempo}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                            <GlassWater className="h-4 w-4 text-cyan-400" />
                            <span>{cocktail.categoria}</span>
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

                    {/* Passo a passo */}
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

                    {/* Botão */}
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

// ─── Componente principal ─────────────────────────────────────────────────────
const CocktailsSection = ({ onStartChat, onNavigate, user }) => {
    const { t } = useTranslation();
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [selected, setSelected] = useState(null);
const { data: cocktails, loading } = useSpecialRecipes('cocktail');

if (loading) {
  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center">
          <Skeleton className="h-5 w-5 rounded mr-2" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-4 w-16" />
      </CardHeader>
      <CardContent className="space-y-2.5">
        {[1,2,3].map(i => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="w-14 h-14 rounded-xl" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="w-7 h-7 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const visible = cocktails.slice(0, 3);
    const isPremium = user?.isPremium || false;

    const handleCardClick = (cocktail) => {
        if (!isPremium) {
            setShowPremiumModal(true);
            return;
        }
        setSelected(cocktail);
    };

    const handleViewAll = () => {
        if (!isPremium) {
            setShowPremiumModal(true);
            return;
        }
        onNavigate('cocktails');
    };
    const handleMake = (cocktail) => {
        onStartChat({
            title: cocktail.nome_receita,
            source: 'receita_internacional_direta',
            nomeReceita: cocktail.nome,
            pais: cocktail.pais || 'Internacional',
            query: null
        });
    };

    return (
        <>
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="flex items-center text-gray-800 dark:text-white">
                        <Wine className="mr-2 h-5 w-5 text-cyan-500" />
                        {t('cocktails.title')}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleViewAll}
                        className="text-gray-500 dark:text-gray-400 hover:text-orange-500 text-xs font-semibold flex items-center gap-1"
                    >
                        {!isPremium && <Gem className="h-3 w-3 text-yellow-500" />}
                        {t('cocktails.viewAll')} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                </CardHeader>

                <CardContent className="space-y-2.5">
                    {visible.map((cocktail, i) => {
                        const img = cocktail.imagem_url || COCKTAIL_IMAGES[cocktail.nome] || FALLBACK_IMAGE;
                        const style = getProfileStyle(cocktail.perfil_alimentar);
                        const Icon = style.icon;

                        return (
                            <motion.div
                                key={cocktail.nome}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07 }}
                                whileHover={{ scale: 1.01 }}
                                onClick={() => handleCardClick(cocktail)}
                                className="group relative flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/60 cursor-pointer border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 hover:shadow-md"
                            >
                                {/* Thumbnail */}
                                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-700">
                                    <img
                                        src={img}
                                        alt={cocktail.nome}
                                        className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${!isPremium ? 'opacity-60' : ''}`}
                                        onError={e => { e.target.src = FALLBACK_IMAGE; }}
                                    />
                                    {!isPremium && (
                                        <div className="absolute top-1 right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-0.5">
                                            <Gem className="h-2.5 w-2.5 text-white" />
                                        </div>
                                    )}
                                </div>
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 dark:text-white text-sm leading-snug truncate group-hover:text-orange-500 transition-colors">
                                        {cocktail.nome}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${style.color} text-white`}>
                                            <Icon className="h-2.5 w-2.5" />
                                            {cocktail.perfil_alimentar?.split(',')[0]}
                                        </span>
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                            {cocktail.pais}
                                        </span>
                                    </div>
                                </div>

                                {/* Tempo + seta */}
                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-0.5">
                                        <Clock className="h-3 w-3" /> {cocktail.tempo}
                                    </span>
                                    <div className="w-7 h-7 bg-gray-100 dark:bg-gray-600 group-hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors duration-200">
                                        <ArrowRight className="h-3.5 w-3.5 text-gray-400 dark:text-gray-300 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </CardContent>
            </Card>

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
            {/* MODAL PREMIUM */}
            {showPremiumModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={() => setShowPremiumModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="h-1.5 w-full bg-gradient-to-r from-yellow-400 to-orange-500" />
                        <div className="p-7 text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Gem className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Funcionalidade Premium</h2>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                Esta funcionalidade está disponível apenas para membros Premium. Faz upgrade e desbloqueia tudo!
                            </p>
                            <div className="space-y-2.5 mb-6 text-left">
                                {['Meu Canto de Saúde', 'Viagem Gastronómica', 'Observações Pessoais', 'Alimentação Especial', 'Cocktails & Bebidas'].map((f) => (
                                    <div key={f} className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                                        <span className="text-sm text-gray-600">{f}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => { setShowPremiumModal(false); onNavigate('subscription'); }}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md hover:shadow-lg"
                            >
                                <Gem className="h-4 w-4" />
                                Ver Planos Premium
                            </button>
                            <button onClick={() => setShowPremiumModal(false)} className="w-full text-center text-gray-400 text-xs mt-3 py-2 hover:text-gray-600 transition-colors">
                                Continuar com plano gratuito
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>

    );
};

export default CocktailsSection;