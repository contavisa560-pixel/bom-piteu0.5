import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cake, Clock, ChefHat, X, ArrowRight, Flame, Leaf, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/Skeleton';
// ─── Base de dados (mantida em português) ─────────────────────────────────────
import { useSpecialRecipes } from '@/hooks/useSpecialRecipes';


// ─── Badge de dificuldade ─────────────────────────────────────────────────────
const DiffBadge = ({ level }) => {
    const { t } = useTranslation();
    const map = {
        'Fácil': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
        'Médio': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
        'Difícil': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    };
    // Traduz o nível
    const levelKey = {
        'Fácil': 'easy',
        'Médio': 'medium',
        'Difícil': 'hard'
    }[level] || 'easy';
    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${map[level] || map['Fácil']}`}>
            {t(`difficulty.${levelKey}`)}
        </span>
    );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const DoceModal = ({ doce, onClose, onCook }) => {
    const { t } = useTranslation();
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
                {/* Hero */}
                <div className="relative h-52 overflow-hidden">
                    <img src={doce.imagem_url} alt={doce.nome} className="w-full h-full object-cover"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80'; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <button onClick={onClose}
                        className="absolute top-4 right-4 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 mb-1.5">
                            <DiffBadge level={doce.dificuldade} />
                            {doce.vegano && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500 text-white">
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

                {/* Conteúdo */}
                <div className="p-5">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                            <Clock className="h-4 w-4" /><span>{doce.tempo}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                            <Flame className="h-4 w-4 text-orange-400" /><span>{t(`difficulty.${doce.dificuldade === 'Fácil' ? 'easy' : doce.dificuldade === 'Médio' ? 'medium' : 'hard'}`)}</span>
                        </div>
                        <span className="text-xs text-pink-500 font-semibold">{doce.categoria}</span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                        {doce.descricao}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                        {doce.tags.map(tag => (
                            <span key={tag} className="text-[11px] bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-300 px-2.5 py-1 rounded-full font-medium border border-pink-100 dark:border-pink-800">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <button
                        onClick={() => { onCook(doce); onClose(); }}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg text-sm"
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

// ─── Componente principal ─────────────────────────────────────────────────────
const DocesSection = ({ onStartChat, onNavigate }) => {
    const { t } = useTranslation();
    const [selected, setSelected] = useState(null);
    const { data: DOCES_DB, loading } = useSpecialRecipes('doce');
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
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="w-7 h-7 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
const featured = DOCES_DB.slice(0, 3);

    const handleCook = (doce) => {
    onStartChat({
        title: doce.nome,
        source: 'receita_internacional_direta',
        nomeReceita: doce.nome,
        pais: doce.pais || 'Internacional',
        query: null
    });
};
    return (
        <>
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="flex items-center text-gray-800 dark:text-white">
                        <Cake className="mr-2 h-5 w-5 text-pink-500" />
                        {t('doces.title')}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate('doces')}
                        className="text-gray-500 dark:text-gray-400 hover:text-pink-500 text-xs font-semibold"
                    >
                        {t('doces.viewAll')} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                </CardHeader>

                <CardContent className="space-y-2.5">
                    {featured.map((doce, i) => (
                        <motion.div
                            key={doce._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => setSelected(doce)}
                            className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/60 cursor-pointer border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 hover:shadow-md"
                        >
                            {/* Thumbnail */}
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-pink-50 dark:bg-pink-900/20">
                                <img src={doce.imagem_url} alt={doce.nome}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={e => { e.target.style.display = 'none'; }} />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 dark:text-white text-sm leading-snug truncate group-hover:text-pink-500 transition-colors">
                                    {doce.nome}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white">
                                        <Star className="h-2.5 w-2.5" /> {doce.categoria}
                                    </span>
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{doce.pais}</span>
                                </div>
                            </div>

                            {/* Tempo + seta */}
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-0.5">
                                    <Clock className="h-3 w-3" /> {doce.tempo}
                                </span>
                                <div className="w-7 h-7 bg-gray-100 dark:bg-gray-600 group-hover:bg-pink-500 rounded-full flex items-center justify-center transition-colors duration-200">
                                    <ArrowRight className="h-3.5 w-3.5 text-gray-400 dark:text-gray-300 group-hover:text-white transition-colors" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </CardContent>
            </Card>

            <AnimatePresence>
                {selected && (
                    <DoceModal doce={selected} onClose={() => setSelected(null)} onCook={handleCook} />
                )}
            </AnimatePresence>
        </>
    );
};

export default DocesSection;