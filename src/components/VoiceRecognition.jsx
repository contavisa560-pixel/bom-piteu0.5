import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Adicionado AnimatePresence
import { ArrowLeft, Mic, Sparkles, Construction } from 'lucide-react'; // Adicionado Construction
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const VoiceRecognition = ({ onNavigate, onStartChat, user }) => {
  // Estado para mostrar o aviso logo ao abrir
  const [showMaintenance, setShowMaintenance] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    // Mantendo a sua lógica original de verificação Premium
    if (!user.isPremium) {
      toast({
        title: "Funcionalidade Premium! ✨",
        description: "Usa a tua voz para descobrir receitas. Faz upgrade para o plano Premium!",
        variant: "destructive",
      });
      setTimeout(() => onNavigate('dashboard'), 2000);
      return;
    }

    let recognition;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = 'pt-PT';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }

    if (isListening && recognition) {
      recognition.start();
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening, user.isPremium, onNavigate]);

  const handleListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        toast({
            title: "Navegador não suportado",
            description: "A pesquisa por voz não é suportada neste navegador. Tenta no Google Chrome.",
            variant: "destructive",
        });
        return;
    }
    setIsListening(prevState => !prevState);
  };

  useEffect(() => {
    if(transcript) {
        toast({
            title: "Entendido!",
            description: `A procurar receitas para: "${transcript}"`,
        });
        setTimeout(() => {
            onStartChat({ title: "Pesquisa por Voz", query: transcript });
        }, 1500);
    }
  }, [transcript, onStartChat]);

  return (
    <div className="relative min-h-[70vh]">
      
      {/* OVERLAY PROFISSIONAL - ESTILO IGUAL AO ANTERIOR */}
      <AnimatePresence>
        {showMaintenance && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-gray-100"
            >
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Construction className="h-10 w-10 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Em Breve!</h2>
              <p className="text-gray-600 mb-8">
                Estamos a preparar uma experiência incrível para si. Esta funcionalidade estará disponível muito em breve.
              </p>
              
              <Button 
                onClick={() => onNavigate('dashboard')} 
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-6 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Voltar ao Início
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTEÚDO ORIGINAL (INTOCADO) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center h-[70vh]"
      >
        <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="absolute top-0 left-0 mt-8 ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>

        <h1 className="text-4xl font-bold text-gray-800 mb-4">Pesquisa por Voz</h1>
        <p className="text-gray-600 mb-12">Diz-me o que queres cozinhar ou que ingredientes tens.</p>
        
        <motion.div
           animate={{ scale: isListening ? 1.2 : 1 }}
           transition={{ type: "spring", stiffness: 300, damping: 10}}
        >
          <Button
            size="icon"
            className={`w-40 h-40 rounded-full shadow-2xl ${isListening ? 'bg-red-500' : 'bg-orange-500'} text-white`}
            onClick={handleListen}
          >
            <Mic className="h-20 w-20" />
          </Button>
        </motion.div>

        <p className="mt-8 text-xl text-gray-700 font-medium h-8">
          {isListening ? "A ouvir..." : (transcript ? `"${transcript}"` : "Clica para começar")}
        </p>

        <p className="text-sm text-gray-500 mt-12 flex items-center justify-center">
          <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
          Esta é uma funcionalidade Premium.
        </p>
      </motion.div>
    </div>
  );
};

export default VoiceRecognition;