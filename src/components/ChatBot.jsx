
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, ChefHat, User, Sparkles, Camera, Mic, AlertTriangle, Headphones, FileText } from 'lucide-react';
import { FiBarChart2 } from "react-icons/fi";
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { angolanRecipes } from '@/data/recipes';
import { internationalRecipes } from '@/data/internationalRecipes';
import { cocktails } from '@/data/cocktails';
import { sendChatMessage } from "../services/chatApi";
import SupportScreen from './SupportScreen';                

const allRecipes = [...angolanRecipes, ...internationalRecipes, ...cocktails];

const ChatBot = ({ selectedCategory, onRecipeGenerated, onBack, user }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [showHistory, setShowHistory] = useState(false);
  const [recipeHistory, setRecipeHistory] = useState([]);
  const [showSupport, setShowSupport] = useState(false);


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


  const handleSendMessage = async (messageOverride) => {
    const currentInput = messageOverride || inputMessage;
    if (!currentInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: currentInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageOverride) setInputMessage("");
    setIsTyping(true);

    try {
      const data = await sendChatMessage({
        message: currentInput,
        userId: user._id,
      });


      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: data.reply,
        timestamp: new Date(),
      };

      if (data.cookingSession) {
        onRecipeGenerated(data.cookingSession);
      }
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      toast({
        title: "Erro",
        description: "O Chef IA teve um problema. Tenta novamente.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const [showUsageMobile, setShowUsageMobile] = useState(false);
  const handleCameraClick = () => onBack('imageRecognition');
  const handleMicClick = () => onBack('voiceRecognition');

  return (
    <div className="flex-1 flex overflow-hidden relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 w-screen h-screen bg-white flex flex-col">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => onBack('dashboard')} className="text-white hover:bg-white/20 h-8 w-8">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <ChefHat className="h-8 w-8" />
            <div>
              <span className="font-semibold text-lg">Chef IA</span>
              <div className="text-sm opacity-90">{isTyping ? 'A pensar...' : 'Às tuas ordens!'}</div>
            </div>
          </div>


          {/* Lado direito */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              onClick={() => setShowSupport(true)}
              className="p-1 sm:p-2"
            >
              <Headphones size={20} />
            </Button>

            <Button
              variant="ghost"
              className="p-1 sm:p-2 rounded-full hover:bg-white/20 text-white"
              onClick={() => setShowHistory(true)}
            >
              <FileText size={18} sm={22} />
            </Button>
            <button
              onClick={() => setShowUsageMobile(true)}
              className="absolute left-1/2 -translate-x-1/2 text-white p-2 rounded-full hover:bg-white/20 transition"
            >
              <FiBarChart2 size={26} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div key={message.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
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

                    <p className="text-sm sm:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/⚠️/g, '<span class="flex items-center text-yellow-600 font-bold"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle mr-1"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>$&</span>') }} />

                    {message.recipeContext && (message.content.toLowerCase().includes('passo a passo') || message.content.toLowerCase().includes('preparação')) && (
                      <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700" onClick={() => handleSendMessage("Sim, vamos começar a cozinhar")}>Sim, vamos a isso!</Button>
                    )}
                    <div className="text-xs opacity-70 mt-1 text-right">
                      {message.timestamp.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start"><div className="flex items-center space-x-2"><div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center"><ChefHat className="h-4 w-4 text-white" /></div><div className="bg-white rounded-2xl p-3 shadow-sm"><div className="flex space-x-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div></div></div></div></motion.div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4 bg-white sticky bottom-0">
          <div className="relative">
            <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Tenho frango, tomate e cebola..." className="w-full border border-gray-300 rounded-full px-4 py-3 pr-20 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow" />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <Button onClick={() => handleSendMessage()} disabled={!inputMessage.trim()} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-full h-9 w-9 p-0 flex items-center justify-center shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {['Próximo passo', 'Quero uma receita japonesa', 'Jantar para dois', 'Cocktail com manga'].map((suggestion) => (
              <button key={suggestion} onClick={() => { setInputMessage(suggestion); handleSendMessage(suggestion); }} className="text-xs bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700 rounded-full px-3 py-1 transition-colors font-medium">
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* OVERLAY ESCURO */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHistory(false)}
            className="fixed inset-0 bg-black z-30"
          />
        )}
      </AnimatePresence>

      {/* MENU LATERAL PROFISSIONAL */}
      <motion.div
        initial={{ x: 300 }}
        animate={{ x: showHistory ? 0 : 300 }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
        className="fixed right-0 top-0 h-full w-[300px] bg-gradient-to-b from-orange-50 via-orange-100 to-white shadow-2xl p-5 z-40 overflow-y-auto rounded-l-3xl"
      >
        {/* HEADER DO MENU */}
        <div className="flex items-center justify-between mb-5">
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
        </div>

        {/* CONTEÚDO */}
        {recipeHistory.length === 0 ? (
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
        )}
      </motion.div>
      <SupportScreen open={showSupport} onClose={() => setShowSupport(false)} />
    </div>
  );
};

export default ChatBot;
