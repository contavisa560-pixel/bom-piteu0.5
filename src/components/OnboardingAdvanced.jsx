import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

// Definição dos passos do onboarding
const steps = [
  { id: 1, title: "Bem-vindo ao Bom Piteu!", description: "Descobre receitas personalizadas e interage com o Chef Assistente.", highlightSelector: ".bg-gradient-to-r" },
  { id: 2, title: "Fala com o Chef Assistente", description: "Converse com o Chef para receber dicas e receitas inteligentes.", highlightSelector: "#chatButton" },
  { id: 3, title: "Reconhece Ingredientes", description: "Use a câmera para identificar ingredientes e receitas.", highlightSelector: "#cameraButton" },
  { id: 4, title: "Pesquisa por Voz", description: "Pode pesquisar receitas apenas falando com o microfone.", highlightSelector: "#voiceButton" },
  { id: 5, title: "Sugestões do Dia", description: "Recebe receitas sugeridas especialmente para ti.", highlightSelector: ".daily-recipes-card" },
  { id: 6, title: "Petiscos & Bebidas", description: "Explora petiscos e bebidas para todas as ocasiões.", highlightSelector: ".grid.grid-cols-2.md\\:grid-cols-4" },
];

const OnboardingAdvanced = ({ onFinish, userId }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightStyles, setHighlightStyles] = useState({});
  const [arrowStyles, setArrowStyles] = useState({});
  const [positionAbove, setPositionAbove] = useState(true);

  // Avançar para o próximo passo
  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
    else {
      localStorage.setItem(`onboardingCompleted_${userId}`, "true");
      onFinish();
    }
  };

  // Atualiza posição do highlight e seta
  const updatePosition = () => {
    const step = steps[currentStep];
    if (!step) return;

    const element = document.querySelector(step.highlightSelector);
    if (!element) {
      setTimeout(updatePosition, 100);
      return;
    }

    const rect = element.getBoundingClientRect();
    const padding = Math.min(16, rect.height * 0.1);
    const scrollY = window.scrollY || window.pageYOffset;

    // Highlight
    setHighlightStyles({
      top: rect.top + scrollY - padding,
      left: Math.max(rect.left + window.scrollX - padding, 8),
      width: Math.min(rect.width + padding * 2, window.innerWidth - 16),
      height: rect.height + padding * 2,
    });

    // Seta
    const isAbove = rect.top + scrollY > window.innerHeight / 3;
    setPositionAbove(isAbove);
    setArrowStyles({
      top: isAbove ? rect.top + scrollY - 50 : rect.bottom + scrollY + 10,
      left: rect.left + window.scrollX + rect.width / 2 - 15,
      rotate: isAbove ? 0 : 180,
    });

    // Scroll automático
    const targetScroll = rect.top + scrollY - window.innerHeight / 4;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [currentStep]);

  return (
    <AnimatePresence>
      <motion.div key={currentStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 pointer-events-none">
        {/* Fundo escuro */}
        <motion.div className="fixed inset-0 bg-black/70 pointer-events-auto" initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }} />

        {/* Highlight */}
        <motion.div className="absolute border-4 border-yellow-400 rounded-2xl pointer-events-none" style={highlightStyles} layout transition={{ type: "spring", stiffness: 500, damping: 30 }} />

        {/* Seta animada */}
        <motion.div className="absolute text-yellow-400" style={{ ...arrowStyles }} animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
          <ArrowUp size={window.innerWidth < 640 ? 20 : 30} style={{ transform: `rotate(${arrowStyles.rotate || 0}deg)` }} />
        </motion.div>

        {/* Balão de texto */}
        {/* Balão de texto */}
        <motion.div
          key={`text-${currentStep}`}
          className="fixed bg-white p-4 sm:p-6 rounded-3xl shadow-2xl pointer-events-auto overflow-auto max-h-[40vh] sm:max-h-[45vh]"
          style={{
            bottom: positionAbove ? 20 : "auto",
            top: positionAbove ? "auto" : arrowStyles.top + 40,
            left: "10%",
            transform: "translateX(-50%)",
            maxWidth: Math.min(window.innerWidth - 16, 400), // nunca maior que a tela
            width: "90%",
          }}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-base sm:text-xl md:text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
          <p className="text-sm sm:text-base md:text-lg mb-4">{steps[currentStep].description}</p>

          {/* Indicadores de passos */}
          <div className="flex justify-center space-x-2 mb-4">
            {steps.map((s, idx) => (
              <motion.div
                key={s.id}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${idx === currentStep ? "bg-yellow-400" : "bg-gray-300"}`}
                animate={{ scale: idx === currentStep ? 1.5 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            ))}
          </div>

          {/* Botão */}
          <Button onClick={nextStep} className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base">
            {currentStep < steps.length - 1 ? "Próximo Passo" : "Concluir"}
          </Button>
        </motion.div>

      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingAdvanced;
