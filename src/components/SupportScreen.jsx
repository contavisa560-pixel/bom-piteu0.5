import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    AlertCircle,
    CreditCard,
    Headphones,
    Mail,
    MessageSquare,
    X,
} from "lucide-react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE || "244943050526";
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "suporte@tuadomain.com";

const topics = [
    { id: 1, icon: <User size={20} />, title: "Login", description: "Problemas de acesso" },
    { id: 2, icon: <AlertCircle size={20} />, title: "Erro", description: "Relatar erros do app" },
    { id: 3, icon: <CreditCard size={20} />, title: "Pagamento", description: "Assinaturas e faturas" },
    { id: 4, icon: <MessageSquare size={20} />, title: "Humano", description: "Falar com suporte real" },
];

const subTopics = {
    Login: [
        { problem: "Não consigo entrar na conta", solution: ["Verifique se seu e-mail e senha estão corretos.", "Se esqueceu a senha, use a opção 'Redefinir senha'."] },
        { problem: "Código de verificação não chega", solution: ["Confira sua caixa de spam.", "Confirme se o e-mail está correto.", "Tente reenviar o código."] },
        { problem: "Conta bloqueada", solution: ["Entre em contato com o suporte humano via WhatsApp ou Email.", "Nosso atendente ajudará a desbloquear a conta."] }
    ],
    Erro: [
        { problem: "App travando", solution: ["Reinicie o app.", "Limpe o cache do aplicativo se necessário."] },
        { problem: "Funcionalidade não responde", solution: ["Verifique se está usando a versão mais recente do app.", "Atualize se necessário."] },
        { problem: "Mensagem de erro desconhecida", solution: ["Anote o código do erro.", "Contate o suporte humano para análise detalhada."] }
    ],
    Pagamento: [
        { problem: "Cobrança duplicada", solution: ["Verifique sua fatura.", "Se houver duplicidade, o suporte financeiro fará o estorno."] },
        { problem: "Falha ao pagar", solution: ["Confirme seus dados de pagamento.", "Tente novamente.", "Se falhar, contate o suporte."] }
    ],
    Humano: [
        { problem: "Falar com atendente", solution: ["Clique no WhatsApp ou Email abaixo.", "Nosso atendente assumirá seu caso imediatamente."] }
    ]
};

export default function FuturisticSupport({ open, onClose }) {
    const [messages, setMessages] = useState([{ from: "bot", text: "Olá! Estou aqui para te ajudar." }]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const panelRef = useRef();
    const bottomRef = useRef();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Fecha ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                onClose();
                setSelectedTopic(null);
            }
        };
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open, onClose]);

    // Função para enviar mensagens com delay (bot “digitando”)
    const sendBotMessages = (lines) => {
        let delay = 400;
        lines.forEach((line) => {
            setTimeout(() => {
                setMessages(prev => [...prev, { from: "bot", text: line }]);
            }, delay);
            delay += 800;
        });
    };

    const handleTopicClick = (topicTitle) => {
        setSelectedTopic(topicTitle);
        setMessages(prev => [...prev, { from: "user", text: topicTitle }]);
        sendBotMessages([`Selecione o problema que você está enfrentando em "${topicTitle}":`]);
    };

    const handleSubTopicClick = (sub) => {
        setMessages(prev => [...prev, { from: "user", text: sub.problem }]);
        sendBotMessages(sub.solution);
    };

    const getWhatsApp = () => `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent("Olá, preciso de apoio!")}`;
    const getEmail = () => `mailto:${SUPPORT_EMAIL}?subject=Suporte Futurista&body=Olá, preciso de ajuda!`;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 30 }}
                    className="fixed inset-0 flex items-end justify-end z-[9999] pointer-events-none"
                >
                    {/* Painel */}
                    <motion.div
                        ref={panelRef}
                        className="relative pointer-events-auto w-[90%] max-w-[400px] sm:max-w-[550px] h-[96vh] sm:h-[600px] bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md">
                            <div className="flex items-center gap-2">
                                <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
                                <h3 className="font-semibold text-sm sm:text-lg drop-shadow-sm">Suporte</h3>
                            </div>
                            <button onClick={() => { onClose(); setSelectedTopic(null); }} className="text-white hover:text-gray-200 transition">
                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>

                        {/* Tópicos principais */}
                        {!selectedTopic && (
                            <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 bg-gray-50 border-b">
                                {topics.map((t) => (
                                    <motion.div
                                        key={t.id}
                                        whileHover={{ scale: 1.03 }}
                                        className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl shadow cursor-pointer hover:shadow-xl transition"
                                        onClick={() => handleTopicClick(t.title)}
                                    >
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-xl">
                                            {t.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-xs sm:text-sm">{t.title}</h4>
                                            <p className="text-gray-500 text-xs sm:text-sm">{t.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Sub-tópicos */}
                        {selectedTopic && (
                            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 overflow-y-auto flex-1">
                                <Button
                                    onClick={() => setSelectedTopic(null)}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full px-3 py-1 text-xs sm:text-sm mb-2"
                                >
                                    ← Voltar aos tópicos
                                </Button>
                                {subTopics[selectedTopic]?.map((sub, idx) => (
                                    <Button
                                        key={idx}
                                        onClick={() => handleSubTopicClick(sub)}
                                        className="w-full text-left bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm"
                                    >
                                        {sub.problem}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {/* Chat */}
                        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-2 sm:space-y-3">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-2 sm:p-3 rounded-2xl shadow-md text-xs sm:text-sm
                                        ${msg.from === "user"
                                                ? "bg-indigo-600 text-white rounded-br-none"
                                                : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={bottomRef}></div>
                        </div>

                        {/* Contato */}
                        <div className="p-3 sm:p-4 bg-gray-50 border-t flex flex-col gap-2 sm:gap-3">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <a href={getWhatsApp()} target="_blank" className="flex-1">
                                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center gap-2 shadow-sm transition text-xs sm:text-sm">
                                        <MessageCircle size={16} /> WhatsApp
                                    </Button>
                                </a>
                                <a href={getEmail()} className="flex-1">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 shadow-sm transition text-xs sm:text-sm">
                                        <Mail size={16} /> Email
                                    </Button>
                                </a>
                            </div>

                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
