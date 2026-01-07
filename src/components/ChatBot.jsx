import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, ChefHat, User, Sparkles, Camera, Mic, AlertTriangle, Headphones, FileText, Image, Paperclip, MessageCircle } from 'lucide-react';
import { FiBarChart2 } from "react-icons/fi";
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { angolanRecipes } from '@/data/recipes';
import { internationalRecipes } from '@/data/internationalRecipes';
import { cocktails } from '@/data/cocktails';
import { sendChatMessage } from "../services/chatApi";
import SupportScreen from './SupportScreen';
import CameraModal from "./CameraModal";

const allRecipes = [...angolanRecipes, ...internationalRecipes, ...cocktails];

const ChatBot = ({ selectedCategory, onRecipeGenerated, onBack, user }) => {
  let stepLock = false;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [showHistory, setShowHistory] = useState(false);
  const [recipeHistory, setRecipeHistory] = useState([]);
  const [showSupport, setShowSupport] = useState(false);
  const fileInputRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [options, setOptions] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [loading, setLoading] = useState(false);

  // COOKING MODE FULLSCREEN
  const [timer, setTimer] = useState('00:00');
  const [isTimerActive, setIsTimerActive] = useState(false);


  const addMessage = (type, content, extra = {}) => {
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

    // NUNCA ALTERA mensagens existentes - SÓ ADICIONA
    setMessages(prev => [...prev, newMessage]);

    // Scroll suave
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };


  // ESTADOS PARA PREVIEW
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);


  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true); // ← ADICIONADO

    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = localStorage.getItem("bomPiteuUserToken") || localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auto-recipe/options`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      // ✅ SALVA NO STATE (CRÍTICO!)
      setSessionId(data.sessionId);
      setOptions(data.options);

      //  MOSTRA MENSAGEM NO CHAT
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          content: "Analisei tua foto! Escolhe uma receita:",
          options: data.options || [],
          timestamp: new Date(),
        },
      ]);


    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao gerar opções de receita",
        variant: "destructive",
      });
    } finally {
      setLoading(false); // ← ADICIONADO
    }
  };
  // ← NOVA FUNÇÃO PREVIEW
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file)); // ← preview imediato
      setShowImagePreview(true); // ← mostra preview
    }
  };

  const uploadImageForOptions = async (file) => {
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

      // ✅ 3 MENSAGENS FIXAS E SEPARADAS
      addMessage("user", " Enviei foto dos ingredientes");
      addMessage("bot", " Analisando ingredientes...");

      // Salva dados IMPORTANTES
      setSessionId(data.sessionId);
      setOptions(data.options || []);

      setTimeout(() => {
        addMessage("bot", " Receitas encontradas:", {
          options: data.options || [],
          sessionId: data.sessionId
        });
      }, 1200);

      return data;
    } catch (err) {
      addMessage("bot", " Erro na análise da foto");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  // ESCOLHER RECEITA (1, 2 ou 3)
  const selectRecipeOption = async (choice) => {
    setLoading(true);
    const token = localStorage.getItem("bomPiteuUserToken") || localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auto-recipe/select`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId, choice }),
      });

      const data = await res.json();
      setRecipe(data.recipe);

      // 🔥 MOSTRA RECEITA + IMAGEM FINAL
      addMessage("bot", `🍽️ ${data.recipe.title}`, {
        recipe: data.recipe,
        finalImage: data.finalImage,  // ← NOVA!
        type: "recipe-with-final-image"
      });
      setCookingMode(true);
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  // PRÓXIMO PASSO
  const generateStep = async () => {
    if (!sessionId || stepLock || loading) {
      console.log(" BLOQUEADO:", { sessionId: !!sessionId, stepLock, loading });
      return null;
    }

    stepLock = true;
    setLoading(true);

    try {
      const token = localStorage.getItem("bomPiteuUserToken") || localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auto-recipe/step`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();

      if (data.step) {
        // CHAVE TOTALMENTE ÚNICA
        const uniqueId = `step_${Date.now()}_${data.step.stepNumber}_${Math.random().toString(36).substr(2, 5)}`;

        addMessage("bot", `Passo ${data.step.stepNumber}/${data.progress}`, {
          id: uniqueId,
          step: data.step,
          imageUrl: data.step.imageUrl || '',
          progress: data.progress,
          type: "cooking-step"
        });

        setCurrentStep(data.step);
      }
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
      stepLock = false;
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
        body: JSON.stringify({ ingredientsDescription: ingredients }), // <--- use 'ingredients', não 'currentInput'
      });

      const data = await res.json();
      return data.options || [];
    } catch (err) {
      console.error("Erro ao buscar opções:", err);
      return [];
    }
  };
  const selectRecipe = async (optionId) => {
    setIsTyping(true);

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/chat/select-recipe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ optionId }),
      }
    );

    const data = await res.json();

    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        type: "bot",
        content: ` <strong>${data.recipe.title}</strong><br/>Vamos começar a cozinhar!`,
        timestamp: new Date(),
      },
    ]);

    setIsTyping(false);
  };


  useEffect(() => {
    let initialMessage = `Olá, ${user.name.split(' ')[0]}! 😊 Sou o teu Chef IA, pronto para a ação. O que vamos criar hoje? Podes dizer-me os ingredientes que tens (ex: "tenho frango e batatas"), pedir um tipo de prato (ex: "quero um jantar rápido") ou até uma receita de um país específico.`;
    if (selectedCategory?.title) {
      initialMessage = `Olá! Vejo que te interessas por "${selectedCategory.title}". Diz-me o que procuras dentro desta categoria e eu crio a receita perfeita para ti!`;
      if (selectedCategory.query) {
        setInputMessage(selectedCategory.query);
        setTimeout(() => handleSendMessage(selectedCategory.query), 500);
      }
    }


    setMessages([
      {
        id: 1,
        type: 'bot',
        content: initialMessage,
        timestamp: new Date()
      }
    ]);
  }, [selectedCategory, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const token = localStorage.getItem("bomPiteuUserToken") || localStorage.getItem("token");
  const handleSendMessage = async (messageOverride) => {
    const currentInput = messageOverride || inputMessage;
    if (!currentInput.trim()) return;

    // mensagem do usuário
    const userMessage = { id: Date.now(), type: "user", content: currentInput, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    if (!messageOverride) setInputMessage("");
    setIsTyping(true);

    try {
      // buscar receitas do backend
      const options = await fetchRecipeOptions(currentInput, selectedCategory?.title);
      // AUTO-RECIPE MODO TEXTO (se menciona ingredientes)
      if (currentInput.toLowerCase().includes('tenho') || currentInput.includes(',') || currentInput.includes('ingredientes')) {
        const formData = new FormData();
        formData.append('ingredients', currentInput);

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auto-recipe/options`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        const data = await res.json();
        setSessionId(data.sessionId);
        setOptions(data.options);

        addMessage("bot", "Receitas IA com teus ingredientes:", {
          options: data.options,
          sessionId: data.sessionId,
          type: "auto-recipe-options"
        });
        setIsTyping(false);
        return;
      }

      if (options.length === 0) {
        setMessages(prev => [
          ...prev,
          { id: Date.now() + 1, type: "bot", content: "Desculpa, não consegui sugerir receitas.", timestamp: new Date() }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            type: "bot",
            text: "Receitas encontradas:",
            options: options, // guarda o array inteiro aqui
            timestamp: new Date(),
          },
        ]);

      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível buscar receitas.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 w-screen h-screen bg-white flex flex-col">
        {/* INPUT INVISÍVEL PARA UPLOAD DE IMAGEM */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("image", file);
            formData.append("prompt", "O que posso cozinhar com isto?");

            setIsTyping(true);

            try {
              const res = fetch(`${import.meta.env.VITE_API_URL}/api/chat/image-chat`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: formData,
              });

              const data = await res.json();

              setMessages(prev => [
                ...prev,
                {
                  id: Date.now(),
                  type: "bot",
                  content: data.reply,
                  timestamp: new Date(),
                },
              ]);
            } catch (err) {
              toast({
                title: "Erro",
                description: "Falha ao analisar a imagem",
                variant: "destructive",
              });
            } finally {
              setIsTyping(false);
            }
          }}
        />
        {/* HEADER DINÂMICO PROFISSIONAL */}
        {/* HEADER DINÂMICO PROFISSIONAL RESPONSIVO */}
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 px-3 py-2 md:px-6 md:py-3 text-white relative overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-shimmer -skew-x-12" />

          <div className="relative z-10 flex items-center justify-between gap-2">

            {/* ESQUERDA: BACK + CHEF INFO */}
            <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onBack('dashboard')}
                className="text-white hover:bg-white/20 h-8 w-8 md:h-10 md:w-10 backdrop-blur-sm shrink-0"
              >
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              </Button>

              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-xl rounded-xl md:rounded-2xl flex items-center justify-center border border-white/30">
                    <ChefHat className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    {isTyping && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse" />
                    )}
                  </div>
                </div>

                <div className="min-w-0">
                  <h1 className="font-bold text-sm md:text-lg leading-tight truncate max-w-[120px] md:max-w-[250px]">
                    {recipe?.title || 'Chef IA'}
                  </h1>
                  <div className="flex items-center gap-1.5 text-[10px] md:text-xs opacity-90 font-medium truncate">
                    {recipe && currentStep ? (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                        Passo {currentStep.stepNumber}/{recipe.steps?.length || 8}
                      </span>
                    ) : (
                      <span>{!recipe ? (isTyping ? 'A pensar...' : 'Às tuas ordens!') : 'Prontos para cozinhar!'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* DIREITA: PROGRESSO + AÇÕES */}
            <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
              {recipe && (
                <div className="relative w-9 h-9 md:w-11 md:h-11 flex items-center justify-center">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-xl rounded-lg md:rounded-xl border border-white/30 flex items-center justify-center z-10">
                    <span className="text-xs md:text-sm font-bold">
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
                  className="h-8 w-8 md:h-10 md:w-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white"
                >
                  <Headphones className="h-4 w-4 md:h-5 md:w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistory(true)}
                  className="h-8 w-8 md:h-10 md:w-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white"
                >
                  <FileText className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div key={message.id || `msg_${Date.now()}_${Math.random()}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`flex items-start gap-2 w-full ${message.type === 'user'
                  ? 'flex-row-reverse'
                  : ''
                  }`}
              >

                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'user' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                  {message.type === 'user' ? <User className="h-4 w-4 text-white" /> : <ChefHat className="h-4 w-4 text-white" />}
                </div>
                <div
                  className={`
    rounded-2xl p-3 shadow-sm
    w-fit
    max-w-[78%]
    sm:max-w-[420px]
    lg:max-w-[480px]
    break-words whitespace-pre-wrap
    ${message.type === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none ml-auto'
                      : 'bg-white text-gray-800 rounded-bl-none mr-auto'
                    }
  `}
                >

                  {message.image && (
                    <div className="mb-3 overflow-hidden rounded-xl border border-white/20 shadow-sm bg-black/5">
                      <img
                        src={message.image}
                        alt="Captura de ingredientes"
                        className="w-full h-auto object-cover max-h-72 rounded-lg block"
                      />
                    </div>
                  )}

                  <p
                    className="text-sm sm:text-base leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: (typeof message.content === "string"
                        ? message.content
                        : message.content?.text || ""
                      ).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/⚠️/g, '<span class="flex items-center text-yellow-600 font-bold"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle mr-1"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>$&</span>')
                    }}
                  />
                  {message.type === "recipe-with-final-image" && (
                    <div className="space-y-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
                      {/*  IMAGEM FINAL DO PRATO */}
                      {message.finalImage && (
                        <div className="text-center">
                          <div className="w-full max-w-2xl mx-auto">
                            <img
                              src={message.finalImage}
                              alt={`Prato final: ${message.recipe.title}`}
                              className="w-full h-80 object-cover rounded-3xl shadow-2xl border-8 border-white"
                            />
                          </div>
                          <p className="mt-4 text-lg font-semibold text-gray-700">
                            Assim fica o teu {message.recipe.title} FINAL!
                          </p>
                        </div>
                      )}

                      {/*  Ingredientes */}
                      <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                          {message.recipe.ingredients?.length || 0} Ingredientes:
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {message.recipe.ingredients?.map((ing, i) => (
                            <div key={i} className="p-3 bg-green-50 rounded-xl text-sm border">
                              {ing}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/*  Botão Iniciar */}
                      <Button
                        onClick={generateStep}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-8 text-xl font-bold rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all"
                      >
                        {currentStep ? 'PRÓXIMO PASSO' : 'COMEÇAR PASSO 1'}
                      </Button>
                    </div>
                  )}

                  {message.options && message.options.length > 0 && (
                    <div className="space-y-4 mt-6 p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl border-4 border-orange-200 shadow-2xl">
                      <div className="flex items-center gap-3 mb-6 p-4 bg-white/50 rounded-2xl backdrop-blur-sm">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-orange-800">Receitas IA para tua foto</h3>
                          <p className="text-sm text-orange-700">Clica numa para começar a cozinhar!</p>
                        </div>
                      </div>

                      {message.options?.map((opt, i) => (
                        <button
                          key={`opt_${message.id}_${i}`} // ← CHAVE ÚNICA
                          onClick={() => selectRecipeOption(i + 1)}
                          disabled={loading || !sessionId}
                          className="group w-full p-6 bg-white/80 backdrop-blur-sm border-2 border-orange-200 rounded-2xl hover:border-orange-400 hover:shadow-2xl hover:bg-white transition-all shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="font-bold text-xl text-gray-800 mb-3 group-hover:text-orange-700">
                                {i + 1}. {opt.title ?? opt.name ?? opt}
                              </div>
                              <p className="text-base text-gray-600 leading-relaxed line-clamp-2">
                                {opt.description ?? opt.shortDescription ?? ''}
                              </p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110">
                              <ChefHat className="w-7 h-7 text-white" />
                            </div>
                          </div>
                        </button>
                      ))}

                    </div>
                  )}

                  {message.recipe && (
                    <div className="mt-4 p-6 bg-green-50 rounded-3xl border-4 border-green-200">
                      <h3 className="text-2xl font-bold text-green-800 mb-4">{message.recipe.title}</h3>
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <h4 className="font-semibold text-green-700 mb-2">⏰ Tempo:</h4>
                          <p className="text-lg">{message.recipe.time || '30 min'}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-700 mb-2">🥘 Ingredientes:</h4>
                          <div className="flex flex-wrap gap-1">
                            {message.recipe.ingredients?.slice(0, 6).map((ing, i) => (
                              <span key={i} className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-sm">
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={generateStep}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl text-xl font-bold shadow-2xl"
                      >
                        PRIMEIRO PASSO
                      </motion.button>
                    </div>
                  )}

                  {recipe && !currentStep && (
                    <div className="space-y-4 p-6 bg-green-50 rounded-3xl border-4 border-green-200">
                      <h2 className="text-2xl font-bold text-green-800 text-center mb-6">
                        {recipe.title}
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <h3 className="font-semibold text-green-700 mb-2">⏰ Tempo:</h3>
                          <p className="text-lg">{recipe.time}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-green-700 mb-2">🥘 Ingredientes:</h3>
                          <div className="flex flex-wrap gap-1">
                            {recipe.ingredients.slice(0, 6).map((ing, i) => (
                              <span key={i} className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-sm">
                                {ing}
                              </span>
                            ))}
                            {recipe.ingredients.length > 6 && (
                              <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-sm">
                                +{recipe.ingredients.length - 6}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={async () => {
                          const data = await generateStep();
                          setCurrentStep(data);
                          setMessages(prev => [
                            ...prev,
                            {
                              id: Date.now(),
                              type: "bot",
                              content: "",
                              step: data,
                              timestamp: new Date(),
                            },
                          ]);
                        }}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-3xl transition-all"
                      >
                        PRIMEIRO PASSO
                      </motion.button>
                    </div>
                  )}

                  {message.recipeContext && (message.content.toLowerCase().includes('passo a passo') || message.content.toLowerCase().includes('preparação')) && (
                    <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700" onClick={() => handleSendMessage("Sim, vamos começar a cozinhar")}>
                      Sim, vamos a isso!
                    </Button>

                  )}

                  <div className="text-xs opacity-70 mt-1 text-right">
                    {message.timestamp.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {message.type === "cooking-step" && message.step && (
                    <div className="space-y-4 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl border-4 border-indigo-200 mt-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {message.step.stepNumber}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-indigo-800">Passo {message.step.stepNumber}</h3>
                          <p className="text-sm text-indigo-600">{message.progress}</p>
                        </div>
                      </div>

                      <p className="text-lg leading-relaxed">{message.step.description}</p>

                      {message.step.imageUrl && (
                        <div className="w-full max-w-2xl mx-auto">
                          <img
                            src={message.step.imageUrl}
                            alt={`Passo ${message.step.stepNumber}`}
                            className="w-full h-64 object-cover rounded-2xl shadow-2xl border-4 border-white"
                          />
                        </div>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={generateStep}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl mt-6 disabled:opacity-50"
                      >
                        {loading ? ' Próximo...' : ` Passo ${parseInt(message.step.stepNumber) + 1}`}
                      </motion.button>
                    </div>
                  )}


                </div>
              </div>
            </div>
          ))}


          {isTyping && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start"><div className="flex items-center space-x-2"><div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center"><ChefHat className="h-4 w-4 text-white" /></div><div className="bg-white rounded-2xl p-3 shadow-sm"><div className="flex space-x-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div></div></div></div></motion.div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4 bg-white sticky bottom-0">
          <div className="relative flex items-center">
            {/* BOTÃO PAPERCLIP */}
            <div className="relative">
              <Button
                onClick={() => setShowMenu(!showMenu)}
                variant="ghost"
                size="icon"
                className="rounded-full w-9 h-9 hover:bg-white text-slate-400"
              >
                <Paperclip size={20} />
              </Button>

              {/* MENU DE ANEXOS */}
              {showMenu && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  className="absolute bottom-12 left-full -translate-x-72 bg-white border border-slate-100 shadow-2xl rounded-3xl p-2 min-w-[220px] z-50 overflow-hidden flex flex-col"
                >
                  {/* Câmera */}
                  <button
                    onClick={() => setShowCamera(true)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl text-sm font-semibold text-slate-600 transition-colors"
                  >
                    <Camera size={18} className="text-orange-500" /> Tirar Foto Agora
                  </button>

                  {/* Galeria com Preview */}
                  <div className="relative">
                    <label className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer text-sm font-semibold text-slate-600 border-t border-slate-50">
                      <Image size={18} className="text-orange-500" /> Galeria de Fotos
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  </div>


                  {/* Documento/PDF */}
                  <label className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer text-sm font-semibold text-slate-600 border-t border-slate-50">
                    <FileText size={18} className="text-orange-500" /> Documento/PDF
                    <input type="file" className="hidden" onChange={handleFile} />
                  </label>
                </motion.div>
              )}
              {/* ← PREVIEW PROFISSIONAL (NOVO) */}
              {showImagePreview && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute bottom-20 left-2 bg-white border-2 border-orange-300 shadow-2xl rounded-3xl p-4 w-[300px] z-50"
                >
                  {/* Preview da Imagem */}
                  <div className="w-full h-48 rounded-2xl overflow-hidden bg-gray-100 mb-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={async () => {
                        if (selectedImage) {
                          setLoading(true);
                          const data = await uploadImageForOptions(selectedImage);
                          setMessages(prev => [...prev, {
                            id: Date.now(),
                            type: "bot",
                            content: "🍽️ Analisei tua foto! Escolhe uma receita:",
                            timestamp: new Date()
                          }]);
                          // Limpa preview
                          setShowImagePreview(false);
                          setSelectedImage(null);
                          setImagePreview(null);
                        }
                      }}
                    >
                      {loading ? "Enviando..." : "📤 Enviar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowImagePreview(false);
                        setSelectedImage(null);
                        setImagePreview(null);
                        fileInputRef.current.value = ""; // limpa input
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </motion.div>
              )}

            </div>
            {/* INPUT DE TEXTO */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Tenho frango, tomate e cebola..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-3 pr-20 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow"
            />

            {/* BOTÃO ENVIAR */}
            <div className="absolute right-0 inset-y-0 flex items-center pr-2 gap-2">
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-full h-9 w-9 p-0 flex items-center justify-center shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>

        </div>
      </motion.div >

      {/* OVERLAY ESCURO */}
      < AnimatePresence >
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHistory(false)}
            className="fixed inset-0 bg-black z-30"
          />
        )}
      </AnimatePresence >

      {/* MENU LATERAL PROFISSIONAL */}
      < motion.div
        initial={{ x: 300 }}
        animate={{ x: showHistory ? 0 : 300 }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
        className="fixed right-0 top-0 h-full w-[300px] bg-gradient-to-b from-orange-50 via-orange-100 to-white shadow-2xl p-5 z-40 overflow-y-auto rounded-l-3xl"
      >
        {/* HEADER DO MENU */}
        < div className="flex items-center justify-between mb-5" >
          <h2 className="text-xl font-bold text-orange-700">Histórico de Receitas</h2>
          <Button
            onClick={() => setShowHistory(false)}
            className="p-2 rounded-full hover:bg-orange-200 transition-colors"
            variant="ghost"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        </div >

        {/* CONTEÚDO */}
        {
          recipeHistory.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">Nenhuma receita salva</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recipeHistory.map((r) => (
                <div
                  key={r.id}
                  className="p-3 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl cursor-pointer shadow hover:scale-105 transform transition-transform"
                  onClick={() => loadRecipe(r)}
                >
                  <p className="font-semibold text-orange-700">{extractRecipeName(r.fullRecipe)}</p>
                  <p className="text-xs text-orange-500">{r.date}</p>
                </div>
              ))}
            </div>
          )
        }
      </motion.div >

      {/* Chamada simples: o SupportScreen cuida do próprio layout fixo */}
      <SupportScreen
        open={showSupport}
        onClose={() => setShowSupport(false)}
      />
      <CameraModal
        open={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={async (dataUrl) => {
          setShowCamera(false);

          const userMessage = {
            id: Date.now(),
            type: "user",
            content: { text: "Foto de ingredientes enviada", image: dataUrl },
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, userMessage]);
          setIsTyping(true);

          try {
            // Converter base64 para Blob
            const resBlob = await fetch(dataUrl);
            const blob = await resBlob.blob();
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

            const formData = new FormData();
            formData.append("image", file); // apenas a imagem

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auto-recipe/options`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            });

            const data = await res.json();

            // Adiciona mensagem da IA com as opções de receita
            setMessages(prev => [
              ...prev,
              {
                id: Date.now() + 1,
                type: "bot",
                content: data.options, // mostra as 3 receitas
                timestamp: new Date(),
              },
            ]);
          } catch (err) {
            toast({
              title: "Erro",
              description: "Falha ao gerar opções de receita",
              variant: "destructive",
            });
          } finally {
            setIsTyping(false);
          }
        }}
      />
    </div >
  );
};

export default ChatBot;

