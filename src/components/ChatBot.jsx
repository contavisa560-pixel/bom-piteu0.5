import React, { useState, useRef, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import { motion } from "framer-motion";
import { Send, User, Paperclip, Camera, Image, FileText, Mic, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";

// NOTE: this file requires wavesurfer.js
// Install with: npm install wavesurfer.js

function AudioBubble({ audioUrl, isUser }) {
  const containerRef = useRef(null);
  const waveRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    // clean up previous instance
    if (waveRef.current) {
      waveRef.current.destroy();
      waveRef.current = null;
    }

    if (!containerRef.current) return;

    // create wavesurfer instance
    waveRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: isUser ? "#FFDAB3" : "rgba(255,255,255,0.35)",
      progressColor: isUser ? "#FF8A00" : "#FFFFFF",
      height: 25,
      barWidth: 2,
      barRadius: 2,
      responsive: true,
      cursorWidth: 0,
      normalize: true,
      hideScrollbar: true,

      //  FIX IMPORTANTE
      backend: "MediaElement",
      mediaControls: false,
      xhr: {
        cache: "default",
        mode: "cors",
        method: "GET",
        credentials: "same-origin",
      }
    });


    // load audio (works with blob URLs)
    try {
      if (audioUrl && typeof audioUrl === "string") {
        waveRef.current.load(audioUrl);
      }
    } catch (err) {
      // fallback: create an <audio> element if wavesurfer can't load
      console.error("WaveSurfer load error:", err);
    }

    const ws = waveRef.current;

    const onReady = () => {
      const d = ws.getDuration() || 0;
      setDuration(d);
    };

    const onProcess = () => {
      setCurrent(ws.getCurrentTime() || 0);
    };

    const onFinish = () => {
      setPlaying(false);
      setCurrent(ws.getDuration() || 0);
    };

    ws.on("ready", onReady);
    ws.on("audioprocess", onProcess);
    ws.on("finish", onFinish);
    ws.on("seek", onProcess);

    return () => {
      try {
        ws.un("ready", onReady);
        ws.un("audioprocess", onProcess);
        ws.un("finish", onFinish);
        ws.un("seek", onProcess);
        try { ws.stop(); } catch (e) { }
        try { ws.destroy(); } catch (e) { }

      } catch (e) {
        // ignore
      }
    };
  }, [audioUrl, isUser]);

  // keep playing state synced with wavesurfer
  useEffect(() => {
    const ws = waveRef.current;
    if (!ws) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    ws.on("play", onPlay);
    ws.on("pause", onPause);

    return () => {
      ws.un("play", onPlay);
      ws.un("pause", onPause);
    };
  }, []);

  const togglePlay = () => {
    const ws = waveRef.current;
    if (!ws) return;
    ws.playPause();
    // playing will be set by event listener
  };

  const format = (t) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div
      className={`w-full px-3 py-2 rounded-2xl shadow-sm flex gap-2 items-center
  ${isUser ? "bg-white text-orange-700" : "bg-gradient-to-r from-orange-500 to-red-500 text-white"}
  `}
      style={{ minHeight: "50px", maxHeight: "60px" }}
    >

      {/* Play/Pause button */}

      <button
        onClick={togglePlay}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/30 hover:bg-white/40"
        aria-label={playing ? "Pausar áudio" : "Tocar áudio"}
      >
        {playing ? "⏸" : "▶"}
      </button>

      {/* Waveform container */}
      <div className="flex-1">
        <div ref={containerRef} className="w-full" />

        {/* Thin Telegram-like progress bar */}
        <div className="w-full h-[2px] mt-1 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white"
            style={{ width: duration ? `${(current / duration) * 100}%` : "0%" }}
          />
        </div>

        {/* times */}
        <div className="flex justify-between text-xs mt-1 opacity-80">
          <span>{format(current)}</span>
          <span>{format(duration)}</span>
        </div>
      </div>

      {/* iMessage-like animated bars while playing */}
      <div className="flex gap-[4px] items-end ml-2">
        <div
          className={`w-[3px] rounded bg-current transition-all ${playing ? "h-4 animate-[bounce_0.45s_infinite]" : "h-3 opacity-50"}`}
          style={{ animationDelay: "0s" }}
        />
        <div
          className={`w-[3px] rounded bg-current transition-all ${playing ? "h-6 animate-[bounce_0.5s_infinite]" : "h-3 opacity-50"}`}
          style={{ animationDelay: "0.08s" }}
        />
        <div
          className={`w-[3px] rounded bg-current transition-all ${playing ? "h-3 animate-[bounce_0.4s_infinite]" : "h-3 opacity-50"}`}
          style={{ animationDelay: "0.04s" }}
        />
      </div>
    </div>
  );
}

