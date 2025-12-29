import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Paperclip, ChefHat, Camera, Image, FileText,
  Mic, X, ChevronLeft, Play, Pause,
  Sparkles, Clock, CheckCircle2, MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { sendTextMessage, sendImageMessage, advanceStep } from "@/services/recipeApi";
import { useLocation } from "react-router-dom";
import { startRecipeSession, sendStepText } from "@/services/recipeChatService";
import { sendStepImage } from "@/services/recipeImageService";


// --- Waveform Minimalista ---
function AudioWave({ audioUrl, isUser }) {
  const containerRef = useRef(null);
  const waveRef = useRef(null);
  const [playing, setPlaying] = useState(false);


  useEffect(() => {
    if (!containerRef.current) return;
    waveRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: isUser ? "rgba(255,255,255,0.3)" : "#cbd5e1",
      progressColor: isUser ? "#fff" : "#f97316",
      height: 24,
      barWidth: 2,
      barGap: 3,
      barRadius: 10,
      cursorWidth: 0,
    });
    waveRef.current.load(audioUrl);
    waveRef.current.on("finish", () => setPlaying(false));
    return () => waveRef.current.destroy();
  }, [audioUrl, isUser]);

  return (
    <div className="flex items-center gap-3 w-[220px]">
      <button onClick={() => { waveRef.current.playPause(); setPlaying(!playing); }}
        className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? "bg-white/20" : "bg-orange-100 text-orange-600"}`}>
        {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
      </button>
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}

export default function PremiumChat({ userName = "Chef", onBack, onNextStep }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [messages, setMessages] = useState([
    {
      id: uuidv4(),
      sender: "bot",
      text: "Olá! Sou o seu assistente culinário. Como posso ajudar no seu preparo hoje?"
    }
  ]);

  const [sessionId, setSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [stepValidated, setStepValidated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [canAdvance, setCanAdvance] = useState(false);
  //Estado do botão inteligente (3 personalidades)
  const [actionButtonMode, setActionButtonMode] = useState("START");
  // START | WAITING | NEXT | END

  useEffect(() => {
    console.log("=== DEBUG INFO ===");
    console.log("Token:", localStorage.getItem("token"));
    console.log("Session ID:", sessionId);
    console.log("API URL:", import.meta.env.VITE_API_URL);
  }, [sessionId]);


  const videoRef = useRef(null);
  const scrollRef = useRef(null);

  // ChatBot.jsx 
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenToUse = token || localStorage.getItem("token");
    if (!tokenToUse) {
      alert("Sessão expirada. Faça login novamente.");
      navigate("/login");
      return;
    }
    const url = new URL(window.location);
    url.searchParams.delete("token");
    window.history.replaceState({}, "", url);

  }, []);



  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);


  const sessionStartedRef = useRef(false);

  useEffect(() => {
    if (!token) return;
    if (sessionStartedRef.current) return;

    sessionStartedRef.current = true;

    const initSession = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/recipe/session/start",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              recipeTitle: "Receita em andamento",
              fullRecipeData: {},
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erro ao iniciar sessão");
        }

        setSessionId(data.sessionId);
      } catch (err) {
        console.error("Erro ao iniciar sessão:", err.message);
      }
    };

    initSession();
  }, [token]);


  // --- Lógica da Câmera ---
  const handleCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setCameraStream(stream);
      setShowMenu(false);
    } catch (err) {
      alert("Não foi possível acessar a câmera.");
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/png");
    setPreviews(prev => [...prev, { id: uuidv4(), data, type: "image/png" }]);
    stopCamera();
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    if (cameraStream && videoRef.current) videoRef.current.srcObject = cameraStream;
  }, [cameraStream]);

  const sendMessage = async () => {

    // Verificar token primeiro
    /*  const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        alert("Você precisa fazer login para usar o chef.");
        navigate("/login");
        return;
      }

      // Verificar sessionId
      if (!sessionId) {
        alert("Sessão não iniciada. Por favor, inicie uma sessão de receita.");
        return;
      }*/

    // Se tem imagem para enviar
    if (previews.length > 0) {
      const imageUrl = previews[0].data;

      try {
        const response = await sendStepImage({
          sessionId,
          imageUrl,
          token
        });

        setMessages(prev => [
          ...prev,
          {
            id: uuidv4(),
            sender: "bot",
            text: response.chefFeedback || response.vision?.notes || "Imagem analisada"
          }
        ]);

        setStepValidated(response.validationStatus === "VALID");
        setCanAdvance(response.validationStatus === "VALID");
        setPreviews([]);
        setLoading(false);
        return;
      } catch (err) {
        console.error("Erro ao enviar imagem:", err);
        alert("Erro ao enviar imagem: " + err.message);
        setLoading(false);
        return;
      }
    }

    // Se é texto
    if (!input.trim()) return;

    setLoading(true);

    const userMsg = {
      id: uuidv4(),
      sender: "user",
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      if (!sessionId) {
        console.error("Sessão ainda não iniciada");
        return;
      }
      const response = await sendStepText({
        sessionId,
        content: input
      });


      const optionsWithId = (response.options || []).map(opt => ({
        ...opt,
        id: opt.id || uuidv4() // cria id único se não houver
      }));

      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          sender: "bot",
          text: response.chefFeedback || "Vamos começar!",
          options: optionsWithId
        }
      ]);


      if (response.validationStatus === "VALID") {
        setStepValidated(true);
        setCanAdvance(true);
        setActionButtonMode("NEXT");

      } else if (response.validationStatus === "END") {
        setActionButtonMode("END");
      }


    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);

      // Tratar erros específicos
      if (err.message.includes("401") || err.message.includes("Token") || err.message.includes("inválido")) {
        alert("Sessão expirada. Por favor, faça login novamente.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert("Erro ao comunicar com o chef: " + err.message);
      }
    }

    setLoading(false);
  };

  // Botão de ação inteligente
  const handleActionButton = async () => {
    if (!sessionId) {
      alert("Sessão ainda não iniciada. Por favor, aguarde.");
      return;
    }

    if (actionButtonMode === "START") {
      // Chamar backend para iniciar cozinha
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/recipe/session/startCooking`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ sessionId })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erro ao iniciar cozinha");

        setMessages(prev => [
          ...prev,
          { id: uuidv4(), sender: "bot", text: data.chefFeedback }
        ]);

        setTimeout(() => {
          setActionButtonMode("WAITING");
        }, 0);

      } catch (err) {
        console.error("Erro iniciar cozinha:", err);
        alert("Erro ao iniciar modo cozinha: " + err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (actionButtonMode === "NEXT") {
      await handleNextStep();
      setStepValidated(false);
      setCanAdvance(false);
      setActionButtonMode("WAITING");
      return;
    }

    // --- Encerrar receita ---
    if (actionButtonMode === "END") {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), sender: "bot", text: "⛔ Receita encerrada. Quando quiser cozinhar novamente, é só avisar." }
      ]);
      setActionButtonMode("START");
    }
  };


  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews(p => [...p, { id: uuidv4(), data: ev.target.result, type: file.type, name: file.name }]);
      reader.readAsDataURL(file);
    }
    setShowMenu(false);
  };

  const handleNextStep = async () => {
    try {
      await advanceStep({ sessionId, token });
      setStepValidated(false);
      setCanAdvance(false);
    } catch {
      alert("Passo ainda não validado pelo chefe.");
    }
  };
  const chooseRecipe = async (recipeTitle) => {
    if (!sessionId) return;

    try {
      setLoading(true);

      // mensagem visual do usuário
      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          sender: "user",
          text: recipeTitle
        }
      ]);

      const response = await sendStepText({
        sessionId,
        content: recipeTitle,
        intent: "CHOOSE_RECIPE"
      });

      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          sender: "bot",
          text: response.chefFeedback || "Vamos começar!",
          options: response.options || []
        }
      ]);

      if (response.validationStatus === "VALID") {
        setCanAdvance(true);
        setActionButtonMode("NEXT");
      }

    } catch (err) {
      console.error("Erro ao escolher receita:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#FBFBFC] flex flex-col w-screen h-screen text-slate-900 overflow-hidden">

      {/* Header Premium (Substituindo o do Dashboard) */}
      <header className="h-20 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-200">
              < ChefHat size={28} />
            </div>
            <div>
              <h1 className=" font-bold tracking-tight">Assistente Chefe</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[12px] font-bold text-slate-400  tracking-widest">Online</span>
              </div>
            </div>
          </div>
        </div>
        <button className="p-2 text-slate-300 hover:text-slate-600">
          <MoreHorizontal size={24} />
        </button>
      </header>
      {/* Main Chat */}
      <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-[15%] lg:px-[25%] space-y-6 scrollbar-hide">
        <AnimatePresence mode="wait">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >

              <div className={`group relative max-w-[85%] ${msg.sender === 'user' ? 'order-1' : 'order-2'}`}>
                <div className={`
                    p-4 rounded-[22px] text-[15px] leading-relaxed
                    ${msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none shadow-xl shadow-slate-200'
                    : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'}
                  `}>
                  {msg.text}
                  {msg.options && msg.options.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {msg.options && msg.options.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {msg.options.map((option) => (
                            <motion.div
                              key={option.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              onClick={() => chooseRecipe(option.title)}
                              className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md transition"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-slate-800">{option.title}</h4>
                                  <p className="text-sm text-slate-500 mt-1">
                                    {option.description}
                                  </p>
                                  <div className="flex gap-4 text-xs text-slate-400 mt-2">
                                    <span>{option.time || "60 min"}</span>
                                    <span>{option.difficulty || "Médio"}</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {msg.files?.map(f => (
                    <img key={f.id} src={f.data} className="mt-3 rounded-xl max-h-64 w-full object-cover border border-white/20 shadow-md" alt="upload" />
                  ))}
                </div>
                <div className={`flex items-center gap-2 mt-2 px-1 text-[10px] font-bold text-slate-300 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <Clock size={10} /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex gap-1.5 px-4 opacity-50">
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
        )}
        <div ref={scrollRef} />
      </main>

      {/* Input Row */}
      <footer className="p-4 sm:p-8 bg-white/80 backdrop-blur-xl border-t border-slate-100">
        <div className="max-w-4xl mx-auto space-y-4">

          <AnimatePresence>
            {previews.map(p => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 group flex-shrink-0"
              >
                <img src={p.data} className="w-full h-full object-cover" alt="preview" />
                <button onClick={() => setPreviews(prev => prev.filter(i => i.id !== p.id))}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1">
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>


          <div className="relative flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-[26px] p-2 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/5 focus-within:border-orange-200 transition-all shadow-inner">
            <div className="relative">
              <Button onClick={() => setShowMenu(!showMenu)} variant="ghost" size="icon" className="rounded-full w-12 h-12 hover:bg-white text-slate-400">
                <Paperclip size={22} />
              </Button>
              {showMenu && (
                <motion.div initial={{ scale: 0.9, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="absolute bottom-16 left-0 bg-white border border-slate-100 shadow-2xl rounded-3xl p-2 min-w-[220px] z-[60] overflow-hidden">
                  <button onClick={handleCamera} className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 rounded-2xl text-sm font-semibold text-slate-600 transition-colors">
                    <Camera size={18} className="text-orange-500" /> Tirar Foto Agora
                  </button>
                  <label className="flex items-center gap-3 p-4 hover:bg-slate-50 rounded-2xl cursor-pointer text-sm font-semibold text-slate-600 transition-colors border-t border-slate-50">
                    <Image size={18} className="text-blue-500" /> Galeria de Fotos
                    <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
                  </label>
                  <label className="flex items-center gap-3 p-4 hover:bg-slate-50 rounded-2xl cursor-pointer text-sm font-semibold text-slate-600 border-t border-slate-50">
                    <FileText size={18} className="text-emerald-500" /> Documento/PDF
                    <input type="file" className="hidden" onChange={handleFile} />
                  </label>
                </motion.div>
              )}
            </div>

            <textarea
              rows="1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Descreva o progresso..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] py-3 px-2 resize-none max-h-32 min-h-[44px] outline-none font-medium placeholder:text-slate-400"
            />

            <Button
              onClick={sendMessage}
              disabled={!input.trim() && previews.length === 0}
              className={`w-12 h-12 rounded-2xl transition-all shadow-lg p-0 flex-shrink-0
                  ${(input.trim() || previews.length > 0) ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-400'}`}
            >
              <Send size={20} />
            </Button>
          </div>

          <Button
            onClick={handleActionButton}
            disabled={actionButtonMode === "WAITING" || loading}
            className={`w-full h-14 rounded-2xl font-bold tracking-tight transition-all duration-300
    ${actionButtonMode === "START" &&
              "bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-100"
              }
    ${actionButtonMode === "WAITING" &&
              "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
              }
    ${actionButtonMode === "NEXT" &&
              "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100"
              }
    ${actionButtonMode === "END" &&
              "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100"
              }
  `}
          >
            {actionButtonMode === "START" && "Iniciar modo cozinha"}
            {actionButtonMode === "WAITING" && "Validação pendente..."}
            {actionButtonMode === "NEXT" && (
              <span className="flex items-center gap-2 justify-center">
                <CheckCircle2 size={18} />
                Próximo passo liberado
              </span>
            )}
            {actionButtonMode === "END" && "Encerrar receita"}
          </Button>

        </div>
      </footer>

      {/* --- Overlay de Câmera Minimalista --- */}
      <AnimatePresence mode="sync">
        {cameraStream && (
          <motion.div
            key="camera-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-6"
          >
            <div className="w-full max-w-lg bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-6 flex justify-between items-center border-b border-slate-50">
                <div className="flex items-center gap-2 font-bold text-slate-800"><Camera size={20} className="text-orange-500" />Captura de Evidência</div>
                <button onClick={stopCamera} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <div className="relative aspect-square bg-black">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover shadow-inner" />
              </div>
              <div className="p-10 flex flex-col items-center gap-4 bg-white">
                <button
                  onClick={capturePhoto}
                  className="w-20 h-20 rounded-full border-4 border-slate-100 bg-orange-600 shadow-2xl shadow-orange-200 active:scale-90 transition-transform flex items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full border-2 border-white/20"></div>
                </button>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tirar Fotografia</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}