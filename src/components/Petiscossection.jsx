import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, Clock, ChefHat, X, ArrowRight, Flame, Wine, Beer, Coffee, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { useSpecialRecipes } from '@/hooks/useSpecialRecipes';
import { Skeleton } from '@/components/ui/Skeleton'; 
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80';

// ─── Derivar estilo da bebida a partir do campo bebida_sugerida ───────────────
function getDrinkStyle(bebida) {
  if (!bebida) return { color: 'from-gray-400 to-gray-500', bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', textColor: 'text-gray-600 dark:text-gray-300', Icon: Droplets };
  const b = bebida.toLowerCase();
  if (b.includes('vinho tinto'))   return { color: 'from-purple-500 to-red-500',   bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', textColor: 'text-purple-700 dark:text-purple-300', Icon: Wine };
  if (b.includes('vinho'))         return { color: 'from-yellow-400 to-amber-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', textColor: 'text-yellow-700 dark:text-yellow-300', Icon: Wine };
  if (b.includes('cerveja'))       return { color: 'from-amber-400 to-orange-400', bg: 'bg-amber-50 dark:bg-amber-900/20',  border: 'border-amber-200 dark:border-amber-800',  textColor: 'text-amber-700 dark:text-amber-300',  Icon: Beer };
  if (b.includes('sake'))          return { color: 'from-pink-400 to-rose-400',    bg: 'bg-pink-50 dark:bg-pink-900/20',    border: 'border-pink-200 dark:border-pink-800',    textColor: 'text-pink-700 dark:text-pink-300',    Icon: Wine };
  if (b.includes('café') || b.includes('cha') || b.includes('chá')) return { color: 'from-brown-400 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', textColor: 'text-amber-800 dark:text-amber-300', Icon: Coffee };
  if (b.includes('margarita') || b.includes('cocktail') || b.includes('whisky')) return { color: 'from-cyan-400 to-teal-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800', textColor: 'text-cyan-700 dark:text-cyan-300', Icon: Wine };
  return { color: 'from-gray-400 to-gray-500', bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', textColor: 'text-gray-600 dark:text-gray-300', Icon: Droplets };
}

// ─── Badge de dificuldade ─────────────────────────────────────────────────────
const DiffBadge = ({ level }) => {
  const { t } = useTranslation();
  const map = {
    'Fácil':   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    'Médio':   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    'Difícil': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };
  const levelKey = { 'Fácil': 'easy', 'Médio': 'medium', 'Difícil': 'hard' }[level] || 'easy';
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${map[level] || map['Fácil']}`}>
      {t(`difficulty.${levelKey}`)}
    </span>
  );
};

// ─── Modal de petisco ─────────────────────────────────────────────────────────
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
        {/* Hero */}
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
                  <DrinkIcon className="h-3 w-3" />
                  {petisco.bebida_sugerida}
                </span>
              )}
              <DiffBadge level={petisco.dificuldade} />
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">{petisco.nome}</h2>
          </div>
        </div>

        {/* Conteúdo */}
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

          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
            {petisco.descricao}
          </p>

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

// ─── Componente principal ─────────────────────────────────────────────────────
const PetiscosSection = ({ onStartChat, onNavigate }) => {
  const { t } = useTranslation();
  const [selectedPetisco, setSelected] = useState(null);

  const { data: PETISCOS_DB, loading } = useSpecialRecipes('petisco');

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
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1,2,3,4].map(i => (
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

const visible = PETISCOS_DB.slice(0, 4);

  const handleCook = (petisco) => {
    onStartChat({
      title: petisco.nome,
      source: 'receita_internacional_direta',
      nomeReceita: petisco.nome,
      pais: petisco.pais || 'Internacional',
      query: null
    });
  };

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center text-gray-800 dark:text-white">
            <UtensilsCrossed className="mr-2 h-5 w-5 text-cyan-500" />
            {t('petiscos.title')}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('petiscos')}
            className="text-gray-500 dark:text-gray-400 hover:text-orange-500 text-xs font-semibold"
          >
            {t('petiscos.viewAll')} <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </CardHeader>

        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visible.map((petisco, i) => {
            const drink = getDrinkStyle(petisco.bebida_sugerida);
            const DrinkIcon = drink.Icon;
            return (
              <motion.div
                key={petisco._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelected(petisco)}
                className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/60 cursor-pointer border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 hover:shadow-md"
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-700">
                  <img
                    src={petisco.imagem_url || FALLBACK_IMAGE}
                    alt={petisco.nome}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-white text-sm leading-snug truncate group-hover:text-orange-500 transition-colors">
                    {petisco.nome}
                  </p>
                  {petisco.bebida_sugerida && (
                    <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${drink.color} text-white`}>
                      <DrinkIcon className="h-2.5 w-2.5" />
                      {petisco.bebida_sugerida}
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-0.5">
                    <Clock className="h-3 w-3" /> {petisco.tempo}
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

      <AnimatePresence>
        {selectedPetisco && (
          <PetiscoModal
            petisco={selectedPetisco}
            onClose={() => setSelected(null)}
            onCook={handleCook}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default PetiscosSection;