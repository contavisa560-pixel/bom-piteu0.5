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
    Send,
    MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useChat } from "../context/ChatContext"; // ajusta o caminho se necessário

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "suporte@tuadomain.com";

const topics = [
    { id: 1, icon: <User size={20} />, titleKey: "support.topics.login.title", descriptionKey: "support.topics.login.description" },
    { id: 2, icon: <AlertCircle size={20} />, titleKey: "support.topics.error.title", descriptionKey: "support.topics.error.description" },
    { id: 3, icon: <CreditCard size={20} />, titleKey: "support.topics.payment.title", descriptionKey: "support.topics.payment.description" },
    { id: 4, icon: <MessageSquare size={20} />, titleKey: "support.topics.human.title", descriptionKey: "support.topics.human.description" },
];

const subTopics = {
    Login: [
        { problemKey: "support.subtopics.login.problem1", solutionKeys: ["support.subtopics.login.solution1a", "support.subtopics.login.solution1b"] },
        { problemKey: "support.subtopics.login.problem2", solutionKeys: ["support.subtopics.login.solution2a", "support.subtopics.login.solution2b", "support.subtopics.login.solution2c"] },
        { problemKey: "support.subtopics.login.problem3", solutionKeys: ["support.subtopics.login.solution3a", "support.subtopics.login.solution3b"] }
    ],
    Erro: [
        { problemKey: "support.subtopics.error.problem1", solutionKeys: ["support.subtopics.error.solution1a", "support.subtopics.error.solution1b"] },
        { problemKey: "support.subtopics.error.problem2", solutionKeys: ["support.subtopics.error.solution2a", "support.subtopics.error.solution2b"] },
        { problemKey: "support.subtopics.error.problem3", solutionKeys: ["support.subtopics.error.solution3a", "support.subtopics.error.solution3b"] }
    ],
    Pagamento: [
        { problemKey: "support.subtopics.payment.problem1", solutionKeys: ["support.subtopics.payment.solution1a", "support.subtopics.payment.solution1b"] },
        { problemKey: "support.subtopics.payment.problem2", solutionKeys: ["support.subtopics.payment.solution2a", "support.subtopics.payment.solution2b", "support.subtopics.payment.solution2c"] }
    ],
    Humano: [
        { problemKey: "support.subtopics.human.problem1", solutionKeys: ["support.subtopics.human.solution1a", "support.subtopics.human.solution1b"] }
    ]
};

const topicIdToKey = {
    1: "Login",
    2: "Erro",
    3: "Pagamento",
    4: "Humano"
};

