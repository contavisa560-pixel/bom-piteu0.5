// Versão alternativa com animação mais adequada para o ChefHat
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const ChefLoading = () => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  const messages = [
    t("chefLoading.messages.preparing"),
    t("chefLoading.messages.selecting"),
    t("chefLoading.messages.organizing"),
    t("chefLoading.messages.finalizing"),
    t("chefLoading.messages.almostReady"),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2400);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-white"
    >
      <div className="flex flex-col items-center space-y-10 w-[280px]">

        {/* ChefHat com animação de "pular" suave */}
        <motion.div
          animate={{
            y: [0, -10, 0, -5, 0],
            rotate: [0, 5, -5, 5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-24 h-24 flex items-center justify-center"
        >
          <ChefHat
            className="w-16 h-16 text-orange-500"
            strokeWidth={1.5}
          />
        </motion.div>

        {/* Texto animado */}
        <div className="h-6 relative w-full text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45 }}
              className="absolute w-full text-sm text-gray-500 tracking-wide"
            >
              {messages[index]}
            </motion.p>
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
};

export default ChefLoading;