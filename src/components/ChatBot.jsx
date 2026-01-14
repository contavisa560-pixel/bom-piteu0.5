import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, ArrowLeft, ChefHat, User, Sparkles, Camera, AlertTriangle, Headphones, FileText, Image, Paperclip, MessageCircle, Search, Download, Check, Clock, Zap, Trophy, Star, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import SupportScreen from './SupportScreen';
import CameraModal from "./CameraModal";
import confetti from 'canvas-confetti';
import { useChatHistory } from '@/hooks/useChatHistory';
import HistoryCard from '@/components/HistoryCard';
import { saveSession } from '@/services/historyApi';

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

const ChatBot = ({ selectedCategory, onRecipeGenerated, onBack, user }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const fileInputRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [options, setOptions] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [loading, setLoading] = useState(false);
  const stepLock = useRef(false);
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

  // HOOK DE HISTÓRICO
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
  } = useChatHistory(user?._id) || {};

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
          title: recipe?.title || "Conversa interrompida",
          status: 'interrupted'
        });
      }
    };
  }, [user?._id]);

  // Efeito para mensagem inicial
  useEffect(() => {
    if (!isMounted) return;

    let initialMessage = `Olá, ${user?.name?.split(' ')[0] || 'Chef'}! Sou o teu Chef IA, pronto para a ação. O que vamos criar hoje?`;

    if (selectedCategory?.title) {
      initialMessage = `Olá! Vejo que te interessas por "${selectedCategory.title}". Diz-me o que procuras dentro desta categoria e eu crio a receita perfeita para ti!`;
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
  }, [selectedCategory, isMounted]);

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

  // Função para salvar sessão no histórico
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
        title: sessionData.title || recipe?.title || "Conversa Culinária",
        category: selectedCategory?.type || "general",
        messages: messages.map(msg => ({
          type: msg.type === "user" ? "user" : "bot",
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
          imageUrl: msg.image || msg.imageUrl || msg.step?.imageUrl || msg.finalImage,
          metadata: {
            stepNumber: msg.step?.stepNumber,
            recipeTitle: msg.recipeTitle || recipe?.title,
            imageUrl: msg.image || msg.imageUrl || msg.step?.imageUrl
          },
          timestamp: msg.timestamp
        })),
        recipeData: recipe ? {
          recipeId: currentSessionId,
          title: recipe.title,
          ingredients: recipe.ingredients || [],
          steps: recipe.steps || [],
          finalImage: recipe.finalImage,
          completed: currentStep?.stepNumber >= ((recipe.steps?.length) || 0)
        } : null,
        statistics: {
          messageCount: messages.length,
          imageCount: messages.filter(m => m.image || m.imageUrl || m.step?.imageUrl || m.finalImage).length,
          recipeSteps: recipe?.steps?.length || 0,
          duration: Math.round((Date.now() - sessionStartTime) / 60000)
        },
        status: sessionData.status || 'active',
        lastActivity: new Date()
      };

      await saveSession(sessionPayload);

      if (typeof refreshHistory === 'function') {
        refreshHistory();
      }

      setLastSavedAt(new Date());

    } catch (err) {
      console.error("Erro ao salvar no histórico:", err);
    } finally {
      setIsSaving(false);
    }
  }, [user, isSaving, sessionId, selectedCategory, messages, recipe, currentStep, refreshHistory, sessionStartTime]);

  const handleExportSession = useCallback(async (session, format = 'json') => {
    try {
      const success = await exportSessionData(session.sessionId, format);

      if (success) {
        toast({
          title: "Exportação concluída",
          description: `Receita "${session.title}" exportada com sucesso!`,
          variant: "default"
        });
      } else {
        throw new Error("Falha na exportação");
      }
    } catch (err) {
      console.error("Erro ao exportar:", err);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar a receita",
        variant: "destructive"
      });
    }
  }, [exportSessionData]);

  // Salva automaticamente em momentos-chave
  useEffect(() => {
    if (!autoSaveEnabled || !sessionId || messages.length === 0) return;

    const saveTimeout = setTimeout(() => {
      if (messages.length > 0 && messages.length % 3 === 0) {
        saveToHistory({
          sessionId,
          title: recipe?.title || "Conversa em progresso",
          status: 'active'
        });
      }
    }, 5000);

    return () => clearTimeout(saveTimeout);
  }, [messages.length, sessionId, autoSaveEnabled, recipe, saveToHistory]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verificar se é imagem ou documento
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
        title: "Formato não suportado",
        description: "Por favor, envia apenas imagens ou documentos PDF",
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

    const token = localStorage.getItem("bomPiteuUserToken") || localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auto-recipe/options`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      addMessage("user", "Enviei foto dos ingredientes");
      addMessage("bot", "Analisando ingredientes...");

      const newSessionId = data.sessionId || sessionId || generateSessionId();
      setSessionId(newSessionId);
      setOptions(data.options || []);

      setTimeout(() => {
        addMessage("bot", "Receitas encontradas:", {
          options: data.options || [],
          sessionId: newSessionId
        });
      }, 1200);

      return data;
    } catch (err) {
      addMessage("bot", "Erro na análise da foto");
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

    const token = localStorage.getItem("bomPiteuUserToken") || localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auto-recipe/document-options`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      addMessage("user", "Enviei um documento com receitas");
      addMessage("bot", "Analisando documento...");

      const newSessionId = data.sessionId || sessionId || generateSessionId();
      setSessionId(newSessionId);
      setOptions(data.options || []);

      setTimeout(() => {
        addMessage("bot", "Receitas extraídas do documento:", {
          options: data.options || [],
          sessionId: newSessionId,
          documentName: file.name
        });
      }, 1500);

      return data;
    } catch (err) {
      addMessage("bot", "Erro na análise do documento");
      console.error(err);
    } finally {
      setLoading(false);
      setProcessingStep(false);
    }
  };

  // ESCOLHER RECEITA (1, 2 ou 3)
  const selectRecipeOption = async (choice) => {
    if (!sessionId) {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
    }

    setProcessingStep(true);
    setLoading(true);

    const token = localStorage.getItem("bomPiteuUserToken") || localStorage.getItem("token");

    try {
      // Adiciona mensagem de processamento
      addMessage("bot", " Estou a processar a tua escolha...");

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
        throw new Error("Receita não encontrada na resposta");
      }

      setRecipe(data.recipe);
      
      // Remove a mensagem de processamento e adiciona resultado
      setMessages(prev => prev.filter(msg => msg.content !== " Estou a processar a tua escolha..."));
      
      addMessage("bot", data.recipe.title || "Receita selecionada", {
        finalImage: data.finalImage,
        ingredients: data.recipe.ingredients || [],
        type: "simple-recipe-start"
      });

      setTimeout(() => {
        saveToHistory({
          sessionId,
          title: data.recipe.title || "Receita selecionada",
          status: 'active'
        });
      }, 1000);

    } catch (err) {
      console.error("Erro ao selecionar receita:", err);
      toast({
        title: "Erro",
        description: "Não foi possível selecionar a receita. Tenta novamente.",
        variant: "destructive",
      });
      addMessage("bot", "Desculpa, houve um erro ao selecionar a receita. Podes tentar novamente?");
    } finally {
      setLoading(false);
      setProcessingStep(false);
    }
  };

  // PRÓXIMO PASSO
  const generateStep = async () => {
    if (!sessionId || stepLock.current || loading) {
      return;
    }

    if (!recipe) {
      addMessage("bot", "Primeiro seleciona uma receita para começar!");
      return;
    }

    stepLock.current = true;
    setLoading(true);

    try {
      const token = localStorage.getItem("bomPiteuUserToken") || localStorage.getItem("token");
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

        addMessage("bot", `Passo ${data.step.stepNumber}`, {
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

        addMessage("bot", ` RECEITA CONCLUÍDA!`, {
          id: uniqueId,
          type: "recipe-completed",
          finalImage: data.finalImage || '',
          recipeTitle: data.recipeTitle || recipe.title || 'Sua receita',
          ingredientsUsed: data.ingredientsUsed || [],
          cookingTime: data.cookingTime || '30 min',
          difficulty: data.difficulty || 'Média',
          showConfetti: true,
          timestamp: new Date()
        });

        setTimeout(() => {
          saveToHistory({
            sessionId,
            title: recipe.title || "Receita concluída",
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
        addMessage("bot", "Estou a preparar o próximo passo...");
      }

    } catch (err) {
      console.error("Erro ao gerar passo:", err);
      addMessage("bot", "Erro ao buscar próximo passo. Tenta novamente em alguns segundos.");
      toast({
        title: "Erro",
        description: "Problema ao gerar o passo. Verifica a tua conexão.",
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
    const token = localStorage.getItem("bomPiteuUserToken") || localStorage.getItem("token");

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

  const token = localStorage.getItem("bomPiteuUserToken") || localStorage.getItem("token");
  const handleSendMessage = async (messageOverride) => {
    const currentInput = messageOverride || inputMessage;
    if (!currentInput.trim() || loading) return;

    // Garante que temos uma sessão
    if (!sessionId) {
      initializeSession();
    }

    const userMessage = { id: Date.now(), type: "user", content: currentInput, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    if (!messageOverride) setInputMessage("");
    setIsTyping(true);

    try {
      // Adiciona mensagem de processamento visual
      addMessage("bot", " Estou a pensar nas melhores receitas para ti...");

      // Tenta buscar opções de receita baseadas em texto
      const options = await fetchRecipeOptions(currentInput, selectedCategory?.title);

      // Remove a mensagem de processamento
      setMessages(prev => prev.filter(msg => msg.content !== " Estou a pensar nas melhores receitas para ti..."));

      if (currentInput.toLowerCase().includes('tenho') || currentInput.includes(',') || currentInput.includes('ingredientes')) {
        const formData = new FormData();
        formData.append('ingredients', currentInput);

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auto-recipe/options`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        const data = await res.json();
        const newSessionId = data.sessionId || generateSessionId();
        setSessionId(newSessionId);
        setOptions(data.options || []);

        addMessage("bot", " Receitas IA com teus ingredientes:", {
          options: data.options || [],
          sessionId: newSessionId,
          type: "auto-recipe-options"
        });
        
        setIsTyping(false);
        return;
      }

      if (options.length === 0) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            type: "bot",
            content: "Desculpa, não consegui encontrar receitas com esses ingredientes. Podes ser mais específico ou tentar com outros ingredientes?",
            timestamp: new Date()
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            type: "bot",
            text: "Receitas encontradas:",
            options: options,
            timestamp: new Date(),
          },
        ]);
      }
      
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      toast({
        title: "Erro",
        description: "Não foi possível processar a tua mensagem.",
        variant: "destructive",
      });
      
      setMessages(prev => [
        ...prev,
        { 
          id: Date.now() + 1, 
          type: "bot", 
          content: "Desculpa, estou com problemas técnicos. Podes tentar novamente ou descrever os ingredientes que tens?", 
          timestamp: new Date() 
        }
      ]);
    } finally {
      setIsTyping(false);
      
      setTimeout(() => {
        saveToHistory({
          sessionId: sessionId || generateSessionId(),
          title: "Mensagem enviada",
          status: 'active'
        });
      }, 500);
    }
  };

  const isLastStep = (message) => {
    if (!message || !message.step || !message.totalSteps) return false;
    const currentStepNum = parseInt(message.step.stepNumber);
    const totalSteps = parseInt(message.totalSteps);
    return currentStepNum >= totalSteps;
  };

  // Função para carregar sessão do histórico
  const loadFromHistory = async (session) => {
    try {
      const sessionDetail = await loadSessionDetail(session.sessionId);

      if (!sessionDetail) return;

      setSessionId(session.sessionId);

      const restoredMessages = sessionDetail.messages.map(msg => {
        const safeContent = typeof msg.content === 'string'
          ? msg.content
          : (msg.content?.text || JSON.stringify(msg.content) || "");

        return {
          id: `hist_${msg._id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: msg.type,
          content: safeContent,
          image: msg.imageUrl,
          imageUrl: msg.imageUrl,
          timestamp: new Date(msg.timestamp),
          metadata: msg.metadata,
          ...(msg.metadata?.stepNumber && {
            step: {
              stepNumber: msg.metadata.stepNumber,
              description: safeContent
            }
          })
        };
      });

      setMessages(restoredMessages);

      if (sessionDetail.recipeData) {
        setRecipe(sessionDetail.recipeData);
        if (sessionDetail.recipeData.steps?.length > 0) {
          setCurrentStep(sessionDetail.recipeData.steps[sessionDetail.recipeData.steps.length - 1]);
        }
      }

      setShowHistory(false);

      toast({
        title: "Sessão carregada",
        description: `"${session.title}" restaurada com sucesso!`,
        variant: "default"
      });

    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a sessão",
        variant: "destructive"
      });
    }
  };

  // Funções para avaliação e favoritos
  const handleRating = async (value, message) => {
    setRating(value);
    
    try {
      const token = localStorage.getItem("bomPiteuUserToken") || localStorage.getItem("token");
      
      await fetch(`${import.meta.env.VITE_API_URL}/api/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          sessionId, 
          rating: value, 
          recipeTitle: message.recipeTitle,
          feedback 
        }),
      });
      
      toast({
        title: "Avaliação enviada",
        description: `Obrigado pela tua avaliação de ${value}/5 estrelas!`,
        variant: "default"
      });
      
    } catch (err) {
      console.error("Erro ao enviar avaliação:", err);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a avaliação",
        variant: "destructive"
      });
    }
  };

  const toggleFavorite = async (message) => {
    if (!sessionId) return;
    
    const isCurrentlyFavorite = favorites[sessionId];
    
    try {
      const token = localStorage.getItem("bomPiteuUserToken") || localStorage.getItem("token");
      
      if (isCurrentlyFavorite) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/favorites/${sessionId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await fetch(`${import.meta.env.VITE_API_URL}/api/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            sessionId, 
            userId: user?._id,
            recipeTitle: message.recipeTitle,
            recipeData: recipe
          }),
        });
      }
      
      setFavorites(prev => ({
        ...prev,
        [sessionId]: !isCurrentlyFavorite
      }));
      
      toast({
        title: isCurrentlyFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
        description: `"${message.recipeTitle}" ${isCurrentlyFavorite ? 'removido' : 'adicionado'} com sucesso!`,
        variant: "default"
      });
      
    } catch (err) {
      console.error("Erro ao atualizar favoritos:", err);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos",
        variant: "destructive"
      });
    }
  };

  const shareRecipe = async (message) => {
    try {
      setIsSharing(true);
      
      // Tentar Web Share API primeiro
      if (navigator.share) {
        try {
          await navigator.share({
            title: message.recipeTitle || "Minha Receita",
            text: `Acabei de criar "${message.recipeTitle}" no Bom Pitéu!`,
            url: window.location.href,
          });
          return;
        } catch (err) {
          console.log("Web Share cancelled");
        }
      }
      
      // Fallback: Copiar para clipboard
      const recipeText = `Receita: ${message.recipeTitle}\n\nIngredientes:\n${message.ingredientsUsed?.join('\n') || ''}\n\nCriada no Bom Pitéu App`;
      
      await navigator.clipboard.writeText(recipeText);
      
      toast({
        title: "Receita copiada",
        description: "A receita foi copiada para a área de transferência!",
        variant: "default"
      });
      
    } catch (err) {
      console.error("Erro ao partilhar:", err);
      toast({
        title: "Erro",
        description: "Não foi possível partilhar a receita",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  const downloadRecipe = async (message) => {
    try {
      const content = {
        title: message.recipeTitle,
        ingredients: message.ingredientsUsed,
        rating,
        completedAt: new Date(),
        sessionId: sessionId
      };

      const blob = new Blob([JSON.stringify(content, null, 2)], {
        type: "application/json"
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${message.recipeTitle || 'receita'}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Receita exportada",
        description: "A receita foi exportada em formato JSON",
        variant: "default"
      });

    } catch (err) {
      console.error("Erro ao exportar:", err);
      toast({
        title: "Erro",
        description: "Não foi possível exportar a receita",
        variant: "destructive"
      });
    }
  };

  // Função auxiliar para atualizar histórico com busca
  const handleHistorySearch = (e) => {
    const value = e.target.value;
    setHistorySearch(value);
    if (typeof refreshHistory === 'function') {
      refreshHistory(1, { search: value });
    }
  };

  // Funções simplificadas para filtros
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

  // Função para renderizar conteúdo HTML seguro
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
      <div className="fixed inset-0 w-screen h-screen bg-white flex flex-col">
        {/* HEADER DINÂMICO COM INDICADOR DE SALVAMENTO */}
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 px-3 py-2 md:px-6 md:py-3 text-white relative overflow-hidden shadow-md transition-all duration-300 ease-out">
          <div className="relative z-10 flex items-center justify-between gap-2 animate-fadeIn">
            {/* ESQUERDA: BACK + CHEF INFO */}
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
                    {recipe?.title || 'Chef IA'}
                  </h1>
                  <div className="flex items-center gap-1.5 text-[10px] md:text-xs opacity-90 font-medium truncate transition-opacity duration-300">
                    {recipe && currentStep ? (
                      <span className="flex items-center gap-1 animate-fadeIn">
                        <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                        Passo {currentStep.stepNumber}/{recipe.steps?.length || 8}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 animate-fadeIn">
                        {!recipe ? (isTyping ? 'A pensar...' : 'Às tuas ordens!') : 'Prontos para cozinhar!'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* DIREITA: PROGRESSO + AÇÕES */}
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
                  onClick={() => setShowHistory(true)}
                  className="h-8 w-8 md:h-10 md:w-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <FileText className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* MENSAGEM DE STATUS DE SALVAMENTO */}
        {isSaving && (
          <div className="bg-blue-50 border-b border-blue-200 p-2 text-center animate-slideDown">
            <div className="flex items-center justify-center gap-2 text-blue-700 text-sm animate-fadeIn">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Guardando progresso...</span>
            </div>
          </div>
        )}

        {/* ÁREA DE MENSAGENS */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} transition-all duration-500 ease-out animate-fadeIn`}
            >
              <div
                className={`flex items-start gap-2 w-full ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${message.type === 'user' ? 'bg-blue-500' : 'bg-orange-500'} hover:scale-110`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4 text-white transition-transform duration-500" />
                  ) : (
                    <ChefHat className="h-4 w-4 text-white transition-transform duration-500" />
                  )}
                </div>

                <div
                  className={`
                    rounded-2xl p-3 shadow-sm
                    w-fit
                    max-w-[78%]
                    sm:max-w-[420px]
                    lg:max-w-[480px]
                    break-words whitespace-pre-wrap
                    transition-all duration-500 ease-out
                    transform hover:scale-[1.01]
                    ${message.type === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none ml-auto animate-slideInRight'
                      : 'bg-white text-gray-800 rounded-bl-none mr-auto animate-slideInLeft'
                    }
                  `}
                >
                  {message.image && (
                    <div className="mb-3 overflow-hidden rounded-xl border border-white/20 shadow-sm bg-black/5 transition-all duration-500 hover:shadow-lg">
                      <img
                        src={message.image}
                        alt="Captura de ingredientes"
                        className="w-full h-auto object-cover max-h-72 rounded-lg block transition-transform duration-700 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* USANDO renderSafeHTML PARA RENDERIZAR CONTEÚDO */}
                  {renderSafeHTML(message.content, "text-sm sm:text-base leading-relaxed transition-all duration-300")}

                  {/* OPÇÕES DE RECEITA */}
                  {message.options && Array.isArray(message.options) && message.options.length > 0 && (
                    <div className="space-y-4 mt-6 p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl border-4 border-orange-200 shadow-2xl transition-all duration-700 animate-fadeInUp">
                      <div className="flex items-center gap-3 mb-6 p-4 bg-white/50 rounded-2xl backdrop-blur-sm transition-all duration-500 hover:bg-white/70">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 hover:rotate-12 hover:scale-110">
                          <Sparkles className="w-5 h-5 text-white transition-transform duration-500" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-orange-800 transition-colors duration-300">Aqui estão algumas receitas:</h3>
                          <p className="text-sm text-orange-700 transition-colors duration-300">Clica numa para começar a cozinhar!</p>
                        </div>
                      </div>

                      {message.options.map((opt, i) => (
                        <button
                          key={`opt_${message.id}_${i}`}
                          onClick={() => selectRecipeOption(i + 1)}
                          disabled={loading || !sessionId}
                          className="group w-full p-6 bg-white/80 backdrop-blur-sm border-2 border-orange-200 rounded-2xl hover:border-orange-400 hover:shadow-2xl hover:bg-white transition-all duration-500 shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed animate-fadeInUp"
                          style={{ animationDelay: `${i * 100}ms` }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="font-bold text-xl text-gray-800 mb-3 group-hover:text-orange-700 transition-colors duration-300">
                                {i + 1}. {opt.title ?? opt.name ?? opt}
                              </div>
                              <p className="text-base text-gray-600 leading-relaxed line-clamp-2 transition-colors duration-300">
                                {opt.description ?? opt.shortDescription ?? ''}
                              </p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500">
                              <ChefHat className="w-7 h-7 text-white transition-transform duration-500 group-hover:rotate-12" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* RECEITA SIMPLES */}
                  {message.type === "simple-recipe-start" && (
                    <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl text-center mt-4 transition-all duration-700 animate-fadeInUp">
                      <h2 className="text-2xl font-bold text-green-800 mb-4 animate-fadeIn">
                        {message.content}
                      </h2>

                      {message.finalImage && (
                        <div className="max-w-md mx-auto mb-6 transition-all duration-700 hover:scale-[1.02]">
                          <img
                            src={message.finalImage}
                            alt="Prato final"
                            className="w-full h-64 object-cover rounded-2xl shadow-xl transition-transform duration-700"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {message.ingredients && Array.isArray(message.ingredients) && message.ingredients.length > 0 && (
                        <div className="mt-4 mb-6 text-left animate-fadeIn">
                          <h4 className="font-semibold text-green-800 mb-2 transition-colors duration-300">Ingredientes:</h4>
                          <ul className="list-disc list-inside text-green-700 space-y-1 transition-all duration-300">
                            {message.ingredients.map((ing, i) => (
                              <li key={i} className="transition-all duration-300 hover:translate-x-2">{ing}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <button
                        onClick={generateStep}
                        disabled={!recipe || loading}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-8 rounded-2xl text-xl font-bold shadow-xl hover:shadow-2xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] animate-fadeInUp"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Carregando...
                          </span>
                        ) : (
                          'COZINHAR AGORA'
                        )}
                      </button>
                    </div>
                  )}

                  <div className="text-xs opacity-70 mt-1 text-right transition-opacity duration-300">
                    {message.timestamp.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {/* PASSOS DE COZINHA */}
                  {message.type === "cooking-step" && message.step && (
                    <div className="space-y-4 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl border-4 border-indigo-200 mt-4 transition-all duration-700 animate-fadeInUp">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg transition-all duration-500 hover:rotate-12 hover:scale-110">
                          {message.step.stepNumber}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-indigo-800 animate-fadeIn">Passo {message.step.stepNumber}</h3>
                          <p className="text-sm text-indigo-600 transition-colors duration-300">
                            Passo {message.step.stepNumber} de {message.totalSteps || 8}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {formatCulinaryStep(message.step.description).map((line, index) => (
                          <div key={index} className="border-l-4 border-orange-400 pl-4 transition-all duration-500 hover:border-orange-500 hover:translate-x-1">
                            <p className="text-lg leading-relaxed text-gray-800 transition-colors duration-300">
                              {line}.
                            </p>
                          </div>
                        ))}
                      </div>

                      {message.step.imageUrl && (
                        <div className="w-full max-w-2xl mx-auto transition-all duration-700 hover:scale-[1.02]">
                          <img
                            src={message.step.imageUrl}
                            alt={`Passo ${message.step.stepNumber}`}
                            className="w-full h-64 object-cover rounded-2xl shadow-2xl border-4 border-white transition-transform duration-700"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {!isLastStep(message) ? (
                        <button
                          onClick={generateStep}
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl mt-6 disabled:opacity-50 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] animate-fadeInUp"
                        >
                          {loading ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Carregando...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              Próximo Passo
                            </span>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={generateStep}
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl mt-6 disabled:opacity-50 transition-all duration-500 border-2 border-emerald-400 hover:scale-[1.02] active:scale-[0.98] animate-fadeInUp"
                        >
                          {loading ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Finalizando...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <Check className="h-5 w-5 transition-transform duration-500" />
                              Finalizar Receita
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* CONCLUSÃO DA RECEITA COMPLETA */}
                  {message.type === "recipe-completed" && (
                    <div className="final-recipe-card relative overflow-hidden rounded-3xl border-4 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 shadow-2xl my-6 p-8 max-w-2xl mx-auto transition-all duration-1000 animate-fadeInUp">
                      {/* BACKGROUND DECORATIVO */}
                      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-cyan-400 animate-gradient-x"></div>
                      
                      {/* HEADER */}
                      <div className="text-center mb-8">
                        <div className="w-24 h-24 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl transition-all duration-700 hover:rotate-12 hover:scale-110">
                          <Trophy className="h-12 w-12 text-white transition-transform duration-700" />
                        </div>
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-2 animate-fadeIn">
                          🎉 RECEITA CONCLUÍDA!
                        </h2>
                        <p className="text-lg text-emerald-700 mb-4 transition-colors duration-300">
                          Parabéns, Chef! Missão cumprida com sucesso!
                        </p>
                        <div className="text-xl font-bold text-gray-800 animate-fadeIn">
                          {message.recipeTitle || "Sua Receita"}
                        </div>
                      </div>

                      {/* IMAGEM FINAL */}
                      {message.finalImage && (
                        <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl border-4 border-white transition-all duration-700 hover:scale-[1.02]">
                          <img
                            src={message.finalImage}
                            alt={message.recipeTitle || "Prato final"}
                            className="w-full h-64 object-cover transition-transform duration-700"
                            loading="lazy"
                          />
                          <div className="bg-white/80 backdrop-blur-sm p-3 text-center text-sm text-gray-600 transition-all duration-300">
                            Prato final preparado por ti!
                          </div>
                        </div>
                      )}

                      {/* ESTATÍSTICAS */}
                      {(message.cookingTime || message.difficulty) && (
                        <div className="grid grid-cols-2 gap-4 mb-8">
                          {message.cookingTime && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-emerald-100 transition-all duration-500 hover:scale-105 hover:shadow-lg">
                              <Clock className="h-6 w-6 text-emerald-600 mx-auto mb-2 transition-transform duration-500" />
                              <div className="font-bold text-gray-800">{message.cookingTime}</div>
                              <div className="text-xs text-gray-600">Tempo de preparação</div>
                            </div>
                          )}
                          {message.difficulty && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-emerald-100 transition-all duration-500 hover:scale-105 hover:shadow-lg">
                              <Zap className="h-6 w-6 text-amber-600 mx-auto mb-2 transition-transform duration-500" />
                              <div className="font-bold text-gray-800">{message.difficulty}</div>
                              <div className="text-xs text-gray-600">Dificuldade</div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* AVALIAÇÃO REAL */}
                      <div className="text-center mb-8 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-emerald-100 transition-all duration-500 animate-fadeIn">
                        <p className="text-sm font-medium text-gray-700 mb-3 transition-colors duration-300">
                          Como avalias esta experiência?
                        </p>
                        <div className="flex justify-center gap-1 mb-4">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              onClick={() => handleRating(value, message)}
                              className="transition-all duration-300 hover:scale-110"
                            >
                              <Star
                                className={`h-10 w-10 transition-all duration-300 ${
                                  rating >= value 
                                    ? "text-amber-500 fill-current" 
                                    : "text-gray-300 hover:text-amber-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        {rating && (
                          <p className="text-sm text-emerald-600 font-medium animate-fadeIn">
                            Avaliação enviada: <span className="text-amber-600">{rating}/5</span> estrelas!
                          </p>
                        )}
                        
                        {/* FEEDBACK OPCIONAL */}
                        <div className="mt-4 animate-fadeIn">
                          <textarea
                            placeholder="Partilha a tua experiência (opcional)..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full p-3 border border-emerald-200 rounded-xl text-sm resize-none transition-all duration-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                            rows="2"
                          />
                        </div>
                      </div>

                      {/* AÇÕES PRINCIPAIS */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {/* FAVORITO */}
                        <button
                          onClick={() => toggleFavorite(message)}
                          className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white hover:bg-red-50 border-2 border-gray-200 hover:border-red-200 transition-all duration-500 hover:scale-105 animate-fadeInUp"
                          style={{ animationDelay: '100ms' }}
                        >
                          <Heart 
                            className={`h-7 w-7 transition-all duration-500 ${
                              favorites[sessionId] 
                                ? "text-red-500 fill-current" 
                                : "text-gray-600 group-hover:text-red-500"
                            }`}
                          />
                          <span className="text-sm font-medium transition-colors duration-300">
                            {favorites[sessionId] ? "Favorita" : "Favoritar"}
                          </span>
                        </button>

                        {/* PARTILHAR */}
                        <button
                          onClick={() => shareRecipe(message)}
                          disabled={isSharing}
                          className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-200 transition-all duration-500 hover:scale-105 disabled:opacity-50 animate-fadeInUp"
                          style={{ animationDelay: '200ms' }}
                        >
                          <Share2 className="h-7 w-7 text-gray-600 group-hover:text-blue-600 transition-colors duration-500" />
                          <span className="text-sm font-medium transition-colors duration-300">
                            {isSharing ? "A partilhar..." : "Partilhar"}
                          </span>
                        </button>

                        {/* DOWNLOAD */}
                        <button
                          onClick={() => downloadRecipe(message)}
                          className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white hover:bg-emerald-50 border-2 border-gray-200 hover:border-emerald-200 transition-all duration-500 hover:scale-105 animate-fadeInUp"
                          style={{ animationDelay: '300ms' }}
                        >
                          <Download className="h-7 w-7 text-gray-600 group-hover:text-emerald-600 transition-colors duration-500" />
                          <span className="text-sm font-medium transition-colors duration-300">Download</span>
                        </button>

                        {/* MENU */}
                        <button
                          onClick={() => onBack("dashboard")}
                          className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-105 animate-fadeInUp"
                          style={{ animationDelay: '400ms' }}
                        >
                          <ChefHat className="h-7 w-7 transition-transform duration-500" />
                          <span className="text-sm font-medium">Novo Prato</span>
                        </button>
                      </div>

                      {/* MENSAGEM DE SUCESSO */}
                      <div className="mt-8 text-center animate-fadeIn">
                        <p className="text-sm text-gray-500 transition-colors duration-300">
                          Esta receita foi automaticamente guardada no teu histórico
                        </p>
                        <button
                          onClick={() => setShowHistory(true)}
                          className="text-emerald-600 hover:text-emerald-800 text-sm font-medium mt-2 underline transition-colors duration-300"
                        >
                          Ver todas as receitas
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
                <div className="bg-white rounded-2xl p-4 shadow-sm transition-all duration-500">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce transition-all duration-500"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce transition-all duration-500" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce transition-all duration-500" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 transition-colors duration-300">Chef IA está a pensar...</p>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* FOOTER DO CHAT */}
        <div className="border-t p-4 bg-white sticky bottom-0 transition-all duration-500">
          <div className="relative flex items-center">
            {/* BOTÃO PAPERCLIP */}
            <div className="relative">
              <Button
                onClick={() => setShowMenu(!showMenu)}
                variant="ghost"
                size="icon"
                className="rounded-full w-9 h-9 hover:bg-white text-slate-400 transition-all duration-500 hover:scale-105 active:scale-95"
              >
                <Paperclip size={20} className="transition-transform duration-500" />
              </Button>

              {/* MENU DE ANEXOS */}
              {showMenu && (
                <div className="absolute bottom-12 left-0 bg-white border border-slate-100 shadow-2xl rounded-3xl p-2 min-w-[220px] z-50 overflow-hidden flex flex-col transition-all duration-500 animate-fadeInUp">
                  <button
                    onClick={() => {
                      setShowCamera(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl text-sm font-semibold text-slate-600 transition-all duration-300 hover:translate-x-1"
                  >
                    <Camera size={18} className="text-orange-500 transition-transform duration-300" /> Tirar Foto Agora
                  </button>

                  <label className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer text-sm font-semibold text-slate-600 border-t border-slate-50 transition-all duration-300 hover:translate-x-1">
                    <Image size={18} className="text-orange-500 transition-transform duration-300" /> Galeria de Fotos
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFile}
                      className="hidden"
                    />
                  </label>

                  <label className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer text-sm font-semibold text-slate-600 border-t border-slate-50 transition-all duration-300 hover:translate-x-1">
                    <FileText size={18} className="text-orange-500 transition-transform duration-300" /> Documento/PDF
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                      onChange={handleFile} 
                      className="hidden" 
                    />
                  </label>
                </div>
              )}

              {/* PREVIEW DA IMAGEM */}
              {showImagePreview && (
                <div className="absolute bottom-20 left-0 bg-white border-2 border-orange-300 shadow-2xl rounded-3xl p-4 w-[300px] z-50 transition-all duration-500 animate-fadeInUp">
                  <div className="w-full h-48 rounded-2xl overflow-hidden bg-gray-100 mb-3 transition-all duration-500 hover:shadow-lg">
                    <img
                      src={imagePreview}
                      alt="Preview da imagem"
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
                      {loading ? "Enviando..." : "Enviar Imagem"}
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
                      className="transition-all duration-500 hover:scale-105 active:scale-95"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {/* PREVIEW DO DOCUMENTO */}
              {showDocumentPreview && documentPreview && (
                <div className="absolute bottom-20 left-0 bg-white border-2 border-blue-300 shadow-2xl rounded-3xl p-4 w-[300px] z-50 transition-all duration-500 animate-fadeInUp">
                  <div className="w-full h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 mb-3 flex items-center justify-center transition-all duration-500 hover:shadow-lg">
                    <div className="text-center p-4">
                      <FileText className="h-12 w-12 text-blue-500 mx-auto mb-2 transition-transform duration-500" />
                      <p className="text-sm font-medium text-gray-700 truncate max-w-full">{documentPreview.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{documentPreview.size}</p>
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
                      {loading ? "Analisando..." : "Analisar Documento"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowDocumentPreview(false);
                        setSelectedDocument(null);
                        setDocumentPreview(null);
                      }}
                      className="transition-all duration-500 hover:scale-105 active:scale-95"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* INPUT DE TEXTO */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Tenho frango, tomate e cebola..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-3 pr-20 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-500 shadow-sm hover:shadow-md focus:shadow-lg"
            />

            {/* BOTÃO ENVIAR */}
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

      {/* HISTÓRICO */}
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
                  <h2 className="text-xl font-bold text-gray-800 transition-colors duration-300">Histórico de Conversas</h2>
                  <p className="text-gray-600 text-sm transition-colors duration-300">
                    {statistics?.totalSessions || 0} sessões • {statistics?.totalMessages || 0} mensagens
                  </p>
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
                  placeholder="Buscar conversas..."
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
                  Todas
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs bg-white transition-all duration-500 hover:scale-105 active:scale-95"
                  onClick={handleFilterCompleted}
                >
                  Concluídas
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs bg-white transition-all duration-500 hover:scale-105 active:scale-95"
                  onClick={handleFilterAngolan}
                >
                  Angolanas
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 transition-all duration-500">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center h-64 animate-fadeIn">
                  <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600 transition-colors duration-300">Carregando histórico...</p>
                </div>
              ) : recipeHistory.length === 0 ? (
                <div className="text-center py-12 animate-fadeIn">
                  <MessageCircle className="h-10 w-10 text-gray-400 mx-auto mb-4 transition-transform duration-500" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2 transition-colors duration-300">
                    Nenhuma conversa salva
                  </h3>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto transition-colors duration-300">
                    As tuas conversas com o Chef IA aparecerão aqui
                  </p>
                </div>
              ) : (
                recipeHistory.map(session => (
                  <HistoryCard
                    key={session.sessionId || session._id}
                    session={session}
                    onSelect={loadFromHistory}
                    onDelete={async (sessionToDelete) => {
                      if (window.confirm(`Eliminar "${sessionToDelete.title}"?`)) {
                        const success = await removeSession(sessionToDelete.sessionId);
                        if (success) {
                          toast({
                            title: "Sessão eliminada",
                            description: `"${sessionToDelete.title}" foi removida.`
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

      {/* COMPONENTES EXTERNOS */}
      <SupportScreen
        open={showSupport}
        onClose={() => setShowSupport(false)}
      />
      <CameraModal
        open={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={async (dataUrl) => {
          setShowCamera(false);

          // Mostrar preview da foto tirada
          setSelectedImage(new File([await (await fetch(dataUrl)).blob()], "capture.jpg", { type: "image/jpeg" }));
          setImagePreview(dataUrl);
          setShowImagePreview(true);
        }}
      />
    </div>
  );
};

export default ChatBot;