export default function ChatBot({ userName = "Chef", onBack }) {

  // Criar ID único para cada usuário (só gera uma vez)
  const [userID, setUserID] = useState(() => {
    let id = localStorage.getItem("uniqueUserID");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("uniqueUserID", id);
    }
    return id;
  });

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Para câmera ao vivo
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);

  // Previews de arquivos
  const [previews, setPreviews] = useState([]);

  // Áudio
  const [audioChunks, setAudioChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recording, setRecording] = useState(false);
  const [previewAudio, setPreviewAudio] = useState(null);

  const messageEndRef = useRef(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Carregar mensagens do usuário
  useEffect(() => {
    if (!userID) return;

    const saved = JSON.parse(localStorage.getItem(`chatMessages_${userID}`));
    if (saved && Array.isArray(saved) && saved.length > 0) {
      setMessages(saved);
    } else {
      setMessages([
        { id: uuidv4(), sender: "bot", text: `${userName}, o que vamos cozinhar hoje?` }
      ]);
    }
  }, [userID, userName]);

  // Scroll automático
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Salvar mensagens no localStorage
  useEffect(() => {
    if (userID) {
      localStorage.setItem(`chatMessages_${userID}`, JSON.stringify(messages));
    }
  }, [messages, userID]);

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Atualiza videoRef quando cameraStream mudar
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(console.error);
    }
  }, [cameraStream]);

  // Adicionar preview de imagem ou documento
  const addPreview = (file, type) => {
    const id = uuidv4();
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviews(prev => [...prev, { id, type, data: ev.target.result, name: file.name }]);
    };
    reader.readAsDataURL(file);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    addPreview(file, "image");
  };

  const handleDocument = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    addPreview(file, "document");
  };

  const handleCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      alert("Não foi possível acessar a câmera. Verifique permissões e HTTPS.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/png");
    setPreviews(prev => [...prev, { id: uuidv4(), type: "image", data: imageData, name: "camera.png" }]);

    cameraStream.getTracks().forEach(track => track.stop());
    setCameraStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // GRAVAÇÃO DE ÁUDIO
  const startRecording = async () => {
    if (recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setAudioChunks([]);

      recorder.ondataavailable = (e) => {
        setAudioChunks(prev => [...prev, e.data]);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setPreviewAudio({ blob: audioBlob, url: audioUrl });
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setRecording(true);

      // Limitar a gravação a 30s
      setTimeout(() => {
        if (recorder.state !== "inactive") recorder.stop();
        setRecording(false);
      }, 30000);

    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      alert("Não foi possível acessar o microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const sendAudio = async () => {
    if (!previewAudio) return;

    // Mostrar no chat
    const audioMsg = {
      id: uuidv4(),
      sender: "user",
      type: "audio",
      data: previewAudio.url
    };

    setMessages(prev => [...prev, audioMsg]);
    setIsTyping(true);

    // Preparar envio
    const formData = new FormData();
    formData.append("audio", previewAudio.blob);
    formData.append("userName", userName);

    setPreviewAudio(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/openai/audio`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      // Resposta do bot
      const botMsg = {
        id: uuidv4(),
        sender: "bot",
        text: data.reply || "Não consegui interpretar o áudio."
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (err) {
      console.log(err);

      setMessages(prev => [
        ...prev,
        { id: uuidv4(), sender: "bot", text: "Erro ao processar o áudio." }
      ]);
    }

    setIsTyping(false);
  };


  const sendMessage = async () => {
    if (!input.trim() && previews.length === 0 && !previewAudio) return;

    const newMessages = [...messages];

    previews.forEach(preview => {
      newMessages.push({ id: preview.id, sender: "user", text: preview.name || "", type: preview.type, data: preview.data });
    });

    if (previewAudio) {
      newMessages.push({
        id: uuidv4(),
        sender: "user",
        type: "audio",
        data: previewAudio.url,
        blob: previewAudio.blob
      });
    }

    if (input.trim()) {
      newMessages.push({ id: uuidv4(), sender: "user", text: input });
    }

    setMessages(newMessages);
    setInput("");
    setPreviews([]);
    setPreviewAudio(null);
    setIsTyping(true);

    try {
      const messagesForBackend = newMessages
        .map((msg) => ({ role: msg.sender === "user" ? "user" : "assistant", content: msg.text || "" }))
        .filter(msg => msg.content.trim() !== "");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/openai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, messages: messagesForBackend }),
      });

      const data = await res.json();
      const botMsg = { id: uuidv4(), sender: "bot", text: data.reply || "Não consegui responder agora." };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, { id: uuidv4(), sender: "bot", text: "Erro ao comunicar com o servidor." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") sendMessage(); };

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-orange-200 via-red-50 to-yellow-50">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg sticky top-0 z-50"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack} className="p-2 rounded-full bg-white/20 hover:bg-white/30">
            <svg xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <img src="public/ChatGPT Image 28_11_2025, 17_04_15.png" alt="App Logo" className="w-10 h-10 rounded-full shadow-md object-contain" />
          <div className="flex flex-col">
            <span className="font-semibold text-lg">{userName} Assistente</span>
            <span className="text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Online
            </span>
          </div>
        </div>
        <Button variant="ghost" className="p-2 rounded-full hover:bg-white/20 text-white">
          <Headphones size={20} />
        </Button>
      </motion.div>

      {/* MENSAGENS */}
      <div className="flex-1 overflow-y-auto px-14 py-3 space-y-2">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 14 }}
            className={`flex flex-col relative ${msg.sender === "user"
              ? "ml-auto items-end max-w-[80%] sm:max-w-[70%] md:max-w-[60%] lg:max-w-[50%]"
              : "items-start max-w-[80%] sm:max-w-[70%] md:max-w-[60%] lg:max-w-[55%]"
              }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {msg.sender === "user" && <User size={16} className="text-orange-500" />}
              <span className="text-xs text-orange-600">{msg.sender === "user" ? "EU" : ""}</span>
            </div>
            <div
              className={`p-3 rounded-2xl text-sm shadow-sm break-words break-all overflow-hidden whitespace-pre-wrap ${msg.sender === "user"
                ? "bg-white text-orange-700"
                : "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                }`}
            >
              {msg.type === "image" && <img src={msg.data} className="max-w-full rounded-lg" />}
              {msg.type === "document" && (
                <a href={msg.data} download={msg.text} className="text-blue-600 underline">{msg.text}</a>
              )}
              {msg.type === "audio" && (
                <AudioBubble audioUrl={msg.data} isUser={msg.sender === "user"} />
              )}
              {!msg.type && msg.text}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="text-white px-4 py-2 rounded-2xl flex gap-2">
              <span className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-bounce delay-150" />
              <span className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-bounce delay-300" />
            </div>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>
      {/* INPUT / ÁUDIO */}
      <div className="flex items-center gap-2 p-2 bg-gray-100 border-t border-neutral-300 relative">

        {/* Menu de anexos */}
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setShowMenu(prev => !prev)}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Paperclip size={20} className="text-gray-600" />
          </button>
          {showMenu && (
            <div ref={menuRef} className="absolute bottom-12 left-0 bg-white shadow-lg rounded-lg p-2 flex flex-col gap-2 w-36 z-50">
              <button onClick={handleCamera} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded">
                <Camera size={18} /> Câmera
              </button>
              <label className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">
                <Image size={18} /> Foto
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
              <label className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">
                <FileText size={18} /> Documento
                <input type="file" onChange={handleDocument} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Se estiver gravando, mostrar barra de gravação */}

        {recording ? (
          <div className="flex-1 flex items-center gap-3 p-2 bg-white rounded-full shadow-inner">
            {/* Ondas animadas */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className="w-1 h-4 bg-orange-500 rounded animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <span className="text-gray-600 text-sm">Gravando...</span>
            <button
              onClick={() => { stopRecording(); setPreviewAudio(null); }}
              className="ml-auto p-1 text-gray-600 hover:text-red-500 transition-colors"
              title="Cancelar"
            >
              ×
            </button>
          </div>
        ) : previewAudio ? (
          <div className="flex items-center gap-2 p-1 bg-gray-200 rounded-full w-full max-w-md">
            {/* Balão de áudio pré-visualização */}
            <audio controls src={previewAudio.url} className="w-88" />
            <button
              onClick={sendAudio}
              className="p-1 text-orange-500 hover:text-orange-600 transition-colors"
              title="Enviar áudio"
            >
              <Send size={20} />
            </button>
            <button
              onClick={() => setPreviewAudio(null)}
              className="p-2 text-red-500 hover:text-red-600 transition-colors"
              title="Apagar áudio"
            >
              ×
            </button>
          </div>
        ) : (
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Escreve uma mensagem"
            className="flex-1 px-5 py-3 rounded-full border border-neutral-300 bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
          />
        )}

        {/* Botão de enviar ou gravar */}
        {!recording && !previewAudio && (
          <Button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onClick={input.trim() || previews.length ? sendMessage : undefined}
            className={`p-3 rounded-full bg-orange-600 text-white shadow-lg hover:scale-105 transition-transform`}
            title="Segure para gravar"
          >
            {input.trim() || previews.length ? <Send size={20} /> : <Mic size={20} />}
          </Button>
        )}
      </div>

      {/* Modal câmera */}
      {cameraStream && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg flex flex-col items-center">
            <video ref={videoRef} autoPlay playsInline className="w-80 h-60 rounded-lg" />
            <div className="flex gap-2 mt-2">
              <button onClick={capturePhoto} className="bg-green-500 text-white px-4 py-2 rounded">Tirar Foto</button>
              <button onClick={() => {
                cameraStream.getTracks().forEach(t => t.stop());
                setCameraStream(null);
                if (videoRef.current) videoRef.current.srcObject = null;
              }} className="bg-red-500 text-white px-4 py-2 rounded">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Previews */}
      {previews.length > 0 && (
        <div className="flex gap-2 p-2 overflow-x-auto">
          {previews.map(p => (
            <div key={p.id} className="relative w-20 h-20 border rounded-lg flex items-center justify-center bg-gray-100">
              {p.type === "image" ? (
                <img src={p.data} alt={p.name} className="object-cover w-full h-full rounded-lg" />
              ) : (
                <span className="text-xs text-gray-700 px-1 text-center">{p.name}</span>
              )}
              <button
                onClick={() => setPreviews(prev => prev.filter(item => item.id !== p.id))}
                className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
              >×</button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
