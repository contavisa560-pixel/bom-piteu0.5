  import React, { useState, useRef, useEffect, useCallback } from 'react';
  import { Send, ArrowLeft, ChefHat, User, Sparkles, Camera, AlertTriangle, Headphones, FileText, Image, Paperclip, MessageCircle, Search, Download, Check, Clock, Zap, Trophy, Star, Heart, Share2,ArrowRight } from 'lucide-react';
  import { Button } from '@/components/ui/button';
  import { toast } from '@/components/ui/use-toast';
  import SupportScreen from './SupportScreen';
  import CameraModal from "./CameraModal";
  import confetti from 'canvas-confetti';
  import { useChatHistory } from '@/hooks/useChatHistory';
  import HistoryCard from '@/components/HistoryCard';
  import { saveSession } from '@/services/historyApi';
  import { generateRecipePDF } from '@/utils/recipePdfGenerator';
  import {
    iniciarPassoAPasso,
    handleDesejoPrato as apiHandleDesejoPrato, iniciarReceitaDireta
  } from '@/services/autoRecipeApi';
  import { normalizeImageUrl, ensureRecipeImagesArePermanent } from '@/utils/imageUtils';
  import { useTranslation } from 'react-i18next';
  import UsageLimitModal from '@/components/UsageLimitModal';
  import { useUsageLimit } from '@/hooks/useUsageLimit';

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  function launchConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  // Formata texto do passo como receita culinária
  const formatCulinaryStep = (text) => {
    if (!text) return [];

    return text
      .replace(/\s+/g, ' ')
      .split('. ')
      .map(sentence => sentence.trim())
      .filter(Boolean);
  };

  const ChatBot = ({ selectedCategory, onRecipeGenerated, onBack, onNavigate, user }) => {
    const { t, i18n } = useTranslation();
    const {
      usageStats,
      showLimitModal,
      setShowLimitModal,
      checkAndIncrementBot,
      checkAndIncrementImage,
    } = useUsageLimit(user);

    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showSupport, setShowSupport] = useState(false);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const [showMenu, setShowMenu] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [options, setOptions] = useState([]);
    const [recipe, setRecipe] = useState(null);
    const [currentStep, setCurrentStep] = useState(null);
    const [loading, setLoading] = useState(false);
    const stepLock = useRef(false);
    const processedFavorites = useRef(new Set());
    const [isMounted, setIsMounted] = useState(false);
    const [autoSaveEnabled] = useState(true);
    const [lastSavedAt, setLastSavedAt] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Novos estados para avaliação e favoritos
    const [rating, setRating] = useState(null);
    const [favorites, setFavorites] = useState({});
    const [isSharing, setIsSharing] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [processingStep, setProcessingStep] = useState(false);
    const [processingFavorite, setProcessingFavorite] = useState(false);
    const [totalSteps, setTotalSteps] = useState(0);
    // ESTADOS PARA PREVIEW
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [documentPreview, setDocumentPreview] = useState(null);
    const [showDocumentPreview, setShowDocumentPreview] = useState(false);
    const [sessionStartTime] = useState(Date.now());
    const [historySearch, setHistorySearch] = useState('');
    const [historyFilters] = useState({});
    const [selectedSession, setSelectedSession] = useState(null);
    const [showImageGallery, setShowImageGallery] = useState(false);
    const [sessionImages, setSessionImages] = useState([]);
    // Função helper para garantir que conteúdo é string
    const ensureStringContent = (content) => {
      if (typeof content === 'string') return content;
      if (typeof content === 'object') {
        // Tenta extrair texto de objeto comum
        return content?.text || content?.description || content?.title || JSON.stringify(content);
      }
      return String(content || '');
    };
    const autoResizeTextarea = useCallback(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, []);
    // HOOK DE HISTÓRICO
    // DEBUG: Verificar usuário
    console.log("🔍 Usuário atual:", user);
    console.log("🆔 ID do usuário:", user?._id);
    console.log("🔑 Todas as propriedades:", Object.keys(user || {}));

    // HOOK DE HISTÓRICO
    const userIdParaHistorico = user?._id || user?.id || user?.userId || (user ? user[Object.keys(user || {}).find(k => k.toLowerCase().includes('id'))] : null);
    console.log("📝 ID usado para histórico:", userIdParaHistorico);

    const {
      history: recipeHistory = [],
      loading: historyLoading = false,
      removeSession,
      loadSessionDetail,
      refreshHistory = () => { },
      loadSessionImages,
      exportSessionData,
      statistics = {
        totalSessions: 0,
        totalMessages: 0,
        totalImages: 0,
        completedRecipes: 0
      },
    } = useChatHistory(userIdParaHistorico) || {};

    // Gera um ID de sessão único
    const generateSessionId = () => {
      return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    // Inicializa uma nova sessão
    const initializeSession = () => {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      return newSessionId;
    };


    // Efeito para inicialização
    useEffect(() => {
      setIsMounted(true);

      if (user?._id && !sessionId) {
        initializeSession();
      }

      return () => {
        setIsMounted(false);
        if (messages.length > 0 && sessionId) {
          saveToHistory({
            sessionId,
            title: recipe?.title || t('chatBot.interruptedConversation'),
            status: 'interrupted'
          });
        }
      };
    }, [user?._id, t]);

    // Efeito para mensagem inicial
    useEffect(() => {
      if (!isMounted) return;
      if (selectedCategory?.source === 'guided_cooking') {
        console.log(' Modo guiado ativo – a ignorar mensagem inicial');
        return;
      }

      let initialMessage = t('chatBot.welcomeMessage', { name: user?.name?.split(' ')[0] || t('chatBot.chef') });

      if (selectedCategory?.title) {
        initialMessage = t('chatBot.categoryWelcomeMessage', { category: selectedCategory.title });
      }

      const initialBotMessage = {
        id: 1,
        type: 'bot',
        content: initialMessage,
        timestamp: new Date()
      };

      setMessages([initialBotMessage]);

      if (selectedCategory?.query) {
        setInputMessage(selectedCategory.query);
        const timer = setTimeout(() => {
          if (selectedCategory.query) {
            handleSendMessage(selectedCategory.query);
          }
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [selectedCategory, isMounted, t]);

    const addMessage = useCallback((type, content, extra = {}) => {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.type === type &&
        lastMsg?.content === content &&
        lastMsg?.step?.stepNumber === extra.step?.stepNumber) {
        return;
      }

      const newId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newMessage = {
        id: newId,
        type,
        content,
        timestamp: new Date(),
        ...extra
      };

      setMessages(prev => [...prev, newMessage]);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, [messages]);

    // Detectar se veio do Meu Canto de Saúde
    useEffect(() => {
      const chaveProcessada = selectedCategory?.nomeReceita || selectedCategory?.title;
      if (!isMounted || !selectedCategory || processedFavorites.current.has(chaveProcessada)) {
        return;
      }
      // ===== RECEITA INTERNACIONAL DIRETA =====
      if (selectedCategory?.source === 'receita_internacional_direta') {
        if (processedFavorites.current.has(selectedCategory.nomeReceita)) return;
        processedFavorites.current.add(selectedCategory.nomeReceita);

        setLoading(true);
        setMessages([{
          id: `loading_intl_${Date.now()}`,
          type: 'loading_receita_internacional',
          content: `A preparar a receita de ${selectedCategory.nomeReceita}`,
          pais: selectedCategory.pais,
          nomeReceita: selectedCategory.nomeReceita,
          timestamp: new Date()
        }]);

        (async () => {
          try {
            const data = await iniciarReceitaDireta(
              selectedCategory.nomeReceita,
              selectedCategory.pais,
              i18n.language
            );

            setSessionId(data.sessionId);
            setRecipe({
              title: data.receita.title,
              ingredients: data.receita.ingredients,
              steps: data.receita.steps,
              time: data.receita.time,
              difficulty: data.receita.difficulty
            });

            setMessages([{
              id: `intl_recipe_${Date.now()}`,
              type: 'receita_criada',
              content: `${data.pais} · ${data.receita.title}`,
              timestamp: new Date(),
              receita: data.receita,
              finalImage: data.finalImage,
              podeIniciarPassoAPasso: true,
              mensagemInicio: data.mensagemInicio,
              sessionId: data.sessionId,
              totalPassos: data.totalPassos
            }]);

          } catch (err) {
            console.error('Erro receita internacional:', err);
            setMessages([{
              id: `err_intl_${Date.now()}`,
              type: 'bot',
              content: `Ocorreu um erro ao preparar a receita de ${selectedCategory.nomeReceita}.`,
              timestamp: new Date()
            }]);
          } finally {
            setLoading(false);
          }
        })();

        return;
      }
      // ===== DISH RECOGNITION (foto de prato identificado) =====
      if (selectedCategory?.source === 'dish_recognition') {
        if (processedFavorites.current.has(selectedCategory.title)) return;
        processedFavorites.current.add(selectedCategory.title);

        setSessionId(selectedCategory.sessionId);
        setRecipe(selectedCategory.recipe);

        setMessages([
          {
            id: `user_photo_${Date.now()}`,
            type: 'user',
            content: t('chatBot.identifyDish'),
            image: selectedCategory.capturedImage,
            timestamp: new Date()
          },
          {
            id: `dish_${Date.now()}`,
            type: 'receita_criada',
            content: t('chatBot.dishIdentified', { title: selectedCategory.title }),
            timestamp: new Date(),
            receita: selectedCategory.recipe,
            finalImage: selectedCategory.finalImage,
            podeIniciarPassoAPasso: true,
            mensagemInicio: selectedCategory.mensagemInicio || t('chatBot.startStepByStepQuestion'),
            sessionId: selectedCategory.sessionId,
            totalPassos: selectedCategory.totalPassos,
            fromDishRecognition: true
          }
        ]);

        return;
      }

      // =====  RECEITA PERSONALIZADA (INFANTIL/SÉNIOR) =====
      if (selectedCategory?.source === 'receita_criada') {
        console.log('📥 Recebendo receita personalizada do perfil:', selectedCategory.title);

        if (processedFavorites.current.has(selectedCategory.title)) {
          return;
        }
        processedFavorites.current.add(selectedCategory.title);

        setSessionId(selectedCategory.sessionId);
        setRecipe(selectedCategory.recipe);

        setMessages([
          {
            id: `receita_${Date.now()}`,
            type: 'bot',
            content: t('chatBot.personalizedRecipe', { title: selectedCategory.title }),
            timestamp: new Date(),
            type: 'receita_criada',
            receita: selectedCategory.recipe,
            finalImage: selectedCategory.finalImage,
            podeIniciarPassoAPasso: true,
            mensagemInicio: selectedCategory.mensagemInicio || t('chatBot.startStepByStepQuestion'),
            sessionId: selectedCategory.sessionId,
            totalPassos: selectedCategory.totalPassos,
            fromFavorite: false
          }
        ]);

        return;
      }
      //  MODO GUIADO (COZINHA GUIADA)
      if (selectedCategory?.source === 'guided_cooking') {
        console.log(' Iniciando modo guiado com sessionId:', selectedCategory.sessionId);
        console.log('📦 selectedCategory completo:', selectedCategory);

        if (processedFavorites.current.has(selectedCategory.title)) {
          return;
        }
        processedFavorites.current.add(selectedCategory.title);

        setSessionId(selectedCategory.sessionId);

        setRecipe({
          title: selectedCategory.title,
          steps: []
        });

        setTotalSteps(selectedCategory.totalSteps);

        setMessages([
          {
            id: `guided_init_${Date.now()}`,
            type: 'guided_welcome',
            content: selectedCategory.initialMessage || t('chatBot.guidedWelcome', { title: selectedCategory.title }),
            timestamp: new Date(),
            podeIniciarPassoAPasso: true,
            sessionId: selectedCategory.sessionId,
            totalSteps: selectedCategory.totalSteps
          }
        ]);
        return;
      }

      //  VERIFICAR SE É REALMENTE DO MEU CANTO DE SAÚDE
      if (selectedCategory?.source !== 'meu-canto-saude') {
        return;
      }

      console.log(' INICIANDO CARREGAMENTO DE FAVORITO:', selectedCategory.title);

      setProcessingFavorite(true);
      setLoading(true);

      setMessages([
        {
          id: 'loading_favorite',
          type: 'bot',
          content: t('chatBot.preparingFavorite', { title: selectedCategory.title }),
          timestamp: new Date(),
          isLoading: true
        }
      ]);

      processedFavorites.current.add(selectedCategory.title);

      const handleHealthFavorite = async () => {
        try {
          const token = localStorage.getItem("bomPiteuToken");
          const userId = user?.id || user?._id;

          if (!userId) {
            throw new Error(t('chatBot.userNotIdentified'));
          }

          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/auto-recipe/gerar-favorito`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                tituloReceita: selectedCategory.title,
                userId: userId
              })
            }
          );

          if (!response.ok) {
            throw new Error(t('chatBot.errorGeneratingFavorite', { status: response.status }));
          }

          const data = await response.json();
          console.log('✅ RECEITA REAL GERADA:', data);

          setMessages(prev => {
            const filtered = prev.filter(msg => msg.id !== 'loading_favorite');

            const saudacao = {
              id: 'saudacao',
              type: 'bot',
              content: t('chatBot.favoriteGreeting', { name: user?.name?.split(' ')[0] || t('chatBot.chef'), title: selectedCategory.title }),
              timestamp: new Date()
            };

            const receitaMsg = {
              id: `recipe_${Date.now()}`,
              type: "bot",
              content: t('chatBot.favoriteRecipeTitle', { title: selectedCategory.title }),
              timestamp: new Date(),
              type: "receita_criada",
              receita: data.receita,
              finalImage: data.finalImage,
              podeIniciarPassoAPasso: data.podeIniciarPassoAPasso,
              mensagemInicio: data.mensagemInicio,
              sessionId: data.sessionId,
              healthScore: data.receita?.healthScore || 8,
              totalPassos: data.totalPassos || data.receita?.steps?.length || 0,
              fromFavorite: true
            };

            return [...filtered, saudacao, receitaMsg];
          });

          if (data.sessionId) {
            setSessionId(data.sessionId);
          }

          if (data.receita) {
            setRecipe({
              title: data.receita.title,
              ingredients: data.receita.ingredients,
              steps: data.receita.steps,
              difficulty: data.receita.difficulty,
              time: data.receita.time
            });
          }

          toast({
            title: t('chatBot.recipeReady'),
            description: t('chatBot.recipeReadyDesc', { title: selectedCategory.title }),
            variant: "default",
            duration: 2000
          });

        } catch (error) {
          console.error('❌ Erro ao processar favorito REAL:', error);

          setMessages(prev => {
            const filtered = prev.filter(msg => msg.id !== 'loading_favorite');
            return [...filtered, {
              id: `error_${Date.now()}`,
              type: "bot",
              content: t('chatBot.errorLoadingFavorite', { title: selectedCategory.title }),
              timestamp: new Date(),
              type: "receita_criada",
              receita: {
                title: selectedCategory.title,
                ingredients: [t('chatBot.ingredientsPlaceholder')],
                steps: [t('chatBot.stepsPlaceholder')],
                difficulty: t('chatBot.mediumDifficulty'),
                time: "30 min"
              },
              podeIniciarPassoAPasso: false,
              actionRequired: true
            }];
          });

          toast({
            title: t('chatBot.errorTitle'),
            description: t('chatBot.errorDescription'),
            variant: "destructive"
          });
        } finally {
          setProcessingFavorite(false);
          setLoading(false);
        }
      };

      handleHealthFavorite();
    }, [selectedCategory, isMounted, user, t]);


    useEffect(() => {
      const handleClickOutside = (event) => {
        if (showMenu && !event.target.closest('.menu-container')) {
          setShowMenu(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showMenu]);

    const saveToHistory = useCallback(async (sessionData) => {
      if (!user?._id || isSaving) return;

      setIsSaving(true);

      try {
        const currentSessionId = sessionData.sessionId || sessionId || generateSessionId();

        if (!sessionId) {
          setSessionId(currentSessionId);
        }

        const sessionPayload = {
          sessionId: currentSessionId,
          userId: user._id,
          title: sessionData.title || recipe?.title || t('chatBot.cookingConversation'),
          category: selectedCategory?.type || "general",

          messages: messages.map(msg => ({
            id: msg.id,
            type: msg.type,
            content: msg.content,
            timestamp: msg.timestamp,
            image: msg.image,
            imageUrl: msg.imageUrl,
            finalImage: msg.finalImage,
            step: msg.step ? {
              stepNumber: msg.step.stepNumber,
              description: msg.step.description,
              imageUrl: msg.step.imageUrl
            } : null,
            options: msg.options,
            recipeTitle: msg.recipeTitle,
            progress: msg.progress,
            totalSteps: msg.totalSteps,
            type: msg.type,
            metadata: msg.metadata
          })),

          chatState: {
            recipe: recipe ? {
              title: recipe.title,
              ingredients: recipe.ingredients || [],
              steps: recipe.steps || [],
              finalImage: recipe.finalImage,
              time: recipe.time,
              difficulty: recipe.difficulty
            } : null,

            currentStep: currentStep ? {
              stepNumber: currentStep.stepNumber,
              description: currentStep.description,
              imageUrl: currentStep.imageUrl
            } : null,

            options: options,
            sessionId: currentSessionId,
            loading: loading,
            isTyping: isTyping
          },

          uiState: {
            showMenu: showMenu,
            showCamera: showCamera,
            showSupport: showSupport,
            showHistory: showHistory,
            rating: rating,
            feedback: feedback,
            favorites: favorites,
            sessionStartTime: sessionStartTime
          },

          statistics: {
            messageCount: messages.length,
            recipeSteps: recipe?.steps?.length || 0,
            duration: Math.round((Date.now() - sessionStartTime) / 60000)
          },

          status: sessionData.status || 'active',
          lastActivity: new Date(),
          version: '3.0'
        };

        console.log('💾 Salvando ESTADO COMPLETO:', {
          sessionId: currentSessionId,
          title: sessionPayload.title,
          messages: sessionPayload.messages.length,
          hasRecipe: !!sessionPayload.chatState.recipe,
          currentStep: sessionPayload.chatState.currentStep?.stepNumber
        });

        await saveSession(sessionPayload);
        setLastSavedAt(new Date());

      } catch (err) {
        console.error("❌ Erro ao salvar:", err);
      } finally {
        setIsSaving(false);
      }
    }, [
      user, isSaving, sessionId, selectedCategory, messages, recipe, currentStep,
      options, loading, isTyping, showMenu, showCamera, showSupport, showHistory,
      rating, feedback, favorites, sessionStartTime, refreshHistory, t
    ]);


    const restoreSessionFromData = useCallback((sessionDetail) => {
      console.log('🔄 Restaurando sessão:', sessionDetail.title,
        '| mensagens:', sessionDetail.messages?.length || 0);

      setSessionId(sessionDetail.sessionId);

      const recipeToRestore =
        sessionDetail.chatState?.recipe ||
        sessionDetail.recipeData ||
        null;

      if (recipeToRestore) {
        setRecipe(recipeToRestore);
        console.log('🍳 Receita restaurada:', recipeToRestore.title);
      }

      const stepToRestore = sessionDetail.chatState?.currentStep || null;
      if (stepToRestore) {
        setCurrentStep(stepToRestore);
        console.log('📍 Passo restaurado:', stepToRestore.stepNumber);
      }

      if (sessionDetail.chatState?.options) {
        setOptions(sessionDetail.chatState.options);
      }

      const stepIndex = sessionDetail.chatState?.currentStepIndex || 0;
      if (stepIndex > 0 && sessionDetail.chatState?.recipe?.steps?.length > 0) {
        const steps = sessionDetail.chatState.recipe.steps;
        const lastDoneStep = steps[stepIndex - 1];
        setCurrentStep({
          stepNumber: stepIndex,
          description: typeof lastDoneStep === "string"
            ? lastDoneStep
            : (lastDoneStep?.description || lastDoneStep?.text || ""),
          imageUrl: lastDoneStep?.imageUrl || null
        });
        console.log('📍 Passo actual restaurado:', stepIndex);
      }

      if (Array.isArray(sessionDetail.messages) && sessionDetail.messages.length > 0) {

        const restoredMessages = sessionDetail.messages.map((msg, index) => {

          const msgId = msg.id ||
            msg._id ||
            `restored_${sessionDetail.sessionId}_${index}_${Date.now()}`;

          const restored = {
            id: msgId,
            type: msg.type || 'bot',
            content: msg.content || '',
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          };

          if (msg.image) restored.image = msg.image;
          if (msg.imageUrl) restored.imageUrl = msg.imageUrl;
          if (msg.finalImage) restored.finalImage = msg.finalImage;
          if (msg.thumbnailUrl) restored.thumbnailUrl = msg.thumbnailUrl;

          if (msg.step) {
            restored.step = {
              stepNumber: msg.step.stepNumber,
              description: msg.step.description,
              imageUrl: msg.step.imageUrl || null
            };
          }
          if (msg.progress !== undefined) restored.progress = msg.progress;
          if (msg.totalSteps !== undefined) restored.totalSteps = msg.totalSteps;

          if (msg.options !== undefined && msg.options !== null) {
            restored.options = msg.options;
          }

          if (msg.receita) restored.receita = msg.receita;
          if (msg.podeIniciarPassoAPasso !== undefined) {
            restored.podeIniciarPassoAPasso = msg.podeIniciarPassoAPasso;
          }
          if (msg.mensagemInicio) restored.mensagemInicio = msg.mensagemInicio;
          if (msg.totalPassos) restored.totalPassos = msg.totalPassos;
          if (msg.sessionId) restored.sessionId = msg.sessionId;

          if (msg.recipeTitle) restored.recipeTitle = msg.recipeTitle;
          if (msg.ingredientsUsed) restored.ingredientsUsed = msg.ingredientsUsed;
          if (msg.cookingTime) restored.cookingTime = msg.cookingTime;
          if (msg.difficulty) restored.difficulty = msg.difficulty;
          if (msg.showConfetti !== undefined) restored.showConfetti = msg.showConfetti;
          if (msg.showRating !== undefined) restored.showRating = msg.showRating;
          if (msg.showShare !== undefined) restored.showShare = msg.showShare;
          if (msg.showFavorite !== undefined) restored.showFavorite = msg.showFavorite;
          if (msg.showDownload !== undefined) restored.showDownload = msg.showDownload;

          if (msg.ingredientesUtilizados) restored.ingredientesUtilizados = msg.ingredientesUtilizados;
          if (msg.ingredients) restored.ingredients = msg.ingredients;
          if (msg.metadata) restored.metadata = msg.metadata;

          return restored;
        });

        console.log('✅ Mensagens restauradas:', restoredMessages.length,
          '| tipos:', [...new Set(restoredMessages.map(m => m.type))].join(', '));

        setMessages(restoredMessages);

      } else {
        console.warn('⚠️ Sessão sem mensagens guardadas:', sessionDetail.sessionId);
        setMessages([{
          id: `restored_empty_${Date.now()}`,
          type: 'bot',
          content: t('chatBot.sessionLoaded', { title: sessionDetail.title }),
          timestamp: new Date()
        }]);
      }

      if (sessionDetail.uiState) {
        if (sessionDetail.uiState.rating !== undefined) setRating(sessionDetail.uiState.rating);
        if (sessionDetail.uiState.feedback !== undefined) setFeedback(sessionDetail.uiState.feedback);
        if (sessionDetail.uiState.favorites) setFavorites(sessionDetail.uiState.favorites);
      }

      setShowHistory(false);

      toast({
        title: t('chatBot.sessionRestored'),
        description: t('chatBot.sessionRestoredDesc', { title: sessionDetail.title }),
        variant: "default"
      });

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);

    }, [t]);


    const handleExportSession = useCallback(async (session, format = 'json') => {
      try {
        const success = await exportSessionData(session.sessionId, format);

        if (success) {
          toast({
            title: t('chatBot.exportSuccess'),
            description: t('chatBot.exportSuccessDesc', { title: session.title }),
            variant: "default"
          });
        } else {
          throw new Error(t('chatBot.exportFailed'));
        }
      } catch (err) {
        console.error("Erro ao exportar:", err);
        toast({
          title: t('chatBot.exportError'),
          description: t('chatBot.exportErrorDesc'),
          variant: "destructive"
        });
      }
    }, [exportSessionData, t]);

    useEffect(() => {
      if (!autoSaveEnabled || !sessionId || messages.length === 0) return;

      const saveTimeout = setTimeout(() => {
        if (messages.length > 0 && messages.length % 3 === 0) {
          saveToHistory({
            sessionId,
            title: recipe?.title || t('chatBot.conversationInProgress'),
            status: 'active'
          });
        }
      }, 5000);

      return () => clearTimeout(saveTimeout);
    }, [messages.length, sessionId, autoSaveEnabled, recipe, saveToHistory, t]);

    const handleFile = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';

      if (isImage) {
        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
        setShowImagePreview(true);
      } else if (isPDF || file.type.includes('document')) {
        setSelectedDocument(file);
        setDocumentPreview({
          name: file.name,
          size: (file.size / 1024).toFixed(2) + ' KB',
          type: file.type
        });
        setShowDocumentPreview(true);
      } else {
        toast({
          title: t('chatBot.unsupportedFormat'),
          description: t('chatBot.unsupportedFormatDesc'),
          variant: "destructive"
        });
      }
    };

    const handleImageSelect = (e) => {
      const file = e.target.files[0];
      if (file) {
        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
        setShowImagePreview(true);
      }
    };

    const uploadImageForOptions = async (file) => {
      setProcessingStep(true);
      setLoading(true);

      const formData = new FormData();
      formData.append("image", file);

      const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auto-recipe/options`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await res.json();
        const canUseImage = await checkAndIncrementImage();
        if (!canUseImage) {
          setLoading(false);
          setProcessingStep(false);
          return;
        }
        addMessage("user", t('chatBot.sentPhoto'));
        addMessage("bot", t('chatBot.analyzingPhoto'));

        const newSessionId = data.sessionId || sessionId || generateSessionId();
        setSessionId(newSessionId);
        setOptions(data.options || []);

        setTimeout(() => {
          addMessage("bot", t('chatBot.recipesFound'), {
            options: data.options || [],
            sessionId: newSessionId
          });
        }, 1200);

        return data;
      } catch (err) {
        addMessage("bot", t('chatBot.photoAnalysisError'));
        console.error(err);
      } finally {
        setLoading(false);
        setProcessingStep(false);
      }
    };

    const uploadDocumentForOptions = async (file) => {
      setProcessingStep(true);
      setLoading(true);

      const formData = new FormData();
      formData.append("document", file);

      const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auto-recipe/document-options`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await res.json();
        const canUseImage = await checkAndIncrementImage();
        if (!canUseImage) {
          setLoading(false);
          setProcessingStep(false);
          return;
        }
        addMessage("user", t('chatBot.sentDocument'));
        addMessage("bot", t('chatBot.analyzingDocument'));

        const newSessionId = data.sessionId || sessionId || generateSessionId();
        setSessionId(newSessionId);
        setOptions(data.options || []);

        setTimeout(() => {
          addMessage("bot", t('chatBot.documentRecipesFound'), {
            options: data.options || [],
            sessionId: newSessionId,
            documentName: file.name
          });
        }, 1500);

        return data;
      } catch (err) {
        addMessage("bot", t('chatBot.documentAnalysisError'));
        console.error(err);
      } finally {
        setLoading(false);
        setProcessingStep(false);
      }
    };

    const selectRecipeOption = async (choice) => {
      if (!sessionId) {
        const newSessionId = generateSessionId();
        setSessionId(newSessionId);
      }

      setProcessingStep(true);
      setLoading(true);

      const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");

      try {
        addMessage("bot", t('chatBot.processingChoice'));

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auto-recipe/select`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ sessionId, choice }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        if (!data.recipe) {
          throw new Error(t('chatBot.recipeNotFound'));
        }

        setRecipe(data.recipe);

        setMessages(prev => prev.filter(msg => msg.content !== t('chatBot.processingChoice')));

        addMessage("bot", data.recipe.title || t('chatBot.recipeSelected'), {
    finalImage: data.finalImage,
    ingredients: data.recipe.ingredients || [],
    time: data.recipe.time,
    difficulty: data.recipe.difficulty,
    type: "simple-recipe-start"
  });

        setTimeout(() => {
          saveToHistory({
            sessionId,
            title: data.recipe.title || t('chatBot.recipeSelected'),
            status: 'active'
          });
        }, 1000);

      } catch (err) {
        console.error("Erro ao selecionar receita:", err);
        toast({
          title: t('common.error'),
          description: t('chatBot.selectRecipeError'),
          variant: "destructive",
        });
        addMessage("bot", t('chatBot.selectRecipeErrorMessage'));
      } finally {
        setLoading(false);
        setProcessingStep(false);
      }
    };

    const generateStep = async () => {
      if (!sessionId || stepLock.current || loading) {
        return;
      }

      if (!recipe) {
        addMessage("bot", t('chatBot.selectRecipeFirst'));
        return;
      }

      // Contar este passo no limite de mensagens
      const canProceed = await checkAndIncrementBot();
      if (!canProceed) {
        return;
      }

      stepLock.current = true;
      setLoading(true);

      try {
        const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auto-recipe/step`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ sessionId }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        let progressToShow = '';
        let totalSteps = recipe?.steps?.length || 0;

        if (data.progress) {
          const parts = data.progress.split('/');
          if (parts.length >= 2) {
            progressToShow = `${parts[0]}/${parts[1]}`;
            totalSteps = parseInt(parts[1]) || 8;
          } else {
            progressToShow = data.progress;
          }
        }

        if (data.step) {
          if (!progressToShow && data.step.stepNumber) {
            progressToShow = `${data.step.stepNumber}/${totalSteps}`;
          }

          const uniqueId = `step_${Date.now()}_${data.step.stepNumber}_${Math.random().toString(36).substr(2, 5)}`;

          addMessage("bot", t('chatBot.step', { number: data.step.stepNumber }), {
            id: uniqueId,
            step: data.step,
            imageUrl: data.step.imageUrl || '',
            progress: progressToShow,
            totalSteps: totalSteps,
            type: "cooking-step"
          });

          setCurrentStep(data.step);

          setTimeout(() => {
            saveToHistory({
              sessionId,
              title: recipe.title,
              status: 'active'
            });
          }, 800);

        } else if (data.status === 'COMPLETED' || (data.message && data.message.includes("Receita concluída"))) {
          const uniqueId = `completed_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

          try {
            const pontosGanhos = 50;
            console.log(`🎉 Adicionando ${pontosGanhos} pontos ao usuário`);

            const token = localStorage.getItem("bomPiteuToken");
            const userId = user?._id || user?.id;

            if (userId) {
              fetch(`${API_URL}/api/users/${userId}/points`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                  points: pontosGanhos,
                  action: 'complete_recipe',
                  recipeTitle: recipe.title || t('chatBot.recipe')
                })
              })
                .then(res => res.json())
                .then(data => {
                  console.log('✅ Pontos adicionados:', data);

                  const userStr = localStorage.getItem('bomPiteuUser');
                  if (userStr) {
                    const userData = JSON.parse(userStr);
                    userData.points = data.newPoints;
                    userData.level = data.newLevel;
                    localStorage.setItem('bomPiteuUser', JSON.stringify(userData));
                  }

                  toast({
                    title: t('chatBot.pointsEarned', { points: pontosGanhos }),
                    description: data.levelUp
                      ? t('chatBot.levelUp', { level: data.newLevel })
                      : t('chatBot.keepGoing'),
                    variant: "default"
                  });
                })
                .catch(err => console.error('Erro ao adicionar pontos:', err));
            }
          } catch (err) {
            console.error('Erro ao processar pontos:', err);
          }

          addMessage("bot", t('chatBot.recipeCompleted'), {
            id: uniqueId,
            type: "recipe-completed",
            finalImage: data.finalImage || '',
            recipeTitle: data.recipeTitle || recipe.title || t('chatBot.yourRecipe'),
            ingredientsUsed: data.ingredientsUsed || recipe?.ingredients || [],
            cookingTime: data.cookingTime || recipe?.time || '30 min',
            difficulty: data.difficulty || recipe?.difficulty || t('chatBot.mediumDifficulty'),
            showConfetti: true,
            timestamp: new Date(),
            pontosGanhos: 50,
            userRating: null,
            userFeedback: '',
            allSteps: recipe?.steps || []
          });

          setTimeout(() => {
            saveToHistory({
              sessionId,
              title: recipe.title || t('chatBot.recipeCompleted'),
              status: 'completed'
            });
          }, 1000);

          const completionTimer = setTimeout(() => {
            setCurrentStep(null);
            setRecipe(null);
          }, 5000);

          stepLock.current = false;
          setLoading(false);

          return () => clearTimeout(completionTimer);
        } else {
          addMessage("bot", t('chatBot.preparingNextStep'));
        }

      } catch (err) {
        console.error("Erro ao gerar passo:", err);
        addMessage("bot", t('chatBot.stepError'));
        toast({
          title: t('common.error'),
          description: t('chatBot.stepErrorDesc'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setTimeout(() => {
          stepLock.current = false;
        }, 1000);
      }
    };

    const fetchRecipeOptions = async (ingredients, category) => {
      const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auto-recipe/text-options`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ingredientsDescription: ingredients }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        return data.options || [];
      } catch (err) {
        console.error("Erro ao buscar opções:", err);
        return [];
      }
    };


    const handleDesejoPratoChat = async (mensagem) => {
      console.log("🍽️ Processando desejo de prato:", mensagem);

      addMessage("user", mensagem);

      setInputMessage("");
      setIsTyping(true);
      const canProceed = await checkAndIncrementBot();
      if (!canProceed) {
        setIsTyping(false);
        return;
      }

      try {
        const pratoDesejado = mensagem.replace(/quero fazer|vou fazer|preparar|cozinhar|fa[çc]a|fazer|pretendo fazer/gi, '').trim();

        if (!pratoDesejado) {
          throw new Error(t('chatBot.noDishUnderstood'));
        }

        const isObjectIdValid = (id) => {
          return id && /^[0-9a-fA-F]{24}$/.test(id);
        };

        const sessionIdParaEnviar = isObjectIdValid(sessionId) ? sessionId : null;
        const data = await apiHandleDesejoPrato(pratoDesejado, null, sessionIdParaEnviar, i18n.language);

        console.log("✅ Resposta desejo prato COMPLETA:", data);

        if (typeof data === 'string') {
          console.log("⚠️ Resposta é string, convertendo...");

          if (data.includes('ingredientes') || data.includes('tem disponível')) {
            addMessage("bot", data || t('chatBot.askIngredients'), {
              type: "pergunta_ingredientes",
              sessionId: sessionId,
              pratoDesejado: pratoDesejado
            });
          }
          else {
            addMessage("bot", data || t('chatBot.recipeCreated'), {
              type: "receita_criada",
              receita: {
                title: pratoDesejado,
                ingredients: [t('chatBot.ingredientsPlaceholder')],
                steps: [t('chatBot.stepsPlaceholder')]
              }
            });
          }
        }
        else if (data.tipo === "pergunta_ingredientes" || data.mensagem) {
          if (data.sessionId && /^[0-9a-fA-F]{24}$/.test(data.sessionId)) {
            setSessionId(data.sessionId);
            console.log("✅ SessionId atualizado para:", data.sessionId);
          }

          addMessage("bot", data.mensagem || t('chatBot.askIngredients'), {
            type: "pergunta_ingredientes",
            sessionId: data.sessionId || sessionId,
            pratoDesejado: data.pratoDesejado || pratoDesejado,
            ingredientesSugeridos: data.ingredientesSugeridos || [],
            dicas: data.dicas || []
          });
        }
        else if (data.tipo === "receita_adaptada_pronta" || data.receita) {
          if (data.sessionId) {
            setSessionId(data.sessionId);
          }

          setRecipe(data.receita || {
            title: data.titulo || pratoDesejado,
            ingredients: data.ingredientes || [],
            steps: data.passos?.map((desc, idx) => ({
              stepNumber: idx + 1,
              description: desc
            })) || []
          });

          addMessage("bot", t('chatBot.recipeCreatedFor', { title: data.receita?.title || data.titulo || pratoDesejado }), {
            type: "receita_criada",
            receita: data.receita || {
              title: data.titulo || pratoDesejado,
              ingredients: data.ingredientes || [],
              steps: data.passos?.map((desc, idx) => ({
                stepNumber: idx + 1,
                description: desc
              })) || []
            },
            finalImage: data.finalImage,
            ingredientesUtilizados: data.ingredientesUtilizados || [],
            sessionId: data.sessionId || sessionId,
            podeIniciarPassoAPasso: true,
            mensagemInicio: data.mensagemInicio || t('chatBot.startStepByStepQuestion'),
            totalPassos: data.totalPassos || data.receita?.steps?.length || 0
          });
        }
        else {
          console.log("⚠️ Formato desconhecido da resposta:", data);

          const mensagemResposta = data.mensagem || data.resposta ||
            (typeof data === 'string' ? data : t('chatBot.askIngredientsFor', { dish: pratoDesejado }));

          addMessage("bot", mensagemResposta, {
            type: "pergunta_ingredientes",
            sessionId: sessionId,
            pratoDesejado: pratoDesejado
          });
        }

      } catch (error) {
        console.error("❌ Erro em handleDesejoPratoChat:", error);

        addMessage("bot", t('chatBot.askIngredientsFor', { dish: 'bolo' }), {
          type: "pergunta_ingredientes",
          sessionId: sessionId,
          pratoDesejado: "bolo"
        });

        toast({
          title: t('chatBot.tellIngredients'),
          description: t('chatBot.tellIngredientsDesc'),
          variant: "default"
        });
      } finally {
        setIsTyping(false);
      }
    };

    const handleRespostaIngredientes = async (ingredientes, contextoAnterior) => {
      console.log("🧂 Processando ingredientes:", ingredientes);

      addMessage("user", ingredientes);

      setInputMessage("");
      setIsTyping(true);
      const canProceed = await checkAndIncrementBot();
      if (!canProceed) {
        setIsTyping(false);
        return;
      }

      try {
        const data = await apiHandleDesejoPrato(
          contextoAnterior.pratoDesejado,
          ingredientes,
          contextoAnterior.sessionId,
          i18n.language
        );

        console.log("✅ Resposta receita adaptada:", data);

        if (data.tipo === "receita_adaptada_pronta") {
          if (data.sessionId) {
            setSessionId(data.sessionId);
          }

          setRecipe(data.receita);

          addMessage("bot", t('chatBot.dishReady', { title: data.receita.title }), {
            type: "receita_criada",
            receita: data.receita,
            finalImage: data.finalImage,
            ingredientesUtilizados: data.ingredientesUtilizados,
            sessionId: data.sessionId,
            podeIniciarPassoAPasso: true,
            mensagemInicio: data.mensagemInicio || t('chatBot.startStepByStepQuestion'),
            totalPassos: data.totalPassos || data.receita.steps?.length || 0
          });
        }

      } catch (error) {
        console.error("❌ Erro em handleRespostaIngredientes:", error);

        addMessage("bot", t('chatBot.ingredientsError'));

        toast({
          title: t('common.error'),
          description: t('chatBot.ingredientsErrorDesc'),
          variant: "destructive"
        });
      } finally {
        setIsTyping(false);
      }
    };


    const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");
const handleChatLivre = async (mensagem) => {
  console.log("🗣️ Chat livre:", mensagem);

  const userMsg = {
    id: Date.now(),
    type: "user",
    content: mensagem,
    timestamp: new Date()
  };
  setMessages(prev => [...prev, userMsg]);

  setInputMessage("");
  setIsTyping(true);

    const canProceed = await checkAndIncrementBot();
  if (!canProceed) {
    setIsTyping(false);
    return;
  }
  try {
    const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");

    // ── Constrói histórico das últimas 8 mensagens  ──────────────────
    const historico = messages
      .filter(m => m.type === 'user' || m.type === 'bot')
      .filter(m => typeof m.content === 'string' && m.content.trim().length > 0)
      .slice(-8)
      .map(m => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content
      }));

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auto-recipe/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        mensagem: mensagem,
        sessionId: sessionId,
        language: i18n.language,
        contexto: selectedCategory?.chatContext || null,  
        historico: historico,                              
      }),
    });
     if (res.ok) {
      const data = await res.json();
      addMessage("bot", data.resposta || data.mensagem || t('chatBot.technicalError'));
    } else {
      addMessage("bot", t('chatBot.technicalError'));
    }
  } catch (err) {
    console.error("Erro no chat livre:", err);
    addMessage("bot", t('chatBot.technicalError'));
  } finally {
    setIsTyping(false);
  }
};

    const handlePerguntaPasso = async (pergunta) => {
      console.log("❓ Pergunta sobre passo:", pergunta);

      addMessage("user", pergunta);
      setInputMessage("");
      setIsTyping(true);
      const canProceed = await checkAndIncrementBot();
      if (!canProceed) {
        setIsTyping(false);
        return;
      }

      try {
        const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auto-recipe/pergunta-passo`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sessionId,
            pergunta
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        addMessage("bot", data.resposta || data.mensagem || t('chatBot.understoodQuestion'), {
          tipo: "resposta_passos"
        });

      } catch (err) {
        console.error("❌ Erro ao fazer pergunta:", err);
        addMessage("bot", t('chatBot.stepQuestionError'));
      } finally {
        setIsTyping(false);
      }
    };

    const handleSendMessage = async (messageOverride) => {
      const currentInput = messageOverride || inputMessage;
      if (!currentInput.trim() || loading) return;

      const lowerInput = currentInput.toLowerCase();
      const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");

      console.log("📝 Mensagem recebida:", currentInput);

      const lastBotMessage = messages[messages.length - 1];
      if (lastBotMessage?.type === "pergunta_ingredientes") {
        console.log("🔀 Redirecionando: resposta de ingredientes");
        await handleRespostaIngredientes(currentInput, lastBotMessage);
        return;
      }

      const isQueroFazer = lowerInput.includes('quero fazer') ||
        lowerInput.includes('vou fazer') ||
        lowerInput.includes('preparar') ||
        lowerInput.includes('cozinhar') ||
        lowerInput.includes('fazer');

      if (isQueroFazer) {
        console.log("🔀 Redirecionando: quero fazer X");
        await handleDesejoPratoChat(currentInput);
        return;
      }

      const isSaudacao = lowerInput.match(/olá|oi|tudo bem|bom dia|boa tarde|boa noite|como vai|chef|e ai|hello|hi/i);
      const isAgradecimento = lowerInput.match(/obrigado|valeu|thanks|obrigada|thank you/i);
      const isAjuda = lowerInput.match(/ajuda|help|ajude|socorro|como funciona|o que é isso/i);
      const isDespedida = lowerInput.match(/tchau|adeus|até logo|bye|flw|falou/i);
      const isPerguntaSimples = lowerInput.includes('?') && lowerInput.split(' ').length < 10;

      if (isSaudacao || isAgradecimento || isAjuda || isDespedida || isPerguntaSimples) {
        console.log("🔀 Redirecionando: chat livre (conversação)");
        await handleChatLivre(currentInput);
        return;
      }

      const isEmPassoAPasso = recipe && currentStep;
      if (isEmPassoAPasso) {
        console.log("🔀 Redirecionando: pergunta durante passo a passo");
        await handlePerguntaPasso(currentInput);
        return;
      }

      const temVirgulas = currentInput.includes(',');
      const dizTenho = lowerInput.includes('tenho');
      const temIngredientes = lowerInput.includes('ingredientes');
      const temLista = temVirgulas || (dizTenho && lowerInput.split(' ').length > 2);

      if (temLista || temIngredientes) {
        console.log("🔀 Continuando: ingredientes para buscar receitas");

        if (!sessionId) {
          initializeSession();
        }

        const userMessage = { id: Date.now(), type: "user", content: currentInput, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        if (!messageOverride) setInputMessage("");
        setIsTyping(true);
        autoResizeTextarea();

        try {
          addMessage("bot", t('chatBot.thinking'));

          if (currentInput.toLowerCase().includes('tenho') || currentInput.includes(',') || currentInput.includes('ingredientes')) {
            const formData = new FormData();
            formData.append('ingredients', currentInput);

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auto-recipe/options`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData
            });

            if (res.status === 401) {
              throw new Error('Token inválido ou expirado');
            }
            if (res.status === 403) {
  const canProceed = await checkAndIncrementBot();
  if (!canProceed) return;
  return;
}

            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            const newSessionId = data.sessionId || generateSessionId();
            setSessionId(newSessionId);
            setOptions(data.options || []);

            setMessages(prev => prev.filter(msg => msg.content !== t('chatBot.thinking')));

            const canProceed = await checkAndIncrementBot();
            if (canProceed) {
              addMessage("bot", t('chatBot.recipesFoundWithAI'), {
                options: data.options || [],
                sessionId: newSessionId,
                type: "auto-recipe-options"
              });
            }

            setIsTyping(false);
            return;
          }

          const options = await fetchRecipeOptions(currentInput, selectedCategory?.title);

          setMessages(prev => prev.filter(msg => msg.content !== t('chatBot.thinking')));

          if (options.length === 0) {
            if (currentInput.split(' ').length < 6) {
              await handleChatLivre(currentInput);
            } else {
              addMessage("bot", t('chatBot.noRecipesFound'));
            }
          } else {
            addMessage("bot", t('chatBot.recipesFound'), {
              options: options,
              type: "auto-recipe-options"
            });
          }

        } catch (err) {
          console.error("Erro ao enviar mensagem:", err);

          if (err.message.includes('401') || err.message.includes('Token inválido')) {
            console.log("⚠️ Token inválido ou expirado");

            localStorage.removeItem("bomPiteuToken");
            localStorage.removeItem("token");

            toast({
              title: t('chatBot.sessionExpired'),
              description: t('chatBot.loginAgain'),
              variant: "destructive"
            });

            addMessage("bot", t('chatBot.sessionExpiredMessage'));

            setTimeout(() => {
              onBack('login');
            }, 2000);

          } else {
            toast({
              title: t('common.error'),
              description: t('chatBot.messageError'),
              variant: "destructive",
            });

            addMessage("bot", t('chatBot.technicalError'));
          }

        } finally {
          setIsTyping(false);

          setTimeout(() => {
            saveToHistory({
              sessionId: sessionId || generateSessionId(),
              title: t('chatBot.messageSent'),
              status: 'active'
            });
          }, 500);
        }

        return;
      }

      console.log("🔀 Default: usando chat livre");
      await handleChatLivre(currentInput);
    };

    const isLastStep = (message) => {
      if (!message || !message.step || !message.totalSteps) return false;
      const currentStepNum = parseInt(message.step.stepNumber);
      const totalSteps = parseInt(message.totalSteps);
      return currentStepNum >= totalSteps;
    };

    const loadFromHistory = async (session) => {
      try {
        console.log('📂 Carregando sessão do histórico:', session.title);

        let sessionDetail = session;

        if (!Array.isArray(session.messages) || session.messages.length === 0) {
          console.log('📥 Buscando detalhes completos do servidor...');
          sessionDetail = await loadSessionDetail(session.sessionId);
        }

        if (!sessionDetail) {
          throw new Error(t('chatBot.sessionNotFound'));
        }

        const realSessionId = sessionDetail.sessionId || session.sessionId;

        if (Array.isArray(sessionDetail.messages)) {
          sessionDetail.messages = sessionDetail.messages.map(msg => {
            if (msg.type === 'receita_criada' || msg.podeIniciarPassoAPasso) {
              return {
                ...msg,
                sessionId: msg.sessionId || realSessionId
              };
            }
            return msg;
          });
        }

        if (sessionDetail.chatState?.recipe) {
          sessionDetail.chatState.sessionId = realSessionId;
        }

        console.log('✅ Dados carregados:', {
          title: sessionDetail.title,
          messageCount: sessionDetail.messages?.length,
          sessionId: realSessionId
        });

        restoreSessionFromData(sessionDetail);

      } catch (err) {
        console.error('❌ Erro ao carregar sessão:', err);
        toast({
          title: t('common.error'),
          description: t('chatBot.restoreSessionError'),
          variant: "destructive"
        });
      }
    };

    const handleRating = async (value, message) => {
      setMessages(prevMessages =>
        prevMessages.map(msg => {
          if (msg.id === message.id) {
            return {
              ...msg,
              userRating: value,
              userFeedback: feedback
            };
          }
          return msg;
        })
      );

      try {
        const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");
        const userId = user?._id || user?.id;
        const recipeSessionId = message.sessionId || sessionId;

        console.log("📤 Enviando avaliação para receita específica:", {
          messageId: message.id,
          sessionId: recipeSessionId,
          rating: value,
          recipeTitle: message.recipeTitle,
          feedback: feedback
        });

        const response = await fetch(`${API_URL}/api/ratings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sessionId: recipeSessionId,
            rating: value,
            recipeTitle: message.recipeTitle,
            feedback: feedback,
            messageId: message.id
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erro ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        toast({
          title: t('chatBot.ratingSent'),
          description: t('chatBot.ratingSentDesc', { value, title: message.recipeTitle }),
          variant: "default"
        });

      } catch (err) {
        console.error("Erro ao enviar avaliação:", err);

        try {
          const localRatings = JSON.parse(localStorage.getItem('pendingRatings') || '[]');
          localRatings.push({
            messageId: message.id,
            sessionId: message.sessionId || sessionId,
            rating: value,
            recipeTitle: message.recipeTitle,
            feedback,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem('pendingRatings', JSON.stringify(localRatings));

          toast({
            title: t('chatBot.ratingSavedLocally'),
            description: t('chatBot.ratingSavedLocallyDesc', { title: message.recipeTitle }),
            variant: "default"
          });
        } catch (localErr) {
          toast({
            title: t('common.error'),
            description: t('chatBot.ratingSaveError'),
            variant: "destructive"
          });
        }
      }
    };

    const toggleFavorite = async (message) => {
      const recipeId = message.sessionId || sessionId || `recipe_${Date.now()}`;
      const isCurrentlyFavorite = favorites[recipeId];

      try {
        const token = localStorage.getItem("bomPiteuToken") || localStorage.getItem("token");
        const userId = user?._id || user?.id;

        if (!userId) {
          toast({
            title: t('common.error'),
            description: t('chatBot.userNotAuthenticated'),
            variant: "destructive"
          });
          return;
        }

        if (isCurrentlyFavorite) {
          await fetch(`${API_URL}/api/saude/${userId}/favorite/${recipeId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          await fetch(`${API_URL}/api/saude/${userId}/favorite`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              recipeId: recipeId,
              title: message.recipeTitle,
              imageUrl: message.finalImage || '',
              healthScore: message.healthScore || 8,
              difficulty: message.difficulty || t('chatBot.mediumDifficulty'),
              cookingTime: message.cookingTime || '30 min',
              ingredients: message.ingredientsUsed || []
            }),
          });
        }

        setFavorites(prev => ({
          ...prev,
          [recipeId]: !isCurrentlyFavorite
        }));

        toast({
          title: isCurrentlyFavorite ? t('chatBot.favoriteRemoved') : t('chatBot.favoriteAdded'),
          description: t('chatBot.favoriteDesc', { title: message.recipeTitle, action: isCurrentlyFavorite ? t('chatBot.removed') : t('chatBot.saved') }),
          variant: "default"
        });

      } catch (err) {
        console.error("Erro ao atualizar favoritos:", err);
        toast({
          title: t('common.error'),
          description: t('chatBot.favoriteError'),
          variant: "destructive"
        });
      }
    };

    const shareRecipe = async (message) => {
      try {
        setIsSharing(true);

        const recipeText = `🍳 RECEITA: ${message.recipeTitle}\n\n` +
          ` ${t('chatBot.time')}: ${message.cookingTime || '30 min'}\n` +
          ` ${t('chatBot.difficulty')}: ${message.difficulty || t('chatBot.mediumDifficulty')}\n\n` +
          ` ${t('chatBot.ingredients')}:\n${message.ingredientsUsed?.map(ing => `• ${ing}`).join('\n') || '• ' + t('chatBot.ingredientsNotListed')}\n\n` +
          ` ${t('chatBot.createdOnBomPiteu')}`;

        if (navigator.share) {
          try {
            await navigator.share({
              title: message.recipeTitle || t('chatBot.myRecipe'),
              text: recipeText,
              url: window.location.href,
            });
            return;
          } catch (shareErr) {
            console.log("Web Share cancelado");
          }
        }

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(recipeText)}`;

        try {
          await navigator.clipboard.writeText(recipeText);

          toast({
            title: t('chatBot.recipeCopied'),
            description: t('chatBot.recipeCopiedDesc'),
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(whatsappUrl, '_blank')}
                className="bg-green-500 text-white hover:bg-green-600 border-0"
              >
                {t('chatBot.shareOnWhatsApp')}
              </Button>
            ),
            duration: 6000,
          });
        } catch (clipboardErr) {
          alert(recipeText);
          toast({
            title: t('chatBot.recipeReady'),
            description: t('chatBot.recipeReadyDesc'),
            variant: "default"
          });
        }

      } catch (err) {
        console.error("Erro ao partilhar:", err);
        toast({
          title: t('common.error'),
          description: t('chatBot.shareError'),
          variant: "destructive"
        });
      } finally {
        setIsSharing(false);
      }
    };

    const downloadRecipe = async (message) => {
      try {
        toast({
          title: t('chatBot.generatingPDF'),
          description: t('chatBot.generatingPDFDesc'),
          duration: 2000
        });

        const recipeData = {
          title: message.recipeTitle || recipe?.title || t('chatBot.myRecipe'),
          ingredients: message.ingredientsUsed || recipe?.ingredients || [],
          time: message.cookingTime || recipe?.time || '30 min',
          difficulty: message.difficulty || recipe?.difficulty || t('chatBot.mediumDifficulty')
        };

        const ratingInfo = {
          rating: message.userRating || rating,
          feedback: message.userFeedback || feedback,
          cookingTime: message.cookingTime,
          difficulty: message.difficulty,
          ingredientsUsed: message.ingredientsUsed
        };

        await generateRecipePDF(
          recipeData,
          messages,
          ratingInfo,
          user?.name || t('chatBot.chef')
        );

        toast({
          title: t('chatBot.pdfSuccess'),
          description: t('chatBot.pdfSuccessDesc'),
          variant: "default",
          duration: 3000
        });

      } catch (err) {
        console.error("Erro ao gerar PDF:", err);

        toast({
          title: t('chatBot.pdfError'),
          description: t('chatBot.pdfErrorDesc'),
          variant: "destructive"
        });
      }
    };

    const handleHistorySearch = (e) => {
      const value = e.target.value;
      setHistorySearch(value);
      if (typeof refreshHistory === 'function') {
        refreshHistory(1, { search: value });
      }
    };

    const handleFilterAll = () => {
      if (typeof refreshHistory === 'function') {
        refreshHistory();
      }
    };

    const handleFilterCompleted = () => {
      if (typeof refreshHistory === 'function') {
        refreshHistory(1, { status: 'completed' });
      }
    };

    const handleFilterAngolan = () => {
      if (typeof refreshHistory === 'function') {
        refreshHistory(1, { category: 'angolan' });
      }
    };

    const handleFilterInternational = () => {
      if (typeof refreshHistory === 'function') {
        refreshHistory(1, { category: 'international' });
      }
    };

    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    useEffect(() => {
      if (messages.some(msg => msg.type === 'recipe-completed' && msg.showConfetti)) {
        launchConfetti();
      }
    }, [messages]);

    useEffect(() => {
      if (user?._id) {
        console.log(" ChatBot History Debug:", {
          userId: user._id,
          historyCount: recipeHistory.length,
          loading: historyLoading,
          statistics
        });
      }
    }, [user?._id, recipeHistory.length, historyLoading, statistics]);
    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const handleFocus = () => {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      };

      textarea.addEventListener('focus', handleFocus);
      return () => textarea.removeEventListener('focus', handleFocus);
    }, []);
    useEffect(() => {
      // Se o input estiver vazio e o textarea existir, resetar a altura para o padrão
      if (inputMessage === '' && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = '44px'; // altura mínima (min-h-[44px])
      }
    }, [inputMessage]);

    const renderSafeHTML = (content, className = "") => {
      if (!content) return null;

      const safeContent = typeof content === "string"
        ? content
        : (content?.text || JSON.stringify(content) || "");

      const processedContent = safeContent
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/⚠️/g, '<span class="flex items-center text-yellow-600 font-bold"><svg class="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3l8.5 14h-17L12 5zm-1 4v6h2V9h-2zm0 8v2h2v-2h-2z"/></svg>Aviso</span>');

      return (
        <div
          className={className}
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      );
    };

    if (!isMounted) return null;

    return (
      <div className="flex-1 flex overflow-hidden relative">
        <div className="fixed inset-0 w-screen h-screen bg-white dark:bg-gray-900 flex flex-col">
          {/* HEADER DINÂMICO COM INDICADOR DE SALVAMENTO */}
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 px-3 py-2 md:px-6 md:py-3 text-white relative overflow-hidden shadow-md transition-all duration-300 ease-out">
            {processingFavorite && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse z-20">
                <div className="h-full w-1/3 bg-white/30 animate-slideRight rounded-full"></div>
              </div>
            )}

            <div className="relative z-10 flex items-center justify-between gap-2 animate-fadeIn">
            </div>
            <div className="relative z-10 flex items-center justify-between gap-2 animate-fadeIn">
              <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onBack('dashboard')}
                  className="text-white hover:bg-white/20 h-8 w-8 md:h-10 md:w-10 backdrop-blur-sm shrink-0 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300" />
                </Button>

                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-xl rounded-xl md:rounded-2xl flex items-center justify-center border border-white/30 transition-all duration-500 hover:rotate-12 hover:scale-105">
                      <ChefHat className="w-5 h-5 md:w-6 md:h-6 text-white transition-transform duration-500" />

                      {isTyping && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse" />
                      )}
                      {isSaving && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-400 border-2 border-white rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h1 className="font-bold text-sm md:text-lg leading-tight truncate max-w-[120px] md:max-w-[250px] animate-fadeIn">
                      {recipe?.title || t('chatBot.kitchenAssistant')}
                    </h1>
                    <div className="flex items-center gap-1.5 text-[10px] md:text-xs opacity-90 font-medium truncate transition-opacity duration-300">
                      {recipe && currentStep ? (
                        <span className="flex items-center gap-1 animate-fadeIn">
                          <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                          {t('chatBot.stepOf', { current: currentStep.stepNumber, total: recipe.steps?.length || 8 })}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 animate-fadeIn">
                          {!recipe ? (isTyping ? t('chatBot.thinkingShort') : t('chatBot.atYourService')) : t('chatBot.readyToCook')}
                        </span>
                      )}
                      {!user?.isPremium && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex gap-0.5">
                            {Array.from({ length: usageStats.limit }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-1 w-2 rounded-full transition-colors ${i < usageStats.used
                                  ? 'bg-red-300'
                                  : 'bg-white/30'
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-[9px] text-white/60">
                            {usageStats.remaining} restantes
                          </span>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
                {recipe && (
                  <div className="relative w-9 h-9 md:w-11 md:h-11 flex items-center justify-center">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-xl rounded-lg md:rounded-xl border border-white/30 flex items-center justify-center z-10 transition-all duration-300 hover:scale-110 hover:rotate-3">
                      <span className="text-xs md:text-sm font-bold transition-transform duration-300">
                        {currentStep ? `${currentStep.stepNumber}/${recipe.steps?.length || 8}` : '1'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1 md:gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSupport(true)}
                    className="h-8 w-8 md:h-10 md:w-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <Headphones className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowHistory(true);
                      refreshHistory(1, {}, true);
                    }}
                    className="h-8 w-8 md:h-10 md:w-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <FileText className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {isSaving && (
            <div className="bg-blue-50 border-b border-blue-200 p-2 text-center animate-slideDown">
              <div className="flex items-center justify-center gap-2 text-blue-700 text-sm animate-fadeIn">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>{t('chatBot.savingProgress')}</span>
              </div>
            </div>
          )}
          {processingFavorite && (
            <div className="p-4 animate-pulse">
              <div className="flex justify-start">
                <div className="flex items-start gap-2 w-full">
                  <div className="w-8 h-8 rounded-full bg-gray-300"></div>

                  <div className="bg-white rounded-2xl p-4 shadow-sm w-full max-w-[480px]">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>

                    <div className="bg-gray-100 rounded-2xl p-4">
                      <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>

                      <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>

                      <div className="space-y-2 mb-4">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                      </div>

                      <div className="h-10 bg-gray-200 rounded-2xl"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 chat-wallpaper">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-2 w-full ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'user' ? 'bg-blue-500' : 'bg-orange-500'
                    } dark:opacity-90`}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <ChefHat className="h-4 w-4 text-white" />
                    )}
                  </div>

                  <div className={`
            rounded-2xl p-3 shadow-sm w-fit max-w-[78%] sm:max-w-[420px] lg:max-w-[480px]
            break-words whitespace-pre-wrap transition-all
            ${message.type === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
                    }
          `}>
                    {message.image && (
                      <div className="mb-3 overflow-hidden rounded-xl border border-white/20 shadow-sm bg-black/5 transition-all duration-500 hover:shadow-lg">
                        <img
                          src={message.image}
                          alt={t('chatBot.ingredientsCapture')}
                          className="w-full h-auto object-cover max-h-72 rounded-lg block transition-transform duration-700 hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {message.type === 'loading_receita_internacional' && (
                      <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl">

                        {/* Imagem placeholder animada */}
                        <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl mb-4 overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10 animate-shimmer"
                            style={{
                              backgroundSize: '200% 100%',
                              animation: 'shimmer 1.5s infinite',
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ChefHat className="h-16 w-16 text-orange-300 dark:text-orange-600 animate-pulse" />
                          </div>
                        </div>

                        {/* Título da receita */}
                        <div className="text-center mb-4">
                          <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold uppercase tracking-wider mb-1">
                            {message.pais}
                          </p>
                          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                            {message.nomeReceita}
                          </h3>
                        </div>

                        {/* Barras de loading skeleton */}
                        <div className="space-y-3 mb-4">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-3/4 mx-auto" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-1/2 mx-auto" />
                        </div>

                        {/* Passos a gerar - skeleton */}
                        <div className="space-y-2 mb-5">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-3 p-2">
                              <div className="w-7 h-7 rounded-lg bg-orange-200 dark:bg-orange-800 animate-pulse shrink-0" />
                              <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
                                style={{ width: `${70 + i * 8}%`, animationDelay: `${i * 0.15}s` }} />
                            </div>
                          ))}
                        </div>

                        {/* Texto de estado com dots animados */}
                        <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400">
                          <div className="flex gap-1">
                            {[0, 1, 2].map(i => (
                              <div key={i}
                                className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                          </div>
                          <span className="text-sm font-medium">A gerar receita com IA...</span>
                        </div>
                      </div>
                    )}

                    {renderSafeHTML(message.content, "text-sm sm:text-base leading-relaxed transition-all duration-300")}

                    {message.options && Array.isArray(message.options) && message.options.length > 0 && (
    <div className="mt-4 rounded-2xl overflow-hidden border border-orange-100 dark:border-orange-900/30">
      <div className="bg-orange-50 dark:bg-orange-900/20 px-4 py-3 flex items-center gap-2 border-b border-orange-100 dark:border-orange-900/30">
        <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
        <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">Escolhe uma receita para começar</p>
      </div>
      <div className="divide-y divide-orange-100 dark:divide-orange-900/30">
        {message.options.map((opt, i) => (
          <button
            key={`opt_${message.id}_${i}`}
            onClick={() => selectRecipeOption(i + 1)}
            disabled={loading || !sessionId}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0 text-orange-600 dark:text-orange-400 font-bold text-sm">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">
                {opt.title ?? opt.name ?? opt}
              </p>
              {(opt.description ?? opt.shortDescription) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                  {opt.description ?? opt.shortDescription}
                </p>
              )}
              {(opt.time || opt.difficulty) && (
                <div className="flex items-center gap-2 mt-1">
                  {opt.time && <span className="text-[10px] text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-1.5 py-0.5 rounded-full">{opt.time}</span>}
                  {opt.difficulty && <span className="text-[10px] text-gray-500 dark:text-gray-400">{opt.difficulty}</span>}
                </div>
              )}
            </div>
            <ChefHat className="w-4 h-4 text-orange-400 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )}

                  {message.type === "simple-recipe-start" && (
    <div className="mt-3 rounded-2xl overflow-hidden border border-purple-100 dark:border-purple-900/30 bg-white dark:bg-gray-800">
      {/* Imagem da receita (se existir) */}
      {message.finalImage && (
        <div className="relative w-full h-44 sm:h-52 overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={message.finalImage}
            alt={message.content}
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white font-bold text-base leading-snug line-clamp-2">
              {message.content}
            </p>
            {message.time && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/80 text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />{message.time}
                </span>
                {message.difficulty && (
                  <span className="text-white/80 text-xs">{message.difficulty}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sem imagem – só título */}
      {!message.finalImage && (
        <div className="px-4 pt-4 pb-2">
          <p className="font-bold text-gray-900 dark:text-white text-base">
            {message.content}
          </p>
        </div>
      )}

      {/* Ingredientes */}
      {message.ingredients && Array.isArray(message.ingredients) && message.ingredients.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Ingredientes</p>
          <div className="flex flex-wrap gap-1.5">
            {message.ingredients.map((ing, i) => (
              <span key={i} className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-100 dark:border-purple-800">
                {typeof ing === 'string' ? ing : (ing?.name || `Ingrediente ${i+1}`)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Botão iniciar passo a passo */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={generateStep}
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-500 to-pink-600 disabled:opacity-50 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />A iniciar...</>
          ) : (
            <>▶ Iniciar passo a passo</>
          )}
        </button>
      </div>
    </div>
  )}

                    <div className="text-xs opacity-70 mt-1 text-right transition-opacity duration-300">
                      {message.timestamp.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </div>

                  {message.type === 'guided_welcome' && (
    <div className="mt-3 rounded-2xl overflow-hidden border border-blue-100 dark:border-blue-900/30 bg-white dark:bg-gray-800">
      <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30 flex items-center gap-2">
        <ChefHat className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Cozinha guiada</p>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{message.content}</p>
        {message.totalSteps > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{message.totalSteps} passos no total</p>
        )}
      </div>
      <div className="px-4 pb-4">
        <button
          onClick={generateStep}
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 disabled:opacity-50 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
        >
          {loading
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />A carregar...</>
            : <>Começar <ArrowRight className="h-4 w-4" /></>
          }
        </button>
      </div>
    </div>
  )}
                  {message.type === "cooking-step" && message.step && (
    <div className="mt-3 rounded-2xl overflow-hidden border border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-gray-800">
      {/* Header do passo */}
      <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-900/30">
        <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {message.step.stepNumber}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            Passo {message.step.stepNumber} de {message.totalSteps || '?'}
          </p>
          {message.progress && (
            <div className="w-full bg-indigo-100 dark:bg-indigo-900/40 rounded-full h-1 mt-1">
              <div
                className="bg-indigo-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((parseInt(message.progress) / (message.totalSteps || 8)) * 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Imagem do passo */}
      {message.step.imageUrl && (
        <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={message.step.imageUrl}
            alt={`Passo ${message.step.stepNumber}`}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={e => { e.target.parentElement.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Descrição */}
      <div className="px-4 py-3">
        {formatCulinaryStep(message.step.description).map((line, idx) => (
          <p key={idx} className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed mb-2 last:mb-0 border-l-2 border-orange-300 dark:border-orange-600 pl-3">
            {line}.
          </p>
        ))}
      </div>

      {/* Botão próximo/finalizar */}
      <div className="px-4 pb-4">
        <button
          onClick={generateStep}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${
            isLastStep(message)
              ? 'bg-gradient-to-r from-emerald-500 to-green-600'
              : 'bg-gradient-to-r from-indigo-500 to-blue-600'
          } disabled:opacity-50`}
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />A carregar...</>
          ) : isLastStep(message) ? (
            <><Check className="h-4 w-4" /> Finalizar receita</>
          ) : (
            <>Próximo passo <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </div>
    </div>
  )}

                    {message.type === "recipe-completed" && (
    <div className="mt-3 rounded-2xl overflow-hidden border border-emerald-200 dark:border-emerald-900/30 bg-white dark:bg-gray-800">
      {/* Imagem final */}
      {message.finalImage && (
        <div className="relative w-full h-44 sm:h-52 overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={message.finalImage}
            alt={message.recipeTitle}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              <p className="text-white font-bold text-base leading-snug">{message.recipeTitle}</p>
              <div className="flex gap-2 mt-1">
                {message.cookingTime && <span className="text-white/80 text-xs flex items-center gap-1"><Clock className="h-3 w-3" />{message.cookingTime}</span>}
                {message.difficulty && <span className="text-white/80 text-xs">{message.difficulty}</span>}
              </div>
            </div>
            <div className="w-9 h-9 bg-amber-400 rounded-full flex items-center justify-center shrink-0">
              <Trophy className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* Sem imagem — header simples */}
      {!message.finalImage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-900/30">
          <Trophy className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="font-bold text-gray-900 dark:text-white text-sm">{message.recipeTitle || 'Receita concluída!'}</p>
        </div>
      )}

      {/* Avaliação */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Como correu?</p>
        <div className="flex gap-1 mb-3">
          {[1,2,3,4,5].map(value => (
            <button key={value} onClick={() => handleRating(value, message)} className="transition-transform active:scale-90">
              <Star className={`h-7 w-7 transition-colors ${(message.userRating || rating) >= value ? 'text-amber-500 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
            </button>
          ))}
        </div>
        <textarea
          placeholder="Deixa um comentário (opcional)..."
          value={message.userFeedback || feedback}
          onChange={e => {
            setMessages(prev => prev.map(msg => msg.id === message.id ? { ...msg, userFeedback: e.target.value } : msg));
            setFeedback(e.target.value);
          }}
          className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 resize-none bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
          rows={2}
        />
      </div>

      {/* Botões de acção */}
      <div className="grid grid-cols-4 border-t border-gray-100 dark:border-gray-700">
        {[
          { icon: Heart, label: favorites[sessionId] ? 'Guardado' : 'Guardar', filled: favorites[sessionId], color: 'text-red-500', action: () => toggleFavorite(message) },
          { icon: Share2, label: isSharing ? '...' : 'Partilhar', filled: false, color: 'text-blue-500', action: () => shareRecipe(message) },
          { icon: Download, label: 'PDF', filled: false, color: 'text-emerald-500', action: () => downloadRecipe(message) },
          { icon: ChefHat, label: 'Novo prato', filled: false, color: 'text-orange-500', action: () => onBack('dashboard') },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className="flex flex-col items-center gap-1 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-r border-gray-100 dark:border-gray-700 last:border-r-0"
          >
            <btn.icon className={`h-5 w-5 ${btn.color} ${btn.filled ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  )}

                  {message.type === "receita_criada" && (message.receita || message.podeIniciarPassoAPasso) && (
    <div className="mt-3 rounded-2xl overflow-hidden border border-purple-100 dark:border-purple-900/30 bg-white dark:bg-gray-800">
      {/* Imagem */}
      {!message.isResume && message.finalImage && (
        <div className="relative w-full h-44 sm:h-52 overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={message.finalImage}
            alt={message.receita?.title || message.content}
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white font-bold text-base leading-snug line-clamp-2">
              {message.receita?.title || message.content}
            </p>
            {message.receita?.time && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/80 text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />{message.receita.time}
                </span>
                {message.receita?.difficulty && (
                  <span className="text-white/80 text-xs">{message.receita.difficulty}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sem imagem — só título */}
      {(!message.finalImage || message.isResume) && (
        <div className="px-4 pt-4 pb-2">
          <p className="font-bold text-gray-900 dark:text-white text-base">
            {message.isResume ? message.mensagemInicio : (message.receita?.title || message.content)}
          </p>
        </div>
      )}

      {/* Ingredientes */}
      {!message.isResume && message.receita?.ingredients && Array.isArray(message.receita.ingredients) && message.receita.ingredients.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Ingredientes</p>
          <div className="flex flex-wrap gap-1.5">
    {message.receita.ingredients.map((ing, i) => {
      const txt = typeof ing === 'string' ? ing : (ing?.name || `Ingrediente ${i+1}`);
      return (
        <span key={i} className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-100 dark:border-purple-800">
          {txt}
        </span>
      );
    })}
  </div>
        </div>
      )}

      {/* Progresso (retomar) */}
      {message.isResume && message.totalPassos > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <span>Progresso</span>
            <span>{message.currentStepIndex}/{message.totalPassos} passos</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((message.currentStepIndex / message.totalPassos) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Botão iniciar/retomar */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={async () => {
            try {
              setLoading(true);
              const response = await iniciarPassoAPasso(message.sessionId, i18n.language);
              if (response.step) {
                addMessage("bot", t('chatBot.step', { number: response.step.stepNumber }), {
                  step: response.step,
                  imageUrl: response.step.imageUrl || '',
                  progress: response.progress,
                  totalSteps: response.totalSteps || message.totalPassos,
                  type: "cooking-step"
                });
                setCurrentStep(response.step);
              }
            } catch (error) {
              toast({ title: t('common.error'), description: t('chatBot.stepByStepError'), variant: "destructive" });
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${
            message.isResume
              ? 'bg-gradient-to-r from-indigo-500 to-blue-600'
              : 'bg-gradient-to-r from-purple-500 to-pink-600'
          } disabled:opacity-50`}
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{message.isResume ? 'A retomar...' : 'A iniciar...'}</>
          ) : (
            <>{message.isResume ? '▶ Continuar passo a passo' : '▶ Iniciar passo a passo'}</>
          )}
        </button>
      </div>
    </div>
  )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center transition-all duration-500">
                    <ChefHat className="h-4 w-4 text-white transition-transform duration-500" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm transition-all duration-500">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce transition-all duration-500"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce transition-all duration-500" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce transition-all duration-500" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-300">{t('chatBot.thinkingShort')}</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 sticky bottom-0 transition-all duration-500">
            <div className="relative flex items-center">
              <div className="relative menu-container">
                <Button
                  onClick={() => setShowMenu(!showMenu)}
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-9 h-9 hover:bg-gray-100 dark:hover:bg-gray-700 text-slate-400 dark:text-slate-500 transition-all duration-500 hover:scale-105 active:scale-95"
                >
                  <Paperclip size={20} className="transition-transform duration-500" />
                </Button>
                {showMenu && (
                  <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-3xl p-2 min-w-[220px] z-50 overflow-hidden flex flex-col transition-all duration-500 animate-fadeInUp">
                    <button
                      onClick={() => {
                        setShowCamera(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-300 transition-all duration-300 hover:translate-x-1"
                    >
                      <Camera size={18} className="text-orange-500 transition-transform duration-300" /> {t('chatBot.takePhotoNow')}
                    </button>

                    <label className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl cursor-pointer text-sm font-semibold text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 transition-all duration-300 hover:translate-x-1">
                      <Image size={18} className="text-orange-500 transition-transform duration-300" /> {t('chatBot.photoGallery')}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFile}
                        className="hidden"
                      />
                    </label>

                    <label className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl cursor-pointer text-sm font-semibold text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 transition-all duration-300 hover:translate-x-1">
                      <FileText size={18} className="text-orange-500 transition-transform duration-300" /> {t('chatBot.documentPDF')}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFile}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {showImagePreview && (
                  <div className="absolute bottom-20 left-0 bg-white dark:bg-gray-800 border-2 border-orange-300 dark:border-orange-700 shadow-2xl rounded-3xl p-4 w-[300px] z-50 transition-all duration-500 animate-fadeInUp">
                    <div className="w-full h-48 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 mb-3 transition-all duration-500 hover:shadow-lg">
                      <img
                        src={imagePreview}
                        alt={t('chatBot.imagePreview')}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white transition-all duration-500 hover:scale-105 active:scale-95"
                        onClick={async () => {
                          if (selectedImage) {
                            setLoading(true);
                            await uploadImageForOptions(selectedImage);
                            setShowImagePreview(false);
                            setSelectedImage(null);
                            setImagePreview(null);
                          }
                        }}
                      >
                        {loading ? t('chatBot.sending') : t('chatBot.sendImage')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowImagePreview(false);
                          setSelectedImage(null);
                          setImagePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="transition-all duration-500 hover:scale-105 active:scale-95 border-gray-300 dark:border-gray-600"
                      >
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </div>
                )}

                {showDocumentPreview && documentPreview && (
                  <div className="absolute bottom-20 left-0 bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-700 shadow-2xl rounded-3xl p-4 w-[300px] z-50 transition-all duration-500 animate-fadeInUp">
                    <div className="w-full h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 dark:from-blue-900/30 to-indigo-50 dark:to-indigo-900/30 mb-3 flex items-center justify-center transition-all duration-500 hover:shadow-lg">
                      <div className="text-center p-4">
                        <FileText className="h-12 w-12 text-blue-500 dark:text-blue-400 mx-auto mb-2 transition-transform duration-500" />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-full">{documentPreview.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{documentPreview.size}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white transition-all duration-500 hover:scale-105 active:scale-95"
                        onClick={async () => {
                          if (selectedDocument) {
                            setLoading(true);
                            await uploadDocumentForOptions(selectedDocument);
                            setShowDocumentPreview(false);
                            setSelectedDocument(null);
                            setDocumentPreview(null);
                          }
                        }}
                      >
                        {loading ? t('chatBot.analyzing') : t('chatBot.analyzeDocument')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowDocumentPreview(false);
                          setSelectedDocument(null);
                          setDocumentPreview(null);
                        }}
                        className="transition-all duration-500 hover:scale-105 active:scale-95 border-gray-300 dark:border-gray-600"
                      >
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <textarea
                ref={textareaRef}
                rows={1}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  autoResizeTextarea();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault(); // Impede envio, apenas insere nova linha
                  }
                  if (e.key === 'Enter' && e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(); // Envia com Shift+Enter
                  }
                }}
                placeholder={t('chatBot.inputPlaceholder')}
                className="flex-1 border border-gray-300 dark:border-gray-700 rounded-2xl px-4 py-3 pr-20 
    focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent 
    transition-all duration-500 shadow-sm hover:shadow-md focus:shadow-lg
    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
    resize-none overflow-y-auto min-h-[44px] max-h-[120px]
    scrollbar-none [&::-webkit-scrollbar]:hidden [-webkit-scrollbar]:hidden"
              />

              <div className="absolute right-0 inset-y-0 flex items-center pr-2 gap-2">
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || loading}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-full h-9 w-9 p-0 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-500 transform hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Send className="h-4 w-4 text-white transition-transform duration-500" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {showHistory && (
          <>
            <div
              className="fixed inset-0 bg-black z-30 opacity-50 transition-opacity duration-500"
              onClick={() => setShowHistory(false)}
            />
            <div
              className="fixed right-0 top-0 h-full w-full md:w-[420px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200 transition-all duration-500 animate-slideInRight"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white border-b border-gray-200 p-4 transition-all duration-500">
                <div className="flex items-center justify-between mb-3">
                  <div className="animate-fadeIn">
                    <h2 className="text-xl font-bold text-gray-800 transition-colors duration-300">{t('chatBot.myRecipes')}</h2>
                  </div>
                  <Button
                    onClick={() => setShowHistory(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-500 hover:scale-105 active:scale-95"
                    size="icon"
                  >
                    <ArrowLeft className="h-5 w-5 transition-transform duration-500" />
                  </Button>
                </div>

                <div className="relative transition-all duration-500">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-300" size={18} />
                  <input
                    type="text"
                    placeholder={t('chatBot.searchConversations')}
                    value={historySearch}
                    onChange={handleHistorySearch}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-500"
                  />
                </div>

                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs bg-white transition-all duration-500 hover:scale-105 active:scale-95"
                    onClick={handleFilterAll}
                  >
                    {t('chatBot.all')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs bg-white transition-all duration-500 hover:scale-105 active:scale-95"
                    onClick={handleFilterCompleted}
                  >
                    {t('chatBot.completed')}
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 transition-all duration-500">
                {historyLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 animate-fadeIn">
                    <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 transition-colors duration-300">{t('chatBot.loadingHistory')}</p>
                  </div>
                ) : recipeHistory.length === 0 ? (
                  <div className="text-center py-12 animate-fadeIn">
                    <MessageCircle className="h-10 w-10 text-gray-400 mx-auto mb-4 transition-transform duration-500" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2 transition-colors duration-300">
                      {t('chatBot.noConversations')}
                    </h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto transition-colors duration-300">
                      {t('chatBot.noConversationsDesc')}
                    </p>
                  </div>
                ) : (
                  recipeHistory.map(session => (
                    <HistoryCard
                      key={session.sessionId || session._id}
                      session={session}
                      onSelect={loadFromHistory}
                      onDelete={async (sessionToDelete) => {
                        if (window.confirm(t('chatBot.deleteConfirm', { title: sessionToDelete.title }))) {
                          const success = await removeSession(sessionToDelete.sessionId);
                          if (success) {
                            toast({
                              title: t('chatBot.sessionDeleted'),
                              description: t('chatBot.sessionDeletedDesc', { title: sessionToDelete.title })
                            });
                          }
                        }
                      }}
                      onExport={handleExportSession}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}

        <SupportScreen
          open={showSupport}
          onClose={() => setShowSupport(false)}
        />
        <CameraModal
          open={showCamera}
          onClose={() => setShowCamera(false)}
          onCapture={async (dataUrl) => {
            setShowCamera(false);
            setSelectedImage(new File([await (await fetch(dataUrl)).blob()], "capture.jpg", { type: "image/jpeg" }));
            setImagePreview(dataUrl);
            setShowImagePreview(true);
          }}
        />
        <UsageLimitModal
          isOpen={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          onUpgrade={(plan) => {
            setShowLimitModal(false);
            if (typeof onNavigate === 'function') {
              onNavigate('subscription');
            } else {
              onBack('dashboard');
            }
          }}
          usageStats={usageStats}
          user={user}
        />
      </div>
    );
  };

  export default ChatBot;