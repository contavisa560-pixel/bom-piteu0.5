
    import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { ArrowLeft, Mic, Sparkles } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { toast } from '@/components/ui/use-toast';

    const VoiceRecognition = ({ onNavigate, onStartChat, user }) => {
      const [isListening, setIsListening] = useState(false);
      const [transcript, setTranscript] = useState('');

      useEffect(() => {
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
      );
    };

    export default VoiceRecognition;
  