import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Check, ChefHat } from 'lucide-react';

const CookieBanner = ({ onNavigate }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('bomPiteu_cookie_consent');
        if (!consent) {
            setTimeout(() => setVisible(true), 1000);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('bomPiteu_cookie_consent', 'accepted');
        setVisible(false);
    };

    const handleReject = () => {
        localStorage.setItem('bomPiteu_cookie_consent', 'rejected');
        setVisible(false);
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    transition={{ duration: 0.4 }}
                    className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 z-50"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-orange-100 dark:border-gray-700 p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-4">

                        {/* Ícone */}
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2.5 rounded-xl shrink-0">
                            <ChefHat className="h-6 w-6 text-orange-500" />
                        </div>

                        {/* Texto */}
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800 dark:text-white mb-0.5">
                                🍪 Usamos cookies
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Utilizamos cookies para melhorar a tua experiência. Ao continuar, aceitas a nossa{' '}
                                <button
                                    onClick={() => { handleAccept(); window.location.href = '/cookies'; }}
                                    className="text-orange-500 underline hover:text-orange-600"
                                >
                                    política de cookies
                                </button>.
                            </p>
                        </div>

                        {/* Botões */}
                        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                            <button
                                onClick={handleReject}
                                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                                Recusar
                            </button>
                            <button
                                onClick={handleAccept}
                                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-colors"
                            >
                                <Check className="h-3.5 w-3.5" />
                                Aceitar
                            </button>
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieBanner;