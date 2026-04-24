import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, MessageCircle, Mic, AlertCircle, Wine, Cake, UtensilsCrossed as UtensilsCross, ShoppingCart, Heart, Globe, Calendar, Clipboard, ArrowRight, Baby, User as UserIcon, ChefHat, Sparkles, Star, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import OnboardingAdvanced from './OnboardingAdvanced';
import DailySuggestions from './DailySuggestions';
import PetiscosSection from './Petiscossection';
import CocktailsSection from './Cocktailssection';
import DocesSection from './DocesSection';
import Footer from '@/components/Footer';

const Dashboard = ({ onStartChat, onNavigate, user }) => {
  const { t } = useTranslation();
  const [streak, setStreak] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

 
const [preferences, setPreferences] = useState(null);

// Buscar preferências do backend sempre que o dashboard carrega
useEffect(() => {
  const token = localStorage.getItem('bomPiteuToken');
  if (!token || !user) return;

  const fetchPrefs = async () => {
    try {
      const { getPreferences } = await import('@/services/preferencesApi');
      const data = await getPreferences();
      setPreferences(data);
    } catch (err) {
      console.error('Erro ao carregar preferências no Dashboard:', err);
    }
  };

  fetchPrefs();

  // Recarregar quando o utilizador volta ao dashboard
  // (ex: voltou do perfil onde mudou as preferências)
  window.addEventListener('focus', fetchPrefs);
  return () => window.removeEventListener('focus', fetchPrefs);

}, [user?.id]);

  // Checa streak e login
  useEffect(() => {
   // Normaliza sempre para o mesmo valor independente do campo
const uid = (user?._id || user?.id || '').toString();
const STREAK_KEY = `bomPiteuStreak_${uid}`;
const LAST_DAY_KEY = `bomPiteuLastDay_${uid}`;
    // Trabalhar sempre com datas normalizadas (só a data, sem horas)
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const todayStr = todayDate.toISOString().split('T')[0]; // "2025-03-12"

    const lastDayStr = localStorage.getItem(LAST_DAY_KEY);
    const savedStreak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);

    let newStreak = savedStreak;

    if (!lastDayStr) {
      // Primeira visita alguma vez
      newStreak = 1;
    } else if (lastDayStr === todayStr) {
      // Já visitou hoje — não faz nada, mantém o valor guardado
      newStreak = savedStreak || 1;
    } else {
     const lastDate = new Date(lastDayStr + 'T00:00:00');
const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Visitou ontem → incrementa
        newStreak = savedStreak + 1;
        toast({ title: t('dashboard.streak.incrementTitle', { day: newStreak }), description: t('dashboard.streak.incrementDesc') });
      } else {
        // Saltou um ou mais dias → reinicia
        newStreak = 1;
        toast({ title: t('dashboard.streak.resetTitle'), description: t('dashboard.streak.resetDesc') });
      }
    }

    // Guarda sempre a data de hoje e o streak actualizado
    localStorage.setItem(LAST_DAY_KEY, todayStr);
    localStorage.setItem(STREAK_KEY, newStreak.toString());
    setStreak(newStreak);

    // Onboarding
    if (user?.id) {
      const onboardingCompleted = localStorage.getItem(`bomPiteuOnboardingCompleted_${user.id}`);
      if (!onboardingCompleted) setShowOnboarding(true);
    }
}, [user?._id || user?.id, t]);
  const handleFeatureClick = (id) => {
    if (id === 'gastronomicJourney') {
      onNavigate('internationalRecipes');
      return;
    }
    // Se no futuro houver outros itens especiais, pode adicionar condições aqui
    // Caso contrário, mostra toast genérico
    toast({
      title: t('dashboard.featureSoonTitle', { feature: t('dashboard.quickAccess.gastronomicJourney') }),
      description: t('dashboard.featureSoonDesc'),
    });
  };

  const handleSpecialFoodClick = (category) => {
    toast({
      title: t('dashboard.specialFoodWelcome', { category }),
      description: t('dashboard.specialFoodDesc'),
    });
    onStartChat({ title: category });
  };

  const handleRecipeClick = (recipeName) => {
    onStartChat({ title: recipeName });
  };
  const handlePremiumClick = (action) => {
    if (user?.isPremium) {
      action();
    } else {
      setShowPremiumModal(true);
    }
  };


  const quickAccessItems = [
    { title: t('dashboard.quickAccess.marketplace'), icon: ShoppingCart, color: "text-green-500", action: () => onNavigate('marketplace'), premium: false },
    { title: t('dashboard.quickAccess.healthCorner'), icon: Heart, color: "text-red-500", action: () => onNavigate('meuCantoDeSaude'), premium: true },
    { id: 'gastronomicJourney', title: t('dashboard.quickAccess.gastronomicJourney'), icon: Globe, color: "text-blue-500", action: () => handleFeatureClick('gastronomicJourney'), premium: true },
    { title: t('dashboard.quickAccess.personalNotes'), icon: Clipboard, color: "text-purple-500", action: () => onNavigate('observacoesPessoais'), premium: true },
  ];

  const specialFoodItems = [
    { title: t('dashboard.specialFood.infant'), icon: Baby, color: "text-teal-500", action: () => onNavigate('alimentacaoInfantil'), premium: true },
    { title: t('dashboard.specialFood.senior'), icon: UserIcon, color: "text-indigo-500", action: () => onNavigate('alimentacaoSenior'), premium: true },
  ];

  if (!user) {
    return <div className="text-center text-gray-500 mt-10">{t('dashboard.loadingUser')}</div>;
  }

  const hasFilledProfile =
    (user.foodProfile && user.foodProfile.length > 0) ||
    !!localStorage.getItem(`bomPiteu_preferences_${user?.id}`);

  return (
    <div className="space-y-8 relative">
      {/* --- ONBOARDING --- */}
      {showOnboarding && <OnboardingAdvanced onFinish={() => {
        setShowOnboarding(false);
        if (user?.id) {
          localStorage.setItem(`bomPiteuOnboardingCompleted_${user.id}`, 'true');
        }
      }} />}

      {/* --- DASHBOARD EXISTENTE --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center bg-gradient-to-r from-orange-500 to-red-500 text-white p-8 rounded-2xl shadow-2xl overflow-hidden relative"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full"></div>
        <h1 className="text-4xl md:text-5xl font-bold mb-2 relative z-10">
          {t('dashboard.greeting', { name: user?.name ? user.name.split(' ')[0] : t('dashboard.chef') })}
        </h1>

        <p className="text-lg text-white/90 max-w-3xl mx-auto mb-6 relative z-10">{t('dashboard.subtitle')}</p>
        <div className="flex justify-center flex-wrap gap-4 relative z-10">
          <Button id="cameraButton" onClick={() => onNavigate('imageRecognition')} size="lg" className="bg-white text-orange-600 hover:bg-white/90 rounded-full shadow-lg transition-all transform hover:scale-105"><Camera className="mr-2 h-6 w-6" /> {t('dashboard.buttons.recognizeImage')}</Button>
          <Button id="chatButton" onClick={() => onStartChat(null)} size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-full shadow-lg transition-all transform hover:scale-105"><MessageCircle className="mr-2 h-6 w-6" /> {t('dashboard.buttons.chatWithChef')}</Button>
          <Button id="voiceButton" onClick={() => handlePremiumClick(() => onNavigate('voiceRecognition'))} size="lg" className="relative bg-white text-blue-600 hover:bg-white/90 rounded-full shadow-lg transition-all transform hover:scale-105">
            <Mic className="mr-2 h-6 w-6" />
            {t('dashboard.buttons.voiceSearch')}
            {!user?.isPremium && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-0.5">
                <Gem className="h-3 w-3 text-white" />
              </span>
            )}
          </Button>
        </div>
      </motion.div>



      {!hasFilledProfile && (
        <motion.div
          layout
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 dark:from-orange-600 dark:via-amber-600 dark:to-yellow-500 shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30"
        >
          {/* Decoração de fundo */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 80% 50%, white 0%, transparent 70%)' }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 p-5 md:p-6">
            {/* Ícone + Texto */}
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div className="text-white">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-base md:text-lg leading-tight">
                    {t('dashboard.profilePrompt.title')}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <Sparkles className="h-3 w-3" /> {t('dashboard.profilePrompt.new')}
                  </span>
                </div>
                <p className="text-white/85 text-xs md:text-sm max-w-md">
                  {t('dashboard.profilePrompt.description')}
                </p>
                {/* Mini-badges do que podes configurar */}
                <div className="hidden md:flex items-center gap-2 mt-2 flex-wrap">
                  {t('dashboard.profilePrompt.badges', { returnObjects: true }).map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      <Star className="h-2.5 w-2.5" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Botão CTA */}
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate('userProfile', { initialTab: 'alimentacao' }); }}
              className="shrink-0 group flex items-center gap-2 bg-white hover:bg-orange-50 text-orange-600 font-bold text-sm px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              <ChefHat className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
              {t('dashboard.profilePrompt.cta')}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>

          {/* Barra de progresso decorativa */}
          <div className="h-1 w-full bg-white/20">
            <div className="h-full w-1/4 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      )}

      {/* CARDS RÁPIDOS */}
      <div id="quick-access-cards" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        <Card className="col-span-2 sm:col-span-1 lg:col-span-1 flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
          <Calendar className="h-8 w-8 mb-2 text-blue-600 dark:text-blue-400" />
          <p className="text-2xl font-bold">{streak} {streak === 1 ? t('dashboard.streak.day') : t('dashboard.streak.days')}</p>
          <p className="text-xs font-semibold text-center text-blue-700 dark:text-blue-300">{t('dashboard.streak.label')}</p>
        </Card>

        {quickAccessItems.map(item => (
          <Card
            key={item.title}
            className="relative flex flex-col items-center justify-center p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            onClick={() => item.premium ? handlePremiumClick(item.action) : item.action()}
          >
            {item.premium && !user?.isPremium && (
              <div className="absolute top-1.5 right-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-0.5">
                <Gem className="h-3 w-3 text-white" />
              </div>
            )}
            <item.icon className={`h-8 w-8 mb-2 ${item.color} dark:opacity-90 ${item.premium && !user?.isPremium ? 'opacity-50' : ''}`} />
            <p className={`text-sm font-semibold text-center ${item.premium && !user?.isPremium ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>{item.title}</p>
          </Card>
        ))}

        {specialFoodItems.map(item => (
          <Card
            key={item.title}
            className="relative flex flex-col items-center justify-center p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            onClick={() => item.premium ? handlePremiumClick(item.action) : item.action()}
          >
            {item.premium && !user?.isPremium && (
              <div className="absolute top-1.5 right-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-0.5">
                <Gem className="h-3 w-3 text-white" />
              </div>
            )}
            <item.icon className={`h-8 w-8 mb-2 ${item.color} dark:opacity-90 ${item.premium && !user?.isPremium ? 'opacity-50' : ''}`} />
            <p className={`text-sm font-semibold text-center ${item.premium && !user?.isPremium ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>{item.title}</p>
          </Card>
        ))}

      </div>

      {/* SUGESTÕES DO DIA */}
      <div id="daily-suggestions-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('dashboard.suggestions.title')}</h2>
          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> {t('dashboard.suggestions.refreshNote')}
          </span>
        </div>
        <DailySuggestions
  onStartChat={onStartChat}
  user={user}
  preferences={preferences}
/>
  
      </div>

      {/* PETISCOS & ACOMPANHAMENTOS */}
      <PetiscosSection onStartChat={onStartChat} onNavigate={onNavigate} />

      {/* DOCES & BEBIDAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Doces */}
        <DocesSection onStartChat={onStartChat} onNavigate={onNavigate} />

        {/* Bebidas */}
        <CocktailsSection onStartChat={onStartChat} onNavigate={onNavigate} user={user} />
      </div>
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
      <Footer onNavigate={onNavigate} />

    </div>
  );
};

export default Dashboard;