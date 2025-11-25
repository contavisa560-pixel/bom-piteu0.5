
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Globe, Languages, Heart } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Onboarding = ({ onComplete, user }) => {
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState('AO');
  const [language, setLanguage] = useState('pt');
  const [interests, setInterests] = useState([]);

  const countries = [
    { code: 'AO', name: 'Angola 🇦🇴' },
    { code: 'BR', name: 'Brasil 🇧🇷' },
    { code: 'PT', name: 'Portugal 🇵🇹' },
    { code: 'US', name: 'EUA 🇺🇸' },
    { code: 'IT', name: 'Itália 🇮🇹' },
    { code: 'JP', name: 'Japão 🇯🇵' },
  ];

  const languages = [
    { code: 'pt', name: 'Português' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
  ];

  const interestOptions = ['Rápido e Fácil', 'Saudável', 'Gourmet', 'Pastelaria', 'Vegetariano', 'Cocktails'];

  const handleToggleInterest = (interest) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (interests.length === 0) {
        toast({
          title: "Selecione pelo menos um interesse",
          description: "Isto ajuda-nos a personalizar a tua experiência.",
          variant: "destructive",
        });
        return;
      }
      onComplete({ country, language, interests });
      toast({
        title: "Tudo pronto!",
        description: "A tua experiência foi personalizada. Bem-vindo(a)!",
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <Globe className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">De onde és?</h2>
            <p className="text-gray-600 mb-6">Isto ajuda-nos a sugerir receitas locais.</p>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full h-12 border border-input bg-background rounded-md px-3 text-lg">
              {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>
        );
      case 2:
        return (
          <div>
            <Languages className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Que idioma preferes?</h2>
            <p className="text-gray-600 mb-6">Vamos comunicar contigo no teu idioma preferido.</p>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full h-12 border border-input bg-background rounded-md px-3 text-lg">
              {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
        );
      case 3:
        return (
          <div>
            <Heart className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Quais são os teus interesses?</h2>
            <p className="text-gray-600 mb-6">Escolhe alguns para começarmos.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {interestOptions.map(interest => (
                <Button
                  key={interest}
                  variant={interests.includes(interest) ? 'default' : 'outline'}
                  onClick={() => handleToggleInterest(interest)}
                  className={`rounded-full transition-all ${interests.includes(interest) ? 'bg-orange-500 text-white' : ''}`}
                >
                  {interest}
                </Button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/80 backdrop-blur-lg p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
        <Button onClick={handleNext} size="lg" className="mt-8 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white">
          {step < 3 ? 'Próximo' : 'Concluir'}
        </Button>
      </motion.div>
    </div>
  );
};

export default Onboarding;
  