export default function FuturisticSupport({ open, onClose }) {
    const { t } = useTranslation();
    const { currentChat, loading, error, startChat, sendMessage, leaveChat } = useChat();

    const [mode, setMode] = useState('topics'); // 'topics' ou 'chat'
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [messages, setMessages] = useState([{ from: "bot", text: t("support.initialMessage") }]);
    const [inputMessage, setInputMessage] = useState('');

    const panelRef = useRef();
    const bottomRef = useRef();
    const inputRef = useRef();

    // Scroll automático
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, currentChat?.messages]);

    // Fechar ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                handleClose();
            }
        };
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const handleClose = () => {
        onClose();
        setSelectedTopic(null);
        setMode('topics');
        setMessages([{ from: "bot", text: t("support.initialMessage") }]);
        leaveChat();
    };

    const sendBotMessages = (lines) => {
        let delay = 400;
        lines.forEach((line) => {
            setTimeout(() => {
                setMessages(prev => [...prev, { from: "bot", text: line }]);
            }, delay);
            delay += 800;
        });
    };

    const handleTopicClick = (topic) => {
        setSelectedTopic(topic);
        setMessages(prev => [...prev, { from: "user", text: t(topic.titleKey) }]);
        sendBotMessages([t("support.selectProblem", { topic: t(topic.titleKey) })]);
    };

    const handleSubTopicClick = (sub) => {
        setMessages(prev => [...prev, { from: "user", text: t(sub.problemKey) }]);
        const translatedSolutions = sub.solutionKeys.map(key => t(key));
        sendBotMessages(translatedSolutions);
    };

    const handleStartChat = async () => {
        const user = JSON.parse(localStorage.getItem('bomPiteuUser'));
        if (!user) {
            alert('Por favor, faça login para usar o chat');
            return;
        }
        await startChat();
        setMode('chat');
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;
        sendMessage(inputMessage);
        setInputMessage('');
    };

    const handleBackToTopics = () => {
        setMode('topics');
        setSelectedTopic(null);
        setMessages([{ from: "bot", text: t("support.initialMessage") }]);
        leaveChat();
    };

    const getEmail = () => `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(t("support.emailSubject"))}&body=${encodeURIComponent(t("support.emailBody"))}`;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 30 }}
                    className="fixed inset-0 flex items-end justify-end z-[9999] pointer-events-none"
                >
                    <motion.div
                        ref={panelRef}
                        className="relative pointer-events-auto w-[90%] max-w-[400px] sm:max-w-[550px] h-[90vh] sm:h-[600px] bg-gradient-to-br from-gray-50 dark:from-gray-800 to-white dark:to-gray-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md">
                            <div className="flex items-center gap-2">
                                <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
                                <h3 className="font-semibold text-sm sm:text-lg drop-shadow-sm">
                                    {mode === 'chat' ? "Chat ao Vivo" : t("support.title")}
                                </h3>
                            </div>
                            <button onClick={handleClose} className="text-white hover:text-gray-200 transition">
                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>

                        {/* Modo Tópicos */}
                        {mode === 'topics' && (
                            <>
                                {!selectedTopic && (
                                    <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                        {topics.map((topic) => (
                                            <motion.div
                                                key={topic.id}
                                                whileHover={{ scale: 1.03 }}
                                                className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white dark:bg-gray-700 rounded-xl shadow cursor-pointer hover:shadow-xl transition"
                                                onClick={() => handleTopicClick(topic)}
                                            >
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                                    {topic.icon}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white">{t(topic.titleKey)}</h4>
                                                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{t(topic.descriptionKey)}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {selectedTopic && (
                                    <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 overflow-y-auto flex-1">
                                        <Button
                                            onClick={() => setSelectedTopic(null)}
                                            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full px-3 py-1 text-xs sm:text-sm mb-2"
                                        >
                                            ← {t("support.backToTopics")}
                                        </Button>
                                        {subTopics[topicIdToKey[selectedTopic.id]]?.map((sub, idx) => (
                                            <Button
                                                key={idx}
                                                onClick={() => handleSubTopicClick(sub)}
                                                className="w-full text-left bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 rounded-xl px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm"
                                            >
                                                {t(sub.problemKey)}
                                            </Button>
                                        ))}
                                    </div>
                                )}

                                <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-2 sm:space-y-3">
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[80%] p-2 sm:p-3 rounded-2xl shadow-md text-xs sm:text-sm
                                                ${msg.from === "user"
                                                        ? "bg-indigo-600 text-white rounded-br-none"
                                                        : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-600"
                                                    }`}
                                            >
                                                {msg.text}
                                            </div>
                                        </motion.div>
                                    ))}
                                    <div ref={bottomRef}></div>
                                </div>
                            </>
                        )}

                        {/* Modo Chat Ao Vivo */}
                        {mode === 'chat' && (
                            <div className="flex-1 flex flex-col">
                                <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-2 sm:space-y-3">
                                    {loading && <p className="text-center text-gray-500">Carregando...</p>}
                                    {error && <p className="text-center text-red-500">{error}</p>}
                                    {currentChat?.messages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] p-2 sm:p-3 rounded-2xl shadow-md text-xs sm:text-sm
                                                ${msg.sender === 'user'
                                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                                                    }`}
                                            >
                                                {msg.content}
                                                <div className="text-[10px] opacity-70 mt-1">
                                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    <div ref={bottomRef}></div>
                                </div>

                                <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        placeholder="Escreva sua mensagem..."
                                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                    />
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4">
                                        <Send size={18} />
                                    </Button>
                                </form>

                                <div className="p-2 text-center">
                                    <button
                                        onClick={handleBackToTopics}
                                        className="text-indigo-600 dark:text-indigo-400 text-xs hover:underline"
                                    >
                                        ← Voltar aos tópicos de ajuda
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Rodapé com botões (só no modo tópicos) */}
                        {mode === 'topics' && (
                            <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-2 sm:gap-3">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button
                                        onClick={handleStartChat}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center gap-2 shadow-sm transition text-xs sm:text-sm"
                                    >
                                        <MessageCircle size={16} /> Chat
                                    </Button>
                                    <a href={getEmail()} className="flex-1">
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 shadow-sm transition text-xs sm:text-sm">
                                            <Mail size={16} /> {t("support.emailButton")}
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}