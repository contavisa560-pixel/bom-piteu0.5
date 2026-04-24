// src/components/MeuCantoDeSaude.jsx - VERSÃO REAL (TRADUZIDA)
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, TrendingUp, Activity, Bell, History,
  ArrowLeft, Star, ArrowRight, Plus, ChefHat,
  Carrot, Apple, Wheat, Beef, Salad
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MealHistoryDisplay from '@/components/MealHistoryDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import {
  getDashboardSaude,
  adicionarRefeicao,
  atualizarLimites,
  adicionarFavoritoSaude,
  adicionarFavoritoReal,
  listarFavoritos,
  gerarRelatorio,
  debugHealthApi,
  removerFavoritoSaude
} from '@/services/healthApi';
import QuickMealModal from '@/components/QuickMealModal';
import FullMealModal from '@/components/FullMealModal';
import RelatorioMedicoModal from '@/components/RelatorioMedicoModal';
import { Download, X, FileText, User, Scale, Droplet, Flame } from 'lucide-react';
import { adicionarFavoritoUser, removerFavoritoUser } from '@/services/api';


const MeuCantoDeSaude = ({ onNavigate, onStartChat, user }) => {
  const { t } = useTranslation();

  const [dashboardData, setDashboardData] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);
  const [showMealDetails, setShowMealDetails] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [relatorioData, setRelatorioData] = useState(null);
  const [showRelatorioModal, setShowRelatorioModal] = useState(false);
  const [gerandoRelatorio, setGerandoRelatorio] = useState(false);

  // CARREGAR DADOS REAIS DO BACKEND
  useEffect(() => {
    carregarDadosReais();
  }, [user]);

  // GERAR RELATÓRIO 
  const handleGerarRelatorio = async () => {
    try {
      setGerandoRelatorio(true);
      const userId = user?.id || user?._id;
      if (!userId) {
        toast({ title: t('common.error'), description: t('health.authError'), variant: "destructive" });
        return;
      }

      const report = await gerarRelatorio(userId);
      console.log(' Relatório gerado:', report);

      setRelatorioData(report);
      setShowRelatorioModal(true);

      toast({
        title: t('health.reportSuccess'),
        description: t('health.reportSuccessDesc', { meals: report.stats?.totalMeals || 0, veggies: report.stats?.vegetables || 0 }),
        variant: "default"
      });

    } catch (error) {
      console.error(' Erro:', error);
      toast({
        title: t('common.error'),
        description: error.message || t('health.reportError'),
        variant: "destructive"
      });
    } finally {
      setGerandoRelatorio(false);
    }
  };

  const carregarDadosReais = async () => {
    try {
      setLoading(true);
      const userId = user?.id || user?._id;

      if (!userId) {
        toast({
          title: t('common.error'),
          description: t('health.authError'),
          variant: "destructive"
        });
        return;
      }

      console.log('🚀 Carregando dados REAIS para userId:', userId);

      // 1. DEBUG: Verificar conexão com API
      await debugHealthApi(userId);

      // 2. Buscar dashboard REAL do backend
      const data = await getDashboardSaude(userId);
      console.log('📊 Dashboard REAL carregado:', data);

      setDashboardData(data);

      // 3. Buscar favoritos REAIS
      const favoritosReais = await listarFavoritos(userId);
      setFavorites(favoritosReais);

    } catch (error) {
      console.error('❌ Erro ao carregar dados reais:', error);
      toast({
        title: t('common.error'),
        description: t('health.connectionError'),
        variant: "destructive"
      });

      // Fallback: criar dados locais temporários
      setDashboardData({
        userId: user?.id,
        monthlyStats: { vegetablesCount: 0, fruitsCount: 0, proteinsCount: 0 },
        limits: { sugar: 25, salt: 5, calories: 2000, sugarAlert: false, fatAlert: false, caloriesAlert: false },
        favoriteRecipes: [],
        mealHistory: [],
        nutrientProgress: []
      });
    } finally {
      setLoading(false);
    }
  };

  // ADICIONAR REFEIÇÃO RÁPIDA
  const handleQuickAddMeal = () => {
    setShowQuickModal(true);
  };

  //  ADICIONAR REFEIÇÃO COMPLETA
  const handleFullAddMeal = () => {
    setShowFullModal(true);
  };

  // SALVAR REFEIÇÃO 
  const handleSaveMeal = async (mealData, isFormData = false) => {
    try {
      const userId = user?.id || user?._id;
      if (!userId) return;

      let response;

      if (isFormData) {
        // Se for FormData (com imagem), enviar como multipart/form-data
        response = await fetch('http://localhost:5000/api/saude/' + userId + '/meal', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: mealData  // já é FormData
        });
      } else {
        // Se for JSON (sem imagem)
        response = await fetch('http://localhost:5000/api/saude/' + userId + '/meal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(mealData)
        });
      }

      if (!response.ok) {
        throw new Error(t('health.mealSaveError'));
      }

      // Recarregar dados
      await carregarDadosReais();

      toast({
        title: t('health.mealSaved'),
        description: mealData.isDetailed
          ? t('health.mealSavedDetailed')
          : t('health.mealSavedQuick'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive"
      });
    }
  };

  //  TOGGLE ALERTA REAL
  const handleToggleAlerta = async (tipo) => {
    try {
      const userId = user?.id || user?._id;
      if (!userId || !dashboardData) return;

      // Mapeamento correto
      const alertMap = {
        'calorias': 'caloriesAlert',
        'gordura': 'fatAlert',
        'acucar': 'sugarAlert'
      };

      const backendField = alertMap[tipo];
      if (!backendField) return;

      // Atualiza limites REAIS
      const novosLimites = {
        ...dashboardData.limits,
        [backendField]: !dashboardData.limits?.[backendField]
      };

      // CHAMA A API REAL
      await atualizarLimites(userId, novosLimites);

      // Atualiza estado local
      setDashboardData(prev => ({
        ...prev,
        limits: novosLimites
      }));

      toast({
        title: t('health.alertUpdated'),
        description: t('health.alertUpdatedDesc', { tipo: t(`health.alertTypes.${tipo}`) })
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive"
      });
    }
  };

  //  ADICIONAR FAVORITO REAL
  const handleAdicionarFavorito = async () => {
    try {
      const userId = user?.id || user?._id;
      if (!userId) return;

      const novoFavorito = {
        recipeId: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: t('health.favoriteExampleTitle'),
        imageUrl: '/uploads/default-recipe.jpg'
      };

      await adicionarFavoritoSaude(userId, novoFavorito);

      // Recarregar favoritos
      const novosFavoritos = await listarFavoritos(userId);
      setFavorites(novosFavoritos);

      toast({
        title: t('health.favoriteAdded'),
        description: t('health.favoriteAddedDesc'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive"
      });
    }
  };

  //  REMOVER FAVORITO REAL (VERSÃO MELHORADA)
  const handleRemoverFavorito = async (favoritoId) => {
    try {
      if (!window.confirm(t('health.confirmRemoveFavorite'))) {
        return;
      }

      const userId = user?.id || user?._id;
      if (!userId) {
        toast({
          title: t('common.error'),
          description: t('health.authError'),
          variant: "destructive"
        });
        return;
      }

      console.log('🔍 Tentando remover favorito:', {
        favoritoId,
        userId,
        totalFavorites: favorites.length
      });

      // 1. Primeiro tenta remover do backend
      try {
        await removerFavoritoSaude(userId, favoritoId);
        console.log('✅ Removido do backend com sucesso');
      } catch (backendError) {
        console.log('⚠️ Não encontrado no backend, removendo apenas localmente');
        // Se não encontrar no backend, continua para remover do frontend
      }

      // 2. Remove do estado local (funciona para ambos os casos)
      const novosFavoritos = favorites.filter(fav => {
        const favId = fav.recipeId || fav.id;
        return favId !== favoritoId;
      });

      console.log('📊 Resultado:', {
        antes: favorites.length,
        depois: novosFavoritos.length,
        removido: favorites.length - novosFavoritos.length
      });

      setFavorites(novosFavoritos);

      // 3. Atualiza dashboardData também
      if (dashboardData) {
        setDashboardData(prev => ({
          ...prev,
          favoriteRecipes: prev.favoriteRecipes?.filter(fav => {
            const favId = fav.recipeId || fav.id;
            return favId !== favoritoId;
          }) || []
        }));
      }

      toast({
        title: t('health.favoriteRemoved'),
        description: t('health.favoriteRemovedDesc'),
        variant: "default"
      });

    } catch (error) {
      console.error('❌ Erro ao remover favorito:', error);
      toast({
        title: t('common.error'),
        description: error.message || t('health.favoriteRemoveError'),
        variant: "destructive"
      });
    }
  };

  //  PARTILHAR FAVORITO
  const handlePartilharFavorito = async (favorito) => {
    try {
      const shareData = {
        title: favorito.title,
        text: t('health.shareText', { title: favorito.title }),
        url: window.location.href,
      };

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copiar para clipboard
        await navigator.clipboard.writeText(
          t('health.shareFallback', { title: favorito.title })
        );
        toast({
          title: t('health.copied'),
          description: t('health.copiedDesc'),
          variant: "default"
        });
      }
    } catch (error) {
      console.log('Partilha cancelada ou não suportada');
    }
  };

  //  ADICIONAR FAVORITO COM IMAGEM REAL (AGORA SALVA NO BACKEND)
  const handleAdicionarFavoritoComImagem = async () => {
    try {
      const userId = user?.id || user?._id;
      if (!userId) {
        toast({
          title: t('common.error'),
          description: t('health.authError'),
          variant: "destructive"
        });
        return;
      }

      // Lista de receitas sugeridas
      const receitasSugeridas = [
        {
          title: t('health.suggestedRecipes.quinoa'),
          imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=200&q=80",
          healthScore: 9,
          difficulty: t('difficulty.easy'),
          cookingTime: "30 min"
        },
        {
          title: t('health.suggestedRecipes.salmon'),
          imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=200&q=80",
          healthScore: 8,
          difficulty: t('difficulty.medium'),
          cookingTime: "25 min"
        },
        {
          title: t('health.suggestedRecipes.pumpkinSoup'),
          imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=200&q=80",
          healthScore: 10,
          difficulty: t('difficulty.easy'),
          cookingTime: "40 min"
        }
      ];

      // Escolhe uma receita aleatória
      const receitaEscolhida = receitasSugeridas[Math.floor(Math.random() * receitasSugeridas.length)];

      // Cria um objeto completo com recipeId
      const novaReceita = {
        recipeId: `exemplo_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        title: receitaEscolhida.title,
        imageUrl: receitaEscolhida.imageUrl,
        healthScore: receitaEscolhida.healthScore,
        difficulty: receitaEscolhida.difficulty,
        cookingTime: receitaEscolhida.cookingTime
      };

      console.log('📤 Adicionando favorito EXEMPLO via rota correta:', novaReceita);

      //  AGORA USA A ROTA CORRETA!
      await adicionarFavoritoReal(userId, novaReceita);

      // Recarrega os dados do backend
      await carregarDadosReais();

      toast({
        title: t('health.favoriteExampleAdded'),
        description: t('health.favoriteExampleAddedDesc', { title: novaReceita.title }),
        variant: "default"
      });

    } catch (error) {
      console.error('❌ Erro ao adicionar favorito exemplo:', error);

      // Se der erro, mostra mensagem específica
      if (error.message.includes("Já está nos favoritos")) {
        toast({
          title: t('health.alreadyFavorite'),
          description: t('health.alreadyFavoriteDesc'),
          variant: "default"
        });
      } else {
        toast({
          title: t('common.error'),
          description: error.message || t('health.favoriteAddError'),
          variant: "destructive"
        });
      }
    }
  };

  //  CALCULAR ESTATÍSTICAS REAIS
  const calcularEstatisticas = () => {
    if (!dashboardData) return { totalRefeicoes: 0, grupos: {}, vitaminas: {} };

    const mealHistory = dashboardData.mealHistory || [];

    // Grupos alimentares baseados no histórico REAL
    const grupos = {
      legumes: mealHistory.filter(m =>
        m.recipeTitle?.toLowerCase().includes('legume') ||
        m.recipeTitle?.toLowerCase().includes('sopa') ||
        m.recipeTitle?.toLowerCase().includes('vegetal')
      ).length,
      frutas: mealHistory.filter(m =>
        m.recipeTitle?.toLowerCase().includes('fruta') ||
        m.recipeTitle?.toLowerCase().includes('salada') ||
        m.mealType === 'breakfast'
      ).length,
      proteinas: mealHistory.filter(m =>
        m.recipeTitle?.toLowerCase().includes('frango') ||
        m.recipeTitle?.toLowerCase().includes('carne') ||
        m.recipeTitle?.toLowerCase().includes('peixe') ||
        m.recipeTitle?.toLowerCase().includes('ovo')
      ).length,
      cereais: mealHistory.filter(m =>
        m.recipeTitle?.toLowerCase().includes('arroz') ||
        m.recipeTitle?.toLowerCase().includes('massa') ||
        m.recipeTitle?.toLowerCase().includes('pão')
      ).length
    };

    // Vitaminas estimadas baseadas no histórico
    const vitaminas = {
      vitaminaC: mealHistory.filter(m =>
        m.recipeTitle?.toLowerCase().includes('laranja') ||
        m.recipeTitle?.toLowerCase().includes('limão') ||
        m.recipeTitle?.toLowerCase().includes('tomate')
      ).length,
      proteina: grupos.proteinas,
      fibras: mealHistory.filter(m =>
        m.recipeTitle?.toLowerCase().includes('aveia') ||
        m.recipeTitle?.toLowerCase().includes('integral') ||
        m.recipeTitle?.toLowerCase().includes('feijão')
      ).length,
      ferro: mealHistory.filter(m =>
        m.recipeTitle?.toLowerCase().includes('espinafre') ||
        m.recipeTitle?.toLowerCase().includes('fígado') ||
        m.recipeTitle?.toLowerCase().includes('carne vermelha')
      ).length
    };

    return {
      totalRefeicoes: mealHistory.length,
      grupos,
      vitaminas
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mb-4"></div>
        <p className="text-gray-600">{t('health.loading')}</p>
        <p className="text-sm text-gray-400">{t('health.connecting')}</p>
      </div>
    );
  }

  const stats = calcularEstatisticas();
  const limites = dashboardData?.limits || {};

  return (
    <div className="space-y-6 dark:text-gray-200">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 rounded-2xl shadow-lg"
      >
        <div className="flex justify-between items-start">
          <div>
            <Button
              variant="ghost"
              onClick={() => onNavigate('dashboard')}
              className="text-white hover:bg-white/20 mb-4"
            >
              <ArrowLeft className="mr-2 h-5 w-5" /> {t('common.backToDashboard')}
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Heart className="h-8 w-8" /> {t('health.title')}
            </h1>
            <p className="text-white/90 mt-2">{t('health.subtitle')}</p>

            <div className="flex gap-2 mt-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                <ChefHat className="h-3 w-3 mr-1" />
                {t('health.mealsCount', { count: stats.totalRefeicoes })}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                <Star className="h-3 w-3 mr-1" />
                {t('health.favoritesCount', { count: favorites.length })}
              </Badge>
            </div>
          </div>

          <Button
            onClick={handleGerarRelatorio}
            disabled={gerandoRelatorio}
            className="bg-white text-red-600 hover:bg-white/90 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700 relative"
          >
            {gerandoRelatorio ? (
              <>
                <span className="animate-spin mr-2"></span>
                {t('health.generating')}
              </>
            ) : (
              t('health.generateReport')
            )}
          </Button>

        </div>
      </motion.div>

      {/* Tabs de Navegação */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('overview')}
          className={activeTab === 'overview'
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
          }
        >
          {t('health.tabs.overview')}
        </Button>
        <Button
          variant={activeTab === 'favorites' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('favorites')}
          className={activeTab === 'favorites'
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
          }
        >
          {t('health.tabs.favorites', { count: favorites.length })}
        </Button>
        <Button
          variant={activeTab === 'history' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('history')}
          className={activeTab === 'history'
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
          }
        >
          {t('health.tabs.history', { count: stats.totalRefeicoes })}
        </Button>
      </div>

      {/* CONTEÚDO REAL - VISÃO GERAL */}
      {activeTab === 'overview' && (
        <>
          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('health.stats.totalMeals')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRefeicoes}</p>
                  </div>
                  <ChefHat className="h-8 w-8 text-red-500 dark:text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('health.stats.vegetables')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.grupos.legumes}</p>
                  </div>
                  <Carrot className="h-8 w-8 text-green-500 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('health.stats.proteins')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.grupos.proteinas}</p>
                  </div>
                  <Beef className="h-8 w-8 text-orange-500 dark:text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('health.stats.fruits')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.grupos.frutas}</p>
                  </div>
                  <Apple className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>


          {/* Grupos Alimentares REAIS */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <TrendingUp className="h-6 w-6 text-green-500 dark:text-green-400" />
                {t('health.foodGroups.title')}
                <Badge variant="outline" className="ml-2 dark:border-gray-600 dark:text-gray-400">
                  {t('health.foodGroups.badge', { count: stats.totalRefeicoes })}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.grupos).map(([grupo, qtd]) => (
                  <div key={grupo}>
                    <div className="flex justify-between mb-1">
                      <span className="capitalize font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        {grupo === 'legumes' && <Carrot className="h-4 w-4 text-green-500 dark:text-green-400" />}
                        {grupo === 'frutas' && <Apple className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />}
                        {grupo === 'proteinas' && <Beef className="h-4 w-4 text-orange-500 dark:text-orange-400" />}
                        {grupo === 'cereais' && <Wheat className="h-4 w-4 text-amber-500 dark:text-amber-400" />}
                        {t(`health.foodGroups.${grupo}`)}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">{qtd}x</span>
                    </div>
                    <Progress
                      value={(qtd / Math.max(stats.totalRefeicoes, 1)) * 100}
                      className="h-2 bg-gray-200 dark:bg-gray-700"
                    />
                  </div>
                ))}
              </div>

              {stats.totalRefeicoes === 0 && (
                <div className="text-center py-6">
                  <Salad className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">{t('health.foodGroups.noMeals')}</p>
                  <Button onClick={handleQuickAddMeal} className="mt-2">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('health.foodGroups.addFirstMeal')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vitaminas & Nutrientes REAIS */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Activity className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                {t('health.vitamins.title')}
                <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-400">
                  {t('health.vitamins.badge')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.vitaminas).map(([vitamina, qtd]) => (
                  <div key={vitamina}>
                    <div className="flex justify-between mb-1">
                      <span className="capitalize font-medium text-gray-700 dark:text-gray-300">
                        {t(`health.vitamins.${vitamina}`)}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">{qtd}x {t('health.vitamins.consumed')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={Math.min(qtd * 20, 100)}
                        className="h-2 flex-1 bg-gray-200 dark:bg-gray-700"
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {qtd === 0 ? t('health.vitamins.level.none') : qtd < 3 ? t('health.vitamins.level.low') : qtd < 6 ? t('health.vitamins.level.medium') : t('health.vitamins.level.high')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alertas Ativados REAIS */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Bell className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                {t('health.alerts.title')}
                <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-400">
                  {t('health.alerts.badge')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t('health.alerts.calories')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('health.alerts.caloriesDesc')}</p>
                </div>
                <Switch
                  checked={limites.caloriesAlert || false}
                  onClick={() => handleToggleAlerta('calorias')}
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t('health.alerts.fat')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('health.alerts.fatDesc')}</p>
                </div>
                <Switch
                  checked={limites.fatAlert || false}
                  onClick={() => handleToggleAlerta('gordura')}
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t('health.alerts.sugar')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('health.alerts.sugarDesc')}</p>
                </div>
                <Switch
                  checked={limites.sugarAlert || false}
                  onClick={() => handleToggleAlerta('acucar')}
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ABA DE FAVORITOS REAIS */}
      {activeTab === 'favorites' && (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Star className="h-6 w-6 text-yellow-500" />
                {t('health.favorites.title')}
              </CardTitle>
              <Button
                onClick={handleAdicionarFavoritoComImagem}
                className="gap-2 bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                <Plus className="h-4 w-4" />
                {t('health.favorites.addExample')}
                <Star className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.length > 0 ? (
                favorites.map((fav, idx) => (
                  <motion.div
                    key={fav.id || idx}
                    whileHover={{ scale: 1.02 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg cursor-pointer bg-white dark:bg-gray-800 relative group"
                    onClick={(e) => {
                      if (e.target.closest('.remove-btn')) return;
                      if (onStartChat) {
                        onStartChat({
                          title: fav.title,
                          type: 'favorite',
                          recipeId: fav.recipeId || fav.id || `fav_${Date.now()}`,
                          source: 'meu-canto-saude',
                          preventRecipeDisplay: true,
                          imageUrl: fav.imageUrl,
                          recipeData: {
                            title: fav.title,
                            imageUrl: fav.imageUrl,
                            ingredients: fav.ingredients || [],
                            steps: fav.steps || [],
                            healthScore: fav.healthScore || 8,
                            difficulty: fav.difficulty || t('difficulty.medium')
                          }
                        });
                      } else {
                        onNavigate('dashboard');
                      }
                    }}
                  >
                    <button
                      className="remove-btn absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 z-10 shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        const idToRemove = fav.recipeId || fav.id;
                        handleRemoverFavorito(idToRemove);
                      }}
                      title={t('health.favorites.removeTooltip')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        {fav.imageUrl ? (
                          <img
                            src={fav.imageUrl}
                            alt={fav.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=200&q=80';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-400 dark:text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-.894.553L3.382 6H2a1 1 0 00-1 1v1a1 1 0 001 1h18a1 1 0 001-1V7a1 1 0 00-1-1h-1.382l-1.724-3.447A1 1 0 0016 2H6zm0 2.236L7.618 6H4.382L6 4.236zM16 8a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1h12z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                              {fav.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {t('health.favorites.addedOn', { date: new Date(fav.addedAt || Date.now()).toLocaleDateString(t('code'), { year: 'numeric', month: 'numeric', day: 'numeric' }) })}
                            </p>
                          </div>
                          <Heart className="h-5 w-5 text-red-500 fill-current" />
                        </div>

                        <div className="flex items-center gap-3 mt-3">
                          {fav.healthScore && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {t('health.healthScore', { score: fav.healthScore })}
                              </span>
                            </div>
                          )}

                          {fav.difficulty && (
                            <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                              {fav.difficulty}
                            </div>
                          )}

                          {fav.cookingTime && (
                            <div className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {fav.cookingTime}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePartilharFavorito(fav);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                            </svg>
                            {t('health.share')}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onStartChat) {
                                onStartChat({
                                  title: fav.title,
                                  type: 'favorite',
                                  recipeId: fav.recipeId || fav.id,
                                  source: 'meu-canto-saude',
                                  preventRecipeDisplay: false
                                });
                              }
                            }}
                          >
                            <ChefHat className="h-3 w-3 mr-1" />
                            {t('health.cook')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <Star className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    {t('health.favorites.empty')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500 mb-6">
                    {t('health.favorites.emptyDesc')}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => onNavigate('dashboard')} className="bg-red-500 hover:bg-red-600 text-white">
                      {t('health.favorites.explore')}
                    </Button>
                    <Button variant="outline" onClick={handleAdicionarFavorito} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                      {t('health.favorites.addExample')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ABA DE HISTÓRICO REAL */}
      {activeTab === 'history' && (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <History className="h-6 w-6 text-purple-500" />
              {t('health.history.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.mealHistory?.length > 0 ? (
                dashboardData.mealHistory.map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                    onClick={() => {
                      setSelectedMeal(item);
                      setShowMealDetails(true);
                    }}
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.recipeTitle || `${t('health.history.meal')} ${idx + 1}`}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                          {item.mealType === 'breakfast' ? t('mealTypes.breakfast') :
                            item.mealType === 'lunch' ? t('mealTypes.lunch') :
                              item.mealType === 'dinner' ? t('mealTypes.dinner') :
                                item.mealType === 'snack' ? t('mealTypes.snack') : t('mealTypes.meal')}
                        </Badge>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(item.date || Date.now()).toLocaleDateString(t('code'), { year: 'numeric', month: 'numeric', day: 'numeric' })}
                        </span>
                        {item.mood && (
                          <span className="text-sm">{item.mood}</span>
                        )}
                        {item.rating && (
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < item.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      {item.ingredients && item.ingredients.length > 0 && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          {item.ingredients.slice(0, 2).join(', ')}
                          {item.ingredients.length > 2 && '...'}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <History className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    {t('health.history.empty')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500 mb-6">
                    {t('health.history.emptyDesc')}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={handleQuickAddMeal} variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                      <Plus className="mr-2 h-4 w-4" />
                      {t('health.history.quickAdd')}
                    </Button>
                    <Button onClick={handleFullAddMeal} className="bg-red-500 hover:bg-red-600 text-white">
                      <ChefHat className="mr-2 h-4 w-4" />
                      {t('health.history.addFirst')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botões de Ação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={handleQuickAddMeal}
          className="flex-1 bg-gradient-to-r from-red-600 to-pink-400 hover:from-red-700 hover:to-pink-500 text-white"
        >
          <Plus className="mr-2 h-5 w-5" />
          {t('health.quickAdd')}
        </Button>

        <Button
          onClick={handleFullAddMeal}
          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
        >
          <ChefHat className="mr-2 h-5 w-5" />
          {t('health.fullAdd')}
        </Button>
      </div>

      {/* Modais de registro de refeições */}
      <QuickMealModal
        isOpen={showQuickModal}
        onClose={() => setShowQuickModal(false)}
        onSave={handleSaveMeal}
        userId={user?.id || user?._id}
      />

      <FullMealModal
        isOpen={showFullModal}
        onClose={() => setShowFullModal(false)}
        onSave={handleSaveMeal}
        userId={user?.id || user?._id}
      />
      {/* Modal de detalhes da refeição */}
      {showMealDetails && selectedMeal && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            <MealHistoryDisplay
              meal={selectedMeal}
              onBack={() => {
                setShowMealDetails(false);
                setSelectedMeal(null);
              }}
              user={user}
              onToggleFavorite={(data) => {
                if (data.type === 'chat') {
                  if (onStartChat) {
                    onStartChat({
                      title: data.title || t('health.chatAboutMeal'),
                      type: 'meal-history-chat',
                      message: data.message,
                      source: 'meu-canto-saude-detalhes'
                    });
                  }
                }
                return false;
              }}
            />
          </div>
        </div>
      )}
      {/* Modal de Relatório Médico Profissional */}
      <RelatorioMedicoModal
        isOpen={showRelatorioModal}
        onClose={() => setShowRelatorioModal(false)}
        relatorio={relatorioData}
        user={user}
      />
    </div>
  );
};

export default MeuCantoDeSaude;