import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  ArrowLeft,
  Filter,
  Heart,
  Clock,
  Send,
  Plus,
  Image as ImageIcon,
  Flame,
  Calendar,
  CalendarDays,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import {
  criarObservacao,
  listarObservacoes,
  toggleFavorito,
  atualizarReadyToCook,
  enviarParaAssistente
} from '@/services/observacoesApi';
import { AgendarLembreteModal } from './AgendarLembreteModal';
import { PlanearRefeicaoModal } from './PlanearRefeicaoModal';

const ObservacoesPessoais = ({ onNavigate, onStartChat, user }) => {
  const { t } = useTranslation();
  const [observacoes, setObservacoes] = useState([]);
  const [filtroAtivo, setFiltroAtivo] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [marcandoId, setMarcandoId] = useState(null);
  const fileInputRef = useRef(null);
  const [agendamentoModal, setAgendamentoModal] = useState({ open: false, obs: null });
  const [planeamentoModal, setPlaneamentoModal] = useState({ open: false, obs: null });

  useEffect(() => {
    carregarObservacoes();
  }, [filtroAtivo]);

  const carregarObservacoes = async () => {
    try {
      setLoading(true);
      const userId = user?.id || user?._id;
      if (!userId) {
        toast({
          title: t('common.error'),
          description: t('observacoes.errors.userNotAuthenticated'),
          variant: "destructive"
        });
        return;
      }

      const data = await listarObservacoes(userId, {});

      let dataFiltrada = data;

      if (filtroAtivo === 'favoritas') {
        dataFiltrada = data.filter(obs => obs.favorite === true);
      }
      else if (filtroAtivo === 'doce') {
        dataFiltrada = data.filter(obs => obs.tags?.includes('doce'));
      }
      else if (filtroAtivo === 'salgado') {
        dataFiltrada = data.filter(obs => obs.tags?.includes('salgado'));
      }
      else if (filtroAtivo === 'agora') {
        dataFiltrada = data.filter(obs => obs.readyToCook === 'now');
      }
      else if (filtroAtivo === 'depois') {
        dataFiltrada = data.filter(obs => obs.readyToCook === 'later');
      }

      setObservacoes(dataFiltrada);
    } catch (error) {
      console.error('Erro ao carregar observações:', error);
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  // ===== RESUMO DAS RECEITAS PARA HOJE =====
  const receitasHoje = observacoes.filter(obs => obs.readyToCook === 'now');
  const receitasDepois = observacoes.filter(obs => obs.readyToCook === 'later');

  const handleUploadImagem = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', user?.id || user?._id);
      formData.append('imageType', 'recipe');
      formData.append('extractRecipe', 'true');
      const novaObs = await criarObservacao(formData);
      toast({
        title: t('observacoes.uploadSuccess'),
        description: t('observacoes.uploadSuccessDesc'),
      });
      await carregarObservacoes();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleToggleFavorito = async (obsId) => {
    try {
      await toggleFavorito(obsId);
      await carregarObservacoes();
      toast({ title: t('observacoes.favoriteUpdated') });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCozinharAgora = async (obs) => {
    try {
      setMarcandoId(obs._id);
      await atualizarReadyToCook(obs._id, 'now');
      await carregarObservacoes();
      if (user?.healthProfileId) {
        try {
          await registrarConsumoReceita(obs._id, user.id);
          console.log('Consumo registado para saúde');
        } catch (error) {
          console.error('Erro ao registar consumo:', error);
        }
      }
      toast({
        title: t('observacoes.readyNow'),
        description: t('observacoes.readyNowDesc', { title: obs.recipeData?.title || t('observacoes.recipe') }),
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEnviarAssistente(obs)}
            className="bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200"
          >
            <Send className="h-3 w-3 mr-1" />
            {t('observacoes.startCooking')}
          </Button>
        ),
        duration: 8000,
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setMarcandoId(null);
    }
  };

  const handleCozinharDepois = async (obs) => {
    setAgendamentoModal({ open: true, obs });
  };

  const handleConfirmarAgendamento = async (agendamento) => {
    const { obs } = agendamentoModal;
    try {
      setMarcandoId(obs._id);

      await atualizarReadyToCook(obs._id, 'later');

      if (agendamento.addListaCompras) {
        await adicionarIngredientesListaCompras(obs._id);
        toast({
          title: t('observacoes.shoppingListUpdated'),
          description: t('observacoes.shoppingListUpdatedDesc'),
        });
      }

      if (agendamento.data) {
        await agendarLembrete({
          receitaId: obs._id,
          titulo: obs.recipeData?.title,
          data: agendamento.data,
          hora: agendamento.hora
        });
        toast({
          title: t('observacoes.reminderScheduled'),
          description: t('observacoes.reminderScheduledDesc', { date: new Date(agendamento.data).toLocaleDateString('pt-PT'), time: agendamento.hora || '' }),
        });
      }

      await carregarObservacoes();

      toast({
        title: t('observacoes.savedForLater'),
        description: t('observacoes.savedForLaterDesc', { title: obs.recipeData?.title || t('observacoes.recipe') }),
        duration: 5000,
      });

    } catch (error) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setMarcandoId(null);
      setAgendamentoModal({ open: false, obs: null });
    }
  };

  const adicionarIngredientesListaCompras = async (obsId) => {
    console.log('Adicionar à lista de compras:', obsId);
    return Promise.resolve();
  };

  const agendarLembrete = async (lembrete) => {
    console.log('Agendar lembrete:', lembrete);
    return Promise.resolve();
  };

  const handleAdicionarPlaneamento = (obs) => {
    setPlaneamentoModal({ open: true, obs });
  };

  const handleConfirmarPlaneamento = async (plano) => {
    const { obs } = planeamentoModal;
    if (!obs) return;

    try {
      setMarcandoId(obs._id);

      const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");
      const userId = user?.id || user?._id;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/planeamento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipeId: obs._id,
          recipeTitle: obs.recipeData?.title || t('observacoes.recipe'),
          date: plano.date,
          mealType: plano.mealType
        })
      });

      if (!response.ok) {
        throw new Error(t('observacoes.errors.planningError'));
      }

      const data = await response.json();
      console.log('✅ Planeamento guardado:', data);

      toast({
        title: t('observacoes.mealPlanned'),
        description: t('observacoes.mealPlannedDesc', { title: obs.recipeData?.title, date: new Date(plano.date).toLocaleDateString('pt-PT'), mealType: plano.mealType }),
        variant: "default",
        duration: 5000
      });

      await atualizarReadyToCook(obs._id, 'later');
      await carregarObservacoes();

    } catch (error) {
      console.error('❌ Erro ao planear refeição:', error);
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setMarcandoId(null);
      setPlaneamentoModal({ open: false, obs: null });
    }
  };

  const handleEnviarAssistente = async (obs) => {
    try {
      const resposta = await enviarParaAssistente(obs._id);
      console.log("✅ Resposta do assistente:", resposta);

      if (resposta.tipo === 'guided_cooking') {
        onStartChat({
          mode: 'guided_cooking',
          sessionId: resposta.sessionId,
          title: resposta.receita.title,
          totalSteps: resposta.receita.totalSteps,
          initialMessage: resposta.mensagemInicial
        });

        toast({
          title: t('observacoes.guidedCookingStarted'),
          description: t('observacoes.guidedCookingStartedDesc', { title: resposta.receita.title }),
        });
      } else {
        onStartChat({
          title: obs.recipeData?.title || t('observacoes.recipe'),
          recipe: obs.recipeData
        });
      }
    } catch (error) {
      console.error('❌ Erro ao enviar para assistente:', error);
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleToggleTag = async (obsId, tag) => {
    try {
      const obs = observacoes.find(o => o._id === obsId);
      if (!obs) return;

      let novasTags = [...(obs.tags || [])];
      if (novasTags.includes(tag)) {
        novasTags = novasTags.filter(t => t !== tag);
      } else {
        novasTags.push(tag);
      }

      const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/observacoes/${obsId}/tags`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tags: novasTags })
      });

      if (!res.ok) throw new Error('Erro ao atualizar tags');

      await carregarObservacoes();

      toast({
        title: t('observacoes.tagUpdated'),
        description: t('observacoes.tagUpdatedDesc', { tag }),
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar tag:', error);
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filtros = [
    { id: 'todas', label: t('observacoes.filters.all') },
    { id: 'favoritas', label: t('observacoes.filters.favorites') },
    { id: 'doce', label: t('observacoes.filters.sweet') },
    { id: 'salgado', label: t('observacoes.filters.savory') },
    { id: 'agora', label: t('observacoes.filters.now') },
    { id: 'depois', label: t('observacoes.filters.later') }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:text-gray-200">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-6 rounded-2xl shadow-lg"
      >
        <Button
          variant="ghost"
          onClick={() => onNavigate('dashboard')}
          className="text-white hover:bg-white/20 mb-4"
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> {t('common.backToDashboard')}
        </Button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Camera className="h-8 w-8" /> {t('observacoes.title')}
            </h1>
            <p className="text-white/90 mt-2">{t('observacoes.subtitle')}</p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white text-orange-600 hover:bg-white/90 dark:bg-gray-800 dark:text-orange-400 dark:hover:bg-gray-700"
            disabled={uploadingImage}
          >
            <Plus className="mr-2 h-5 w-5" />
            {uploadingImage ? t('observacoes.uploading') : t('observacoes.addImage')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUploadImagem}
          />
        </div>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {filtros.map(filtro => (
          <Button
            key={filtro.id}
            variant={filtroAtivo === filtro.id ? "default" : "outline"}
            onClick={() => setFiltroAtivo(filtro.id)}
            className={`whitespace-nowrap ${filtroAtivo === filtro.id
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            {filtro.label}
          </Button>
        ))}
      </div>

      {/* ===== RESUMO ===== */}
      {(receitasHoje.length > 0 || receitasDepois.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Bloco HOJE */}
          {receitasHoje.length > 0 && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2 text-orange-800 dark:text-orange-300">
                  <Clock className="h-5 w-5" />
                  {t('observacoes.summary.today')}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiltroAtivo('agora')}
                  className="text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                >
                  {t('observacoes.summary.viewAll')} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-2">
                {receitasHoje.slice(0, 3).map(obs => (
                  <div key={obs._id} className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                      {obs.imageUrl ? (
                        <img src={obs.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-orange-100 dark:bg-orange-900/30">
                          <span className="text-xs">{t('observacoes.summary.fallbackIcon')}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {obs.recipeData?.title || t('observacoes.recipe')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                      onClick={() => handleEnviarAssistente(obs)}
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bloco DEPOIS */}
          {receitasDepois.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2 text-blue-800 dark:text-blue-300">
                  <Calendar className="h-5 w-5" />
                  {t('observacoes.summary.later')}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiltroAtivo('depois')}
                  className="text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                >
                  {t('observacoes.summary.viewAll')} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-2">
                {receitasDepois.slice(0, 3).map(obs => (
                  <div key={obs._id} className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                      {obs.imageUrl ? (
                        <img src={obs.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                          <span className="text-xs">⏰</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {obs.recipeData?.title || t('observacoes.recipe')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid de Observações */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {observacoes.map((obs) => (
          <motion.div
            key={obs._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
          >
            {/* Imagem */}
            <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
              {obs.imageUrl ? (
                <img
                  src={obs.imageUrl}
                  alt={t('observacoes.observationAlt')}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\' viewBox=\'0 0 400 300\'%3E%3Crect width=\'400\' height=\'300\' fill=\'%23374151\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' font-size=\'20\' font-family=\'Arial\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%239ca3af\'%3E' + t('observacoes.noImage') + '%3C/text%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                </div>
              )}
              <div className="absolute top-2 left-2 bg-black/50 dark:bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                {obs.imageType}
              </div>
              <button
                onClick={() => handleToggleFavorito(obs._id)}
                className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors"
              >
                <Heart
                  className={`h-5 w-5 ${obs.favorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}`}
                />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-4">
              {obs.recipeData?.title && (
                <h3 className="font-bold text-sm mb-2 line-clamp-2 text-gray-900 dark:text-white">
                  {obs.recipeData.title}
                </h3>
              )}
              {/* TAGS + BOTÃO DE EDIÇÃO */}
              <div className="flex gap-1 mb-2 flex-wrap items-center">
                {obs.tags?.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}

                {/* BOTÃO PARA ALTERNAR DOCE/SALGADO */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                      <Plus className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <DropdownMenuItem
                      onClick={() => handleToggleTag(obs._id, 'doce')}
                      className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {obs.tags?.includes('doce') ? t('observacoes.removeSweet') : t('observacoes.addSweet')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleToggleTag(obs._id, 'salgado')}
                      className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {obs.tags?.includes('salgado') ? t('observacoes.removeSavory') : t('observacoes.addSavory')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {obs.notes?.length > 0 && (
                <div className="mb-3 space-y-1">
                  {obs.notes.slice(0, 2).map((note, idx) => (
                    <p key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                      {note.emoji} {note.content}
                    </p>
                  ))}
                </div>
              )}

              {/* AÇÕES */}
              <div className="flex gap-2">
                {obs.recipeData && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleEnviarAssistente(obs)}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    {t('observacoes.assistant')}
                  </Button>
                )}

                {obs.readyToCook === 'now' ? (
                  <Button
                    size="sm"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    disabled
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    {t('observacoes.now')}
                  </Button>
                ) : obs.readyToCook === 'later' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-amber-500 dark:border-amber-600 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    disabled
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    {t('observacoes.later')}
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        disabled={marcandoId === obs._id}
                      >
                        {marcandoId === obs._id ? (
                          <span className="flex items-center gap-1">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-orange-600" />
                            {t('observacoes.marking')}
                          </span>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 mr-1" />
                            {t('observacoes.mark')}
                          </>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <DropdownMenuItem
                        onClick={() => handleCozinharAgora(obs)}
                        className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Flame className="h-4 w-4 mr-2 text-orange-500" />
                        <span>{t('observacoes.cookNow')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleCozinharDepois(obs)}
                        className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                        <span>{t('observacoes.cookLater')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAdicionarPlaneamento(obs)}
                        className="cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <CalendarDays className="h-4 w-4 mr-2 text-purple-500" />
                        <span>{t('observacoes.planMeal')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Estado vazio */}
      {observacoes.length === 0 && (
        <div className="text-center py-16">
          <Camera className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            {t('observacoes.empty.title')}
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-6">
            {t('observacoes.empty.description')}
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="mr-2 h-5 w-5" />
            {t('observacoes.empty.button')}
          </Button>
        </div>
      )}
      {/* Modal de agendamento */}
      <AgendarLembreteModal
        open={agendamentoModal.open}
        onClose={() => setAgendamentoModal({ open: false, obs: null })}
        onConfirm={handleConfirmarAgendamento}
        recipeTitle={agendamentoModal.obs?.recipeData?.title || t('observacoes.recipe')}
      />
      {/* Modal de planeamento */}
      <PlanearRefeicaoModal
        open={planeamentoModal.open}
        onClose={() => setPlaneamentoModal({ open: false, obs: null })}
        onConfirm={handleConfirmarPlaneamento}
        recipeTitle={planeamentoModal.obs?.recipeData?.title || t('observacoes.recipe')}
      />
    </div>
  );
};

export default ObservacoesPessoais;