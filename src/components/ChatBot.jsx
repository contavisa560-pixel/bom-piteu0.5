// ---------------------------------------------
// ChatBot.jsx — versão premium estilo iMessage
// Full-screen no mobile | 90% no desktop
// Animado, moderno, profissional
// ---------------------------------------------

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User } from "lucide-react";

export default function ChatBot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text:
        " Olá Chef! O que tens aí em casa? Vou criar um prato incrível baseado nos ingredientes que disseres!"
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ---------------------------------------------
  //  Função para escrever letra por letra
  // ---------------------------------------------
  const typeWriter = (text, speed = 1) =>
    new Promise((resolve) => {
      let index = 0;
      let current = "";

      const interval = setInterval(() => {
        current += text[index];
        index++;

        setMessages((prev) => {
          const arr = [...prev];
          const last = arr[arr.length - 1];
          last.text = current;
          return arr;
        });

        if (index >= text.length) {
          clearInterval(interval);
          resolve();
        }
      }, speed);
    });

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: input
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Typing indicator
    setIsTyping(true);

    // Placeholder da resposta para aplicar o efeito typing
    const placeholderId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      { id: placeholderId, sender: "bot", text: "" }
    ]);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/openai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const data = await res.json();
      const reply = data.reply || "Não consegui responder agora.";

      await typeWriter(reply); // efeito letra-por-letra
    } catch (error) {
      await typeWriter(" Erro ao comunicar com o servidor.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div
      className="
        flex flex-col w-full 
        md:max-w-4xl 
        mx-auto 
        h-screen 
        md:h-[92vh]
        bg-neutral-50 dark:bg-neutral-900
        rounded-none md:rounded-3xl 
        overflow-hidden 
        shadow-2xl 
        border border-neutral-200 dark:border-neutral-800
      "
    >
      {/* --------------------------------------------------------- */}
      {/* HEADER COM BLUR + AVATAR */}
      {/* --------------------------------------------------------- */}
      <div className="
        backdrop-blur-xl
        bg-white/70 dark:bg-neutral-800/40
        flex items-center gap-3
        px-5 py-4
        border-b border-neutral-200 dark:border-neutral-700
      ">
        <motion.img
          src="/avatar.jpg"
          alt="avatar"
          className="w-12 h-12 rounded-full shadow-md"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        />

        <div>
          <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
            Chef Inteligente
          </h1>
          <p className="text-sm text-neutral-400">Online agora</p>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* ÁREA DE MENSAGENS */}
      {/* --------------------------------------------------------- */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 14 }}
            className={`flex flex-col max-w-[80%] ${
              msg.sender === "user" ? "ml-auto items-end" : "items-start"
            }`}
          >
            {/* Nome + Ícone */}
            <div className="flex items-center gap-2 mb-1">
              {msg.sender === "user" ? (
                <User size={16} className="text-neutral-500" />
              ) : (
                <Bot size={16} className="text-orange-500" />
              )}
              <span className="text-xs text-neutral-400">
                {msg.sender === "user" ? "Você" : "Chef AI"}
              </span>
            </div>

            {/* Bolha */}
            <div
              className={`
                p-3 rounded-2xl text-sm shadow-md whitespace-pre-wrap
                ${
                  msg.sender === "user"
                    ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white"
                    : "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                }
              `}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}

        {/* --------------------------------------------------------- */}
        {/* TYPING INDICATOR — três bolinhas animadas estilo iMessage */}
        {/* --------------------------------------------------------- */}
        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="
              bg-neutral-200 dark:bg-neutral-700 
              text-neutral-800 dark:text-neutral-200
              px-4 py-2 rounded-2xl shadow-inner flex gap-2
            ">
              <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      {/* --------------------------------------------------------- */}
      {/* INPUT */}
      {/* --------------------------------------------------------- */}
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-900 border-t border-neutral-300 dark:border-neutral-800">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Escreve algo Chef..."
          className="
            flex-1 px-4 py-3 rounded-2xl
            bg-neutral-100 dark:bg-neutral-800
            border border-neutral-300 dark:border-neutral-700
            text-neutral-800 dark:text-neutral-100
            focus:outline-none focus:ring-2 focus:ring-orange-500
          "
        />

        <button
          onClick={sendMessage}
          className="
            p-3 rounded-2xl 
            bg-orange-500 text-white 
            active:scale-95 
            shadow-lg
            transition-all
          "
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
