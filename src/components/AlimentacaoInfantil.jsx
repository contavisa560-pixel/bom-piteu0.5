import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Baby, ArrowLeft, Plus, Sparkles, Camera, BarChart3, User, Upload, X, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { criarPerfil, listarPerfisPorTipo, gerarReceitaAdaptada, adicionarReceitaPerfil, gerarReceitaAdaptadaParaPerfil, criarSessaoDeReceita } from '@/services/profilesApi';
import { iniciarPassoAPasso } from '@/services/profilesApi';
import ReceitaDetalheModal from './ReceitaDetalheModal';
import CameraModal from './CameraModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AlimentacaoInfantil = ({ onNavigate, onStartChat, user }) => {
  const { t } = useTranslation();
  const [perfis, setPerfis] = useState([]);
  const [perfilSelecionado, setPerfilSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNovoPerfil, setShowNovoPerfil] = useState(false);
  const [filtroTemporal, setFiltroTemporal] = useState('todas');
  const [filtroRefeicao, setFiltroRefeicao] = useState('todas');
  const [gerando, setGerando] = useState(false);
  const [gerandoReceita, setGerandoReceita] = useState(false);
  const [showPedidoModal, setShowPedidoModal] = useState(false);
  const [pedidoTexto, setPedidoTexto] = useState('');
  const [tipoRefeicao, setTipoRefeicao] = useState('todas');
  const [numPessoas, setNumPessoas] = useState(2);
  const [ingredientesDisponiveis, setIngredientesDisponiveis] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [showRefeicaoModal, setShowRefeicaoModal] = useState(false);
  const [refeicaoTipo, setRefeicaoTipo] = useState('breakfast');
  const [refeicaoNota, setRefeicaoNota] = useState('');
  const [editandoPerfil, setEditandoPerfil] = useState(null);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [showProgressoModal, setShowProgressoModal] = useState(false);
  const [receitaSelecionada, setReceitaSelecionada] = useState(null);
  const [showReceitaModal, setShowReceitaModal] = useState(false);
  const [novoPerfil, setNovoPerfil] = useState({
    name: '',
    birthDate: null,
    country: 'PT',
    allergies: [],
    intolerances: [],
    healthObservations: [],
    profileImage: null,
    profileImagePreview: '',
    otherAllergies: '',
    otherIntolerances: ''
  });

  // Logs de debug (opcional)
  useEffect(() => {
    console.log('showPedidoModal mudou para:', showPedidoModal);
  }, [showPedidoModal]);

  // Listas pré-definidas (para o formulário de criação/edição)
  const commonAllergies = [
    t('allergies.peanut'),
    t('allergies.treeNuts'),
    t('allergies.milk'),
    t('allergies.egg'),
    t('allergies.soy'),
    t('allergies.wheat'),
    t('allergies.fish'),
    t('allergies.shellfish'),
    t('allergies.sesame'),
    t('allergies.mustard')
  ];

  const commonIntolerances = [
    t('intolerances.lactose'),
    t('intolerances.gluten'),
    t('intolerances.histamine'),
    t('intolerances.fructose'),
    t('intolerances.caffeine')
  ];

  useEffect(() => {
    carregarPerfis();
  }, []);

  const carregarPerfis = async () => {
    try {
      setLoading(true);
      const data = await listarPerfisPorTipo('infantil');
      setPerfis(data);

      if (data.length > 0 && !perfilSelecionado) {
        setPerfilSelecionado(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageUpload = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setNovoPerfil(prev => ({
        ...prev,
        profileImagePreview: reader.result,
        profileImage: file
      }));
    };
    reader.readAsDataURL(file);
  };

  const toggleAllergy = (allergy) => {
    setNovoPerfil(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }));
  };

  const toggleIntolerance = (intolerance) => {
    setNovoPerfil(prev => ({
      ...prev,
      intolerances: prev.intolerances.includes(intolerance)
        ? prev.intolerances.filter(i => i !== intolerance)
        : [...prev.intolerances, intolerance]
    }));
  };

  const resetNovoPerfil = () => {
    setNovoPerfil({
      name: '',
      birthDate: null,
      country: 'PT',
      allergies: [],
      intolerances: [],
      healthObservations: [],
      profileImage: null,
      profileImagePreview: '',
      otherAllergies: '',
      otherIntolerances: ''
    });
  };

  const handleCriarPerfil = async (e) => {
    e.preventDefault();

    try {
      if (!novoPerfil.name || !novoPerfil.birthDate) {
        toast({
          title: t('alimentacaoInfantil.errors.requiredFields'),
          description: t('alimentacaoInfantil.errors.requiredFieldsDesc'),
          variant: "destructive"
        });
        return;
      }

      setSalvandoPerfil(true);

      const formData = new FormData();
      formData.append('name', novoPerfil.name);
      formData.append('type', 'infantil');
      formData.append('birthDate', new Date(novoPerfil.birthDate).toISOString());
      formData.append('country', novoPerfil.country);
      formData.append('allergies', JSON.stringify(novoPerfil.allergies));
      formData.append('intolerances', JSON.stringify(novoPerfil.intolerances));
      formData.append('healthObservations', JSON.stringify(novoPerfil.healthObservations));

      if (novoPerfil.profileImage) {
        formData.append('profileImage', novoPerfil.profileImage);
      }

      const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error(t('alimentacaoInfantil.errors.createProfileError'));

      await carregarPerfis();

      toast({
        title: t('alimentacaoInfantil.success.profileCreated'),
        description: t('alimentacaoInfantil.success.profileCreatedDesc', { name: novoPerfil.name })
      });

      setShowNovoPerfil(false);
      resetNovoPerfil();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSalvandoPerfil(false);
    }
  };

  const getMealTypeByHour = () => {
    const hora = new Date().getHours();
    if (hora < 11) return 'breakfast';
    if (hora < 15) return 'lunch';
    if (hora < 19) return 'dinner';
    return 'snack';
  };

  const getMealTypeText = (type) => {
    const types = {
      breakfast: t('alimentacaoInfantil.mealTypes.breakfast'),
      lunch: t('alimentacaoInfantil.mealTypes.lunch'),
      dinner: t('alimentacaoInfantil.mealTypes.dinner'),
      snack: t('alimentacaoInfantil.mealTypes.snack')
    };
    return types[type] || t('alimentacaoInfantil.mealTypes.meal');
  };

  const handleGerarReceita = async () => {
    if (!perfilSelecionado || gerandoReceita) return;
    setGerandoReceita(true);

    try {
      const recipeData = await gerarReceitaAdaptadaParaPerfil(perfilSelecionado._id, 1);
      const finalImage = recipeData.finalImage;

      const dadosSessao = {
        titulo: recipeData.title,
        descricao: recipeData.description,
        ingredientes: recipeData.ingredients,
        passos: recipeData.steps,
        tempo: recipeData.time,
        dificuldade: recipeData.difficulty,
        imagemUrl: null
      };

      const { sessionId } = await criarSessaoDeReceita(dadosSessao);

      const mealType = getMealTypeByHour();
      const simplifiedRecipe = {
        mealType,
        notes: [{ content: recipeData.title, emoji: "_" }],
        imageUrl: finalImage || '/default-recipe.jpg',
        quantity: 1,
        readyToCook: 'false',
        ingredients: recipeData.ingredients || [],
        steps: recipeData.steps || [],
        time: recipeData.time || '30 min',
        difficulty: recipeData.difficulty || t('alimentacaoInfantil.difficulty.medium')
      };
      const saved = await adicionarReceitaPerfil(perfilSelecionado._id, simplifiedRecipe);

      setPerfilSelecionado(prev => ({
        ...prev,
        recipes: [...prev.recipes, saved.recipe]
      }));
      setPerfis(prev => prev.map(p =>
        p._id === perfilSelecionado._id
          ? { ...p, recipes: [...p.recipes, saved.recipe] }
          : p
      ));

      onStartChat({
        title: recipeData.title,
        recipe: recipeData,
        sessionId: sessionId,
        totalPassos: recipeData.steps.length,
        podeIniciarPassoAPasso: true,
        mensagemInicio: t('alimentacaoInfantil.chat.startMessage', { title: recipeData.title }),
        source: 'receita_criada',
        finalImage: finalImage
      });

      toast({ title: t('alimentacaoInfantil.success.recipeGenerated'), description: t('alimentacaoInfantil.success.recipeGeneratedDesc', { title: recipeData.title }) });
    } catch (error) {
      console.error(error);
      toast({ title: t('common.error'), description: error.message, variant: "destructive" });
    } finally {
      setGerandoReceita(false);
    }
  };

  const handleGerarReceitaComPedido = async () => {
    console.log('1. Iniciou handleGerarReceitaComPedido');
    if (!perfilSelecionado || gerandoReceita || !pedidoTexto.trim()) {
      console.log('2. Condições não satisfeitas');
      return;
    }
    setGerandoReceita(true);
    console.log('3. setGerandoReceita true');
    try {
      console.log('4. Chamando API com pedido:', pedidoTexto);

      const ingredientesArray = ingredientesDisponiveis
        ? ingredientesDisponiveis.split(',').map(i => i.trim()).filter(i => i)
        : [];

      const options = {
        userRequest: pedidoTexto,
        mealType: tipoRefeicao !== 'todas' ? tipoRefeicao : undefined,
        availableIngredients: ingredientesArray
      };

      const recipeData = await gerarReceitaAdaptadaParaPerfil(
        perfilSelecionado._id,
        numPessoas,
        options
      );
      console.log('5. Resposta da API:', recipeData);
      const finalImage = recipeData.finalImage;

      const dadosSessao = {
        titulo: recipeData.title,
        descricao: recipeData.description,
        ingredientes: recipeData.ingredients,
        passos: recipeData.steps,
        tempo: recipeData.time,
        dificuldade: recipeData.difficulty,
        imagemUrl: null
      };
      const { sessionId } = await criarSessaoDeReceita(dadosSessao);

      const mealTypeParaSalvar = tipoRefeicao !== 'todas' ? tipoRefeicao : getMealTypeByHour();
      const simplifiedRecipe = {
        mealType: mealTypeParaSalvar,
        notes: [{ content: recipeData.title, emoji: "_" }],
        imageUrl: finalImage || '/default-recipe.jpg',
        quantity: numPessoas,
        readyToCook: 'false',
        ingredients: recipeData.ingredients || [],
        steps: recipeData.steps || [],
        time: recipeData.time || '30 min',
        difficulty: recipeData.difficulty || t('alimentacaoInfantil.difficulty.medium')
      };
      const saved = await adicionarReceitaPerfil(perfilSelecionado._id, simplifiedRecipe);

      setPerfilSelecionado(prev => ({
        ...prev,
        recipes: [...prev.recipes, saved.recipe]
      }));
      setPerfis(prev => prev.map(p =>
        p._id === perfilSelecionado._id
          ? { ...p, recipes: [...p.recipes, saved.recipe] }
          : p
      ));

      onStartChat({
        title: recipeData.title,
        recipe: recipeData,
        sessionId: sessionId,
        totalPassos: recipeData.steps.length,
        podeIniciarPassoAPasso: true,
        mensagemInicio: t('alimentacaoInfantil.chat.startMessage', { title: recipeData.title }),
        source: 'receita_criada',
        finalImage: finalImage
      });

      setShowPedidoModal(false);
      setPedidoTexto('');
      setTipoRefeicao('todas');
      setNumPessoas(2);
      setIngredientesDisponiveis('');
      toast({ title: t('alimentacaoInfantil.success.recipeGenerated'), description: t('alimentacaoInfantil.success.recipeGeneratedDesc', { title: recipeData.title }) });
    } catch (error) {
      console.error('6. Erro capturado:', error);
      toast({ title: t('common.error'), description: error.message, variant: "destructive" });
    } finally {
      setGerandoReceita(false);
    }
  };

  const handleCameraCapture = async (dataUrl) => {
    setShowCamera(false);

    if (!dataUrl || !perfilSelecionado) return;

    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], "refeicao.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("image", file);
      formData.append("mealType", refeicaoTipo);
      formData.append("quantity", 1);
      formData.append("readyToCook", "false");

      const notaFinal = refeicaoNota.trim() ? refeicaoNota : t('alimentacaoInfantil.defaultMealNote');
      formData.append("notes", JSON.stringify([{ content: notaFinal, emoji: "#" }]));

      formData.append("ingredients", JSON.stringify([]));
      formData.append("steps", JSON.stringify([]));
      formData.append("time", "30 min");
      formData.append("difficulty", t('alimentacaoInfantil.difficulty.medium'));

      const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles/${perfilSelecionado._id}/recipe`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error(t('alimentacaoInfantil.errors.saveMealError'));

      const result = await res.json();

      setPerfilSelecionado(prev => ({
        ...prev,
        recipes: [...prev.recipes, result.recipe]
      }));
      setPerfis(prev => prev.map(p =>
        p._id === perfilSelecionado._id
          ? { ...p, recipes: [...p.recipes, result.recipe] }
          : p
      ));

      toast({ title: t('alimentacaoInfantil.success.mealAdded'), description: t('alimentacaoInfantil.success.mealAddedDesc') });
    } catch (error) {
      console.error(error);
      toast({ title: t('common.error'), description: error.message, variant: "destructive" });
    }
  };

  const handleAdicionarRefeicao = () => {
    if (!perfilSelecionado) {
      toast({ title: t('alimentacaoInfantil.errors.selectProfile'), variant: "destructive" });
      return;
    }
    setRefeicaoTipo('breakfast');
    setRefeicaoNota('');
    setShowRefeicaoModal(true);
  };

  const handleContinuarParaCamera = () => {
    setShowRefeicaoModal(false);
    setShowCamera(true);
  };

  const calcularEstatisticas = () => {
    if (!perfilSelecionado || !perfilSelecionado.recipes) {
      return {
        totalRefeicoes: 0,
        porTipo: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
        ultimaSemana: 0,
        comImagem: 0
      };
    }

    const receitas = perfilSelecionado.recipes;
    const agora = new Date();
    const umaSemanaAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = {
      totalRefeicoes: receitas.length,
      porTipo: {
        breakfast: receitas.filter(r => r.mealType === 'breakfast').length,
        lunch: receitas.filter(r => r.mealType === 'lunch').length,
        dinner: receitas.filter(r => r.mealType === 'dinner').length,
        snack: receitas.filter(r => r.mealType === 'snack').length,
      },
      ultimaSemana: receitas.filter(r => new Date(r.createdAt) >= umaSemanaAtras).length,
      comImagem: receitas.filter(r => r.imageUrl && r.imageUrl !== '/default-recipe.jpg').length
    };

    return stats;
  };

  const handleVerProgresso = () => {
    if (!perfilSelecionado) {
      toast({ title: t('alimentacaoInfantil.errors.selectProfile'), variant: "destructive" });
      return;
    }
    setShowProgressoModal(true);
  };

  const handleVerReceita = (receita) => {
    setReceitaSelecionada(receita);
    setShowReceitaModal(true);
  };

  const handleCozinharReceita = async (receita) => {
    try {
      setGerandoReceita(true);

      const dadosSessao = {
        titulo: receita.notes?.[0]?.content || t('alimentacaoInfantil.recipe'),
        descricao: t('alimentacaoInfantil.recipeDescription', { mealType: getMealTypeText(receita.mealType) }),
        ingredientes: receita.ingredients || [],
        passos: receita.steps || [t('alimentacaoInfantil.steps.prepare'), t('alimentacaoInfantil.steps.cook'), t('alimentacaoInfantil.steps.serve')],
        tempo: receita.time || '30 min',
        dificuldade: receita.difficulty || t('alimentacaoInfantil.difficulty.medium'),
        imagemUrl: receita.imageUrl || null
      };

      const { sessionId } = await criarSessaoDeReceita(dadosSessao);

      setShowReceitaModal(false);

      onStartChat({
        title: dadosSessao.titulo,
        recipe: {
          title: dadosSessao.titulo,
          ingredients: dadosSessao.ingredientes,
          steps: dadosSessao.passos.map((desc, idx) => ({
            stepNumber: idx + 1,
            description: desc
          })),
          time: dadosSessao.tempo,
          difficulty: dadosSessao.dificuldade,
          finalImage: receita.imageUrl
        },
        sessionId: sessionId,
        totalPassos: dadosSessao.passos.length,
        podeIniciarPassoAPasso: true,
        mensagemInicio: t('alimentacaoInfantil.chat.startMessage', { title: dadosSessao.titulo }),
        source: 'receita_criada',
        finalImage: receita.imageUrl
      });

    } catch (error) {
      console.error('Erro ao iniciar cozinhar:', error);
      toast({ title: t('common.error'), description: t('alimentacaoInfantil.errors.startCookingError'), variant: "destructive" });
    } finally {
      setGerandoReceita(false);
    }
  };

  const handleEditarPerfil = (perfil) => {
    setNovoPerfil({
      name: perfil.name,
      birthDate: perfil.birthDate ? perfil.birthDate.split('T')[0] : '',
      country: perfil.country || 'PT',
      allergies: perfil.allergies || [],
      intolerances: perfil.intolerances || [],
      healthObservations: perfil.healthObservations || [],
      profileImage: null,
      profileImagePreview: perfil.profileImage || '',
      otherAllergies: '',
      otherIntolerances: ''
    });
    setEditandoPerfil(perfil);
    setShowEditarModal(true);
  };

  const handleAtualizarPerfil = async (e) => {
    e.preventDefault();
    if (!editandoPerfil) return;

    try {
      const formData = new FormData();
      formData.append('name', novoPerfil.name);
      formData.append('type', 'infantil');
      formData.append('birthDate', new Date(novoPerfil.birthDate).toISOString());
      formData.append('country', novoPerfil.country);
      formData.append('allergies', JSON.stringify(novoPerfil.allergies));
      formData.append('intolerances', JSON.stringify(novoPerfil.intolerances));
      formData.append('healthObservations', JSON.stringify(novoPerfil.healthObservations));

      if (novoPerfil.profileImage) {
        formData.append('profileImage', novoPerfil.profileImage);
      }

      const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles/${editandoPerfil._id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error(t('alimentacaoInfantil.errors.updateProfileError'));

      const perfilAtualizado = await res.json();

      setPerfis(prev => prev.map(p => p._id === perfilAtualizado._id ? perfilAtualizado : p));
      if (perfilSelecionado?._id === perfilAtualizado._id) {
        setPerfilSelecionado(perfilAtualizado);
      }

      toast({ title: t('alimentacaoInfantil.success.profileUpdated'), description: t('alimentacaoInfantil.success.profileUpdatedDesc', { name: novoPerfil.name }) });
      setShowEditarModal(false);
      setEditandoPerfil(null);
      resetNovoPerfil();
    } catch (error) {
      toast({ title: t('common.error'), description: error.message, variant: "destructive" });
    }
  };

  const handleExcluirPerfil = async (perfilId) => {
    const perfil = perfis.find(p => p._id === perfilId);
    if (!confirm(t('alimentacaoInfantil.confirm.deleteProfile', { name: perfil?.name }))) return;

    try {
      const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles/${perfilId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error(t('alimentacaoInfantil.errors.deleteProfileError'));

      setPerfis(prev => prev.filter(p => p._id !== perfilId));
      if (perfilSelecionado?._id === perfilId) {
        setPerfilSelecionado(perfis.length > 1 ? perfis[0] : null);
      }

      toast({ title: t('alimentacaoInfantil.success.profileDeleted'), description: t('alimentacaoInfantil.success.profileDeletedDesc') });
    } catch (error) {
      toast({ title: t('common.error'), description: error.message, variant: "destructive" });
    }
  };

  const filtrarReceitas = (receitas) => {
    if (!receitas) return [];
    let filtered = [...receitas];

    if (filtroTemporal !== 'todas') {
      const agora = new Date();
      const umaSemanaAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
      const umMesAtras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(r => {
        const dataReceita = new Date(r.createdAt);
        if (filtroTemporal === 'semana') return dataReceita >= umaSemanaAtras;
        if (filtroTemporal === 'mes') return dataReceita >= umMesAtras;
        return true;
      });
    }

    if (filtroRefeicao !== 'todas') {
      filtered = filtered.filter(r => r.mealType === filtroRefeicao);
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const receitasFiltradas = perfilSelecionado ? filtrarReceitas(perfilSelecionado.recipes) : [];

  return (
    <div className="space-y-6 px-4 md:px-6 dark:text-gray-200">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-6 rounded-2xl shadow-lg"
      >
        <Button
          variant="ghost"
          onClick={() => onNavigate('dashboard')}
          className="text-white hover:bg-white/20 mb-4"
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> {t('common.backToDashboard')}
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Baby className="h-8 w-8" /> {t('alimentacaoInfantil.title')}
        </h1>
        <p className="text-white/90 mt-2">{t('alimentacaoInfantil.subtitle')}</p>
      </motion.div>

      {/* Seletor de Perfis */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <User className="h-6 w-6 text-teal-500 dark:text-teal-400" />
            {t('alimentacaoInfantil.profilesTitle')}
          </CardTitle>

          <Button
            size="sm"
            onClick={() => setShowNovoPerfil(true)}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> {t('alimentacaoInfantil.newProfile')}
          </Button>

        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {perfis.map((perfil) => (
              <motion.div
                key={perfil._id}
                whileHover={{ scale: 1.05 }}
                className={`p-4 rounded-xl cursor-pointer transition-all relative ${perfilSelecionado?._id === perfil._id
                  ? 'bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/50 dark:to-cyan-900/50 border-2 border-teal-500 dark:border-teal-400'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {/* Menu de opções */}
                <div className="absolute top-2 right-2 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); handleEditarPerfil(perfil); }}
                        className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Edit className="mr-2 h-4 w-4" /> {t('common.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); handleExcluirPerfil(perfil._id); }}
                        className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> {t('common.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="text-center" onClick={() => setPerfilSelecionado(perfil)}>
                  <div className="text-4xl mb-2 flex justify-center">
                    {perfil.profileImage ? (
                      <img src={perfil.profileImage} alt={perfil.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
                    ) : (
                      '👧'
                    )}
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white truncate">{perfil.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('alimentacaoInfantil.age', { years: new Date().getFullYear() - new Date(perfil.birthDate).getFullYear() })}
                  </p>
                  {perfil.allergies?.length > 0 && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 truncate">
                      ⚠️ {perfil.allergies[0]}
                      {perfil.allergies.length > 1 && ` +${perfil.allergies.length - 1}`}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição de Perfil */}
      <Dialog open={showEditarModal} onOpenChange={setShowEditarModal}>
        <DialogContent className="sm:max-w-lg w-[95vw] max-h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-lg font-bold text-teal-700">{t('alimentacaoInfantil.editProfile')}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAtualizarPerfil} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Header com foto */}
              <div className="flex items-center gap-4 bg-teal-50/50 p-3 rounded-xl border border-teal-100">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-white border-2 border-teal-500 shadow-sm">
                    {novoPerfil.profileImagePreview ? (
                      <img src={novoPerfil.profileImagePreview} alt={t('alimentacaoInfantil.previewAlt')} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">👧</div>
                    )}
                  </div>
                  <label htmlFor="edit-profile-image" className="absolute -bottom-1 -right-1 bg-teal-600 text-white p-1 rounded-full cursor-pointer shadow-lg">
                    <Upload className="h-3 w-3" />
                    <input
                      id="edit-profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProfileImageUpload(file);
                      }}
                    />
                  </label>
                </div>

                <div className="flex-1 space-y-2">
                  <Input
                    value={novoPerfil.name}
                    onChange={(e) => setNovoPerfil({ ...novoPerfil, name: e.target.value })}
                    placeholder={t('alimentacaoInfantil.childNamePlaceholder')}
                    required
                    className="h-8 text-sm bg-white"
                  />
                  <Input
                    type="date"
                    value={novoPerfil.birthDate ? novoPerfil.birthDate.split('T')[0] : ''}
                    onChange={(e) => setNovoPerfil({ ...novoPerfil, birthDate: e.target.value })}
                    required
                    className="h-8 text-sm bg-white"
                  />
                </div>
              </div>

              {/* Alergias */}
              <div className="space-y-2 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                <Label className="text-[11px] uppercase tracking-wider font-bold text-gray-500">{t('alimentacaoInfantil.allergies')}</Label>
                <select
                  className="w-full h-8 px-2 rounded-md border border-input bg-white text-xs outline-none focus:ring-1 focus:ring-teal-500"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !novoPerfil.allergies.includes(val)) toggleAllergy(val);
                    e.target.value = "";
                  }}
                >
                  <option value="">{t('alimentacaoInfantil.addCommon')}...</option>
                  {commonAllergies.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <div className="flex flex-wrap gap-1.5">
                  {novoPerfil.allergies.map(a => (
                    <span key={a} className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-medium border border-red-200">
                      {a} <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => toggleAllergy(a)} />
                    </span>
                  ))}
                </div>
                <Input
                  placeholder={t('alimentacaoInfantil.otherAllergyPlaceholder')}
                  value={novoPerfil.otherAllergies || ''}
                  className="h-7 text-[10px] bg-transparent border-dashed"
                  onChange={(e) => setNovoPerfil(prev => ({ ...prev, otherAllergies: e.target.value }))}
                />
              </div>

              {/* Intolerâncias */}
              <div className="space-y-2 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                <Label className="text-[11px] uppercase tracking-wider font-bold text-gray-500">{t('alimentacaoInfantil.intolerances')}</Label>
                <select
                  className="w-full h-8 px-2 rounded-md border border-input bg-white text-xs outline-none focus:ring-1 focus:ring-teal-500"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !novoPerfil.intolerances.includes(val)) toggleIntolerance(val);
                    e.target.value = "";
                  }}
                >
                  <option value="">{t('alimentacaoInfantil.addCommon')}...</option>
                  {commonIntolerances.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                <div className="flex flex-wrap gap-1.5">
                  {novoPerfil.intolerances.map(i => (
                    <span key={i} className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-medium border border-amber-200">
                      {i} <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => toggleIntolerance(i)} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Saúde */}
              <div className="space-y-1">
                <Label htmlFor="edit-health" className="text-[11px] font-bold text-gray-500 uppercase">{t('alimentacaoInfantil.healthObservations')}</Label>
                <Input
                  id="edit-health"
                  value={novoPerfil.healthObservations.join(', ')}
                  onChange={(e) => {
                    const obs = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setNovoPerfil({ ...novoPerfil, healthObservations: obs });
                  }}
                  placeholder={t('alimentacaoInfantil.healthPlaceholder')}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="p-3 border-t flex gap-2 bg-white">
              <Button variant="ghost" onClick={() => { setShowEditarModal(false); resetNovoPerfil(); }} type="button" className="flex-1 h-9 text-xs">
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="flex-1 h-9 text-xs bg-teal-600 hover:bg-teal-700 shadow-sm">
                {t('common.save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {perfilSelecionado && (
        <>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="w-full sm:w-auto">
              <Label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">{t('alimentacaoInfantil.period')}</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'todas', label: t('alimentacaoInfantil.all') },
                  { id: 'semana', label: t('alimentacaoInfantil.lastWeek') },
                  { id: 'mes', label: t('alimentacaoInfantil.lastMonth') }
                ].map(filtro => (
                  <Button
                    key={filtro.id}
                    size="sm"
                    variant={filtroTemporal === filtro.id ? "default" : "outline"}
                    onClick={() => setFiltroTemporal(filtro.id)}
                    className={
                      filtroTemporal === filtro.id
                        ? 'bg-teal-500 text-white hover:bg-teal-600'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  >
                    {filtro.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <Label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">{t('alimentacaoInfantil.mealType')}</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'todas', label: t('alimentacaoInfantil.all') },
                  { id: 'breakfast', label: t('alimentacaoInfantil.mealTypes.breakfast') },
                  { id: 'lunch', label: t('alimentacaoInfantil.mealTypes.lunch') },
                  { id: 'dinner', label: t('alimentacaoInfantil.mealTypes.dinner') },
                  { id: 'snack', label: t('alimentacaoInfantil.mealTypes.snack') }
                ].map(tipo => (
                  <Button
                    key={tipo.id}
                    size="sm"
                    variant={filtroRefeicao === tipo.id ? "default" : "outline"}
                    onClick={() => setFiltroRefeicao(tipo.id)}
                    className={
                      filtroRefeicao === tipo.id
                        ? 'bg-teal-500 text-white hover:bg-teal-600'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  >
                    {tipo.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Receitas */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">
                {t('alimentacaoInfantil.recipesTitle', { name: perfilSelecionado.name, count: receitasFiltradas.length })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {receitasFiltradas.map((receita, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleVerReceita(receita)}
                    className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-600"
                  >
                    <div className="h-32 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/50 dark:to-cyan-900/50 flex items-center justify-center overflow-hidden">
                      {receita.imageUrl && receita.imageUrl !== '/default-recipe.jpg' ? (
                        <img
                          src={receita.imageUrl}
                          alt={receita.notes?.[0]?.content || t('alimentacaoInfantil.recipe')}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span class="text-4xl">🍽️</span>';
                          }}
                        />
                      ) : (
                        <span className="text-4xl">🍽️</span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm mb-1 line-clamp-1 text-gray-900 dark:text-white">
                        {getMealTypeText(receita.mealType)}
                      </p>
                      {receita.notes?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                            {receita.notes[0].emoji} {receita.notes[0].content}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {new Date(receita.createdAt).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              {receitasFiltradas.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">{t('alimentacaoInfantil.noRecipes', { name: perfilSelecionado.name })}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              onClick={() => setShowPedidoModal(true)}
              disabled={gerandoReceita}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white w-full"
            >
              {gerandoReceita ? t('alimentacaoInfantil.generating') : <><Sparkles className="mr-2 h-5 w-5" /> {t('alimentacaoInfantil.generateRecipe')}</>}
            </Button>
            <Button
              variant="outline"
              className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleAdicionarRefeicao}
              disabled={!perfilSelecionado}
            >
              <Camera className="mr-2 h-5 w-5" /> {t('alimentacaoInfantil.addMeal')}
            </Button>
            <Button
              variant="outline"
              className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleVerProgresso}
              disabled={!perfilSelecionado}
            >
              <BarChart3 className="mr-2 h-5 w-5" /> {t('alimentacaoInfantil.viewProgress')}
            </Button>
          </div>

          {/* Modais */}
          <CameraModal open={showCamera} onClose={() => setShowCamera(false)} onCapture={handleCameraCapture} />

          <Dialog open={showPedidoModal} onOpenChange={setShowPedidoModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('alimentacaoInfantil.requestRecipeTitle')}</DialogTitle>
                <p className="text-sm text-gray-500">{t('alimentacaoInfantil.requestRecipeDesc')}</p>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoRefeicao">{t('alimentacaoInfantil.mealType')}</Label>
                  <select
                    id="tipoRefeicao"
                    value={tipoRefeicao}
                    onChange={(e) => setTipoRefeicao(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="todas">{t('alimentacaoInfantil.any')}</option>
                    <option value="breakfast">{t('alimentacaoInfantil.mealTypes.breakfast')}</option>
                    <option value="lunch">{t('alimentacaoInfantil.mealTypes.lunch')}</option>
                    <option value="dinner">{t('alimentacaoInfantil.mealTypes.dinner')}</option>
                    <option value="snack">{t('alimentacaoInfantil.mealTypes.snack')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numPessoas">{t('alimentacaoInfantil.numberOfPeople')}</Label>
                  <Input
                    id="numPessoas"
                    type="number"
                    min="1"
                    max="10"
                    value={numPessoas}
                    onChange={(e) => setNumPessoas(parseInt(e.target.value) || 1)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ingredientes">{t('alimentacaoInfantil.availableIngredients')} <span className="text-gray-400 text-xs">{t('alimentacaoInfantil.optional')}</span></Label>
                  <textarea
                    id="ingredientes"
                    value={ingredientesDisponiveis}
                    onChange={(e) => setIngredientesDisponiveis(e.target.value)}
                    placeholder={t('alimentacaoInfantil.ingredientsPlaceholder')}
                    className="w-full h-20 p-2 border rounded-md focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-xs text-gray-400">{t('alimentacaoInfantil.ingredientsSeparator')}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pedido" className="font-semibold">{t('alimentacaoInfantil.whatToCook')} <span className="text-red-500">*</span></Label>
                  <textarea
                    id="pedido"
                    value={pedidoTexto}
                    onChange={(e) => setPedidoTexto(e.target.value)}
                    placeholder={t('alimentacaoInfantil.whatToCookPlaceholder')}
                    className="w-full h-24 p-2 border rounded-md focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowPedidoModal(false)}>{t('common.cancel')}</Button>
                <Button onClick={handleGerarReceitaComPedido} disabled={!pedidoTexto.trim() || gerandoReceita} className="bg-teal-600 hover:bg-teal-700">
                  {gerandoReceita ? <><span className="animate-spin mr-2">⏳</span> {t('alimentacaoInfantil.generating')}</> : t('alimentacaoInfantil.generateRecipe')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showRefeicaoModal} onOpenChange={setShowRefeicaoModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('alimentacaoInfantil.addMeal')}</DialogTitle>
                <p className="text-sm text-gray-500">{t('alimentacaoInfantil.addMealDesc')}</p>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="refeicaoTipo">{t('alimentacaoInfantil.mealType')}</Label>
                  <select
                    id="refeicaoTipo"
                    value={refeicaoTipo}
                    onChange={(e) => setRefeicaoTipo(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="breakfast">{t('alimentacaoInfantil.mealTypes.breakfast')}</option>
                    <option value="lunch">{t('alimentacaoInfantil.mealTypes.lunch')}</option>
                    <option value="dinner">{t('alimentacaoInfantil.mealTypes.dinner')}</option>
                    <option value="snack">{t('alimentacaoInfantil.mealTypes.snack')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notaRefeicao">{t('alimentacaoInfantil.mealNote')} <span className="text-gray-400 text-xs">{t('alimentacaoInfantil.optional')}</span></Label>
                  <textarea
                    id="notaRefeicao"
                    value={refeicaoNota}
                    onChange={(e) => setRefeicaoNota(e.target.value)}
                    placeholder={t('alimentacaoInfantil.mealNotePlaceholder')}
                    className="w-full h-20 p-2 border rounded-md focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowRefeicaoModal(false)}>{t('common.cancel')}</Button>
                <Button onClick={handleContinuarParaCamera} className="bg-teal-600 hover:bg-teal-700">{t('alimentacaoInfantil.continueToCamera')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showProgressoModal} onOpenChange={setShowProgressoModal}>
            <DialogContent className="sm:max-w-md dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">{t('alimentacaoInfantil.progressTitle', { name: perfilSelecionado?.name })}</DialogTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('alimentacaoInfantil.progressDesc')}</p>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {calcularEstatisticas() && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-teal-50 dark:bg-teal-900/30 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{calcularEstatisticas().totalRefeicoes}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{t('alimentacaoInfantil.totalMeals')}</p>
                      </div>
                      <div className="bg-teal-50 dark:bg-teal-900/30 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{calcularEstatisticas().ultimaSemana}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{t('alimentacaoInfantil.lastWeek')}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{t('alimentacaoInfantil.byMealType')}</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300"><span>{t('alimentacaoInfantil.mealTypes.breakfast')}</span><span className="font-semibold">{calcularEstatisticas().porTipo.breakfast}</span></div>
                        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300"><span>{t('alimentacaoInfantil.mealTypes.lunch')}</span><span className="font-semibold">{calcularEstatisticas().porTipo.lunch}</span></div>
                        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300"><span>{t('alimentacaoInfantil.mealTypes.dinner')}</span><span className="font-semibold">{calcularEstatisticas().porTipo.dinner}</span></div>
                        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300"><span>{t('alimentacaoInfantil.mealTypes.snack')}</span><span className="font-semibold">{calcularEstatisticas().porTipo.snack}</span></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300"><span className="font-semibold">{calcularEstatisticas().comImagem}</span> {t('alimentacaoInfantil.mealsWithPhoto')}</p>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setShowProgressoModal(false)} variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  {t('common.close')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {showReceitaModal && (
            <ReceitaDetalheModal
              receita={receitaSelecionada}
              onClose={() => setShowReceitaModal(false)}
              onCozinhar={handleCozinharReceita}
              user={user}
            />
          )}
        </>
      )}

      {perfis.length === 0 && (
        <div className="text-center py-16">
          <Baby className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">{t('alimentacaoInfantil.noProfiles')}</h3>
          <p className="text-gray-500 dark:text-gray-500 mb-6">{t('alimentacaoInfantil.createFirstProfile')}</p>
          <Button onClick={() => setShowNovoPerfil(true)} className="bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="mr-2 h-5 w-5" /> {t('alimentacaoInfantil.createFirstProfileButton')}
          </Button>
        </div>
      )}
      {/* MODAL DE CRIAÇÃO DE PERFIL */}
      <Dialog open={showNovoPerfil} onOpenChange={setShowNovoPerfil}>
        <DialogContent className="sm:max-w-lg w-[95vw] max-h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-lg font-bold text-teal-700">{t('alimentacaoInfantil.newProfile')}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCriarPerfil} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Header com foto */}
              <div className="flex items-center gap-4 bg-teal-50/50 p-3 rounded-xl border border-teal-100">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-white border-2 border-teal-500 shadow-sm">
                    {novoPerfil.profileImagePreview ? (
                      <img src={novoPerfil.profileImagePreview} alt={t('alimentacaoInfantil.previewAlt')} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">👧</div>
                    )}
                  </div>
                  <label htmlFor="profile-image" className="absolute -bottom-1 -right-1 bg-teal-600 text-white p-1 rounded-full cursor-pointer shadow-lg">
                    <Upload className="h-3 w-3" />
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProfileImageUpload(file);
                      }}
                    />
                  </label>
                </div>

                <div className="flex-1 space-y-2">
                  <Input
                    value={novoPerfil.name}
                    onChange={(e) => setNovoPerfil({ ...novoPerfil, name: e.target.value })}
                    placeholder={t('alimentacaoInfantil.childNamePlaceholder')}
                    required
                    className="h-8 text-sm"
                  />
                  <Input
                    type="date"
                    value={novoPerfil.birthDate ? novoPerfil.birthDate.split('T')[0] : ''}
                    onChange={(e) => setNovoPerfil({ ...novoPerfil, birthDate: e.target.value })}
                    required
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              {/* Alergias */}
              <div className="space-y-2 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                <Label className="text-[11px] uppercase font-bold text-gray-500">{t('alimentacaoInfantil.allergies')}</Label>
                <select
                  className="w-full h-8 px-2 rounded-md border border-input bg-white text-xs"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !novoPerfil.allergies.includes(val)) toggleAllergy(val);
                    e.target.value = "";
                  }}
                >
                  <option value="">{t('alimentacaoInfantil.addCommon')}...</option>
                  {commonAllergies.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <div className="flex flex-wrap gap-1.5">
                  {novoPerfil.allergies.map(a => (
                    <span key={a} className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-medium">
                      {a} <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => toggleAllergy(a)} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Intolerâncias */}
              <div className="space-y-2 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                <Label className="text-[11px] uppercase font-bold text-gray-500">{t('alimentacaoInfantil.intolerances')}</Label>
                <select
                  className="w-full h-8 px-2 rounded-md border border-input bg-white text-xs"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !novoPerfil.intolerances.includes(val)) toggleIntolerance(val);
                    e.target.value = "";
                  }}
                >
                  <option value="">{t('alimentacaoInfantil.addCommon')}...</option>
                  {commonIntolerances.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                <div className="flex flex-wrap gap-1.5">
                  {novoPerfil.intolerances.map(i => (
                    <span key={i} className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-medium">
                      {i} <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => toggleIntolerance(i)} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Saúde */}
              <div className="space-y-1">
                <Label htmlFor="health" className="text-[11px] font-bold text-gray-500 uppercase">{t('alimentacaoInfantil.healthObservations')}</Label>
                <Input
                  id="health"
                  value={novoPerfil.healthObservations.join(', ')}
                  onChange={(e) => {
                    const obs = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setNovoPerfil({ ...novoPerfil, healthObservations: obs });
                  }}
                  placeholder={t('alimentacaoInfantil.healthPlaceholder')}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Rodapé */}
            <div className="p-3 border-t flex gap-2 bg-white">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowNovoPerfil(false);
                  resetNovoPerfil();
                }}
                type="button"
                className="flex-1 h-9 text-xs"
                disabled={salvandoPerfil}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                className="flex-1 h-9 text-xs bg-teal-600 hover:bg-teal-700"
                disabled={salvandoPerfil}
              >
                {salvandoPerfil ? t('alimentacaoInfantil.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AlimentacaoInfantil;