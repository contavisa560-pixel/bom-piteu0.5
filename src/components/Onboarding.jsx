import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Globe, Languages, Heart } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const Onboarding = ({ onComplete, user }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState('AO');
  const [language, setLanguage] = useState('pt');
  const [interests, setInterests] = useState([]);

  const countries = [
    { code: 'AO', name: t('onboarding.countries.AO') },
    { code: 'BR', name: t('onboarding.countries.BR') },
    { code: 'PT', name: t('onboarding.countries.PT') },
    { code: 'US', name: t('onboarding.countries.US') },
    { code: 'IT', name: t('onboarding.countries.IT') },
    { code: 'JP', name: t('onboarding.countries.JP') },
  ];

  const languages = [
    { code: 'pt', name: t('onboarding.languages.pt') },
    { code: 'en', name: t('onboarding.languages.en') },
    { code: 'es', name: t('onboarding.languages.es') },
  ];

  const interestOptions = [
    t('onboarding.interests.quick'),
    t('onboarding.interests.healthy'),
    t('onboarding.interests.gourmet'),
    t('onboarding.interests.pastry'),
    t('onboarding.interests.vegetarian'),
    t('onboarding.interests.cocktails'),
  ];

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
          title: t('onboarding.toast.selectInterestTitle'),
          description: t('onboarding.toast.selectInterestDesc'),
          variant: "destructive",
        });
        return;
      }
      onComplete({ country, language, interests });
      toast({
        title: t('onboarding.toast.completeTitle'),
        description: t('onboarding.toast.completeDesc'),
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <Globe className="h-12 w-12 mx-auto text-orange-500 dark:text-orange-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('onboarding.step1.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('onboarding.step1.description')}</p>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full h-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 text-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent outline-none"
            >
              {countries.map(c => <option key={c.code} value={c.code} className="dark:bg-gray-700">{c.name}</option>)}
            </select>
          </div>
        );
      case 2:
        return (
          <div>
            <Languages className="h-12 w-12 mx-auto text-orange-500 dark:text-orange-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('onboarding.step2.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('onboarding.step2.description')}</p>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full h-12 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 text-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent outline-none"
            >
              {languages.map(l => <option key={l.code} value={l.code} className="dark:bg-gray-700">{l.name}</option>)}
            </select>
          </div>
        );
      case 3:
        return (
          <div>
            <Heart className="h-12 w-12 mx-auto text-orange-500 dark:text-orange-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('onboarding.step3.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('onboarding.step3.description')}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {interestOptions.map(interest => (
                <Button
                  key={interest}
                  variant={interests.includes(interest) ? 'default' : 'outline'}
                  onClick={() => handleToggleInterest(interest)}
                  className={`rounded-full transition-all ${interests.includes(interest)
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
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
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-gray-700"
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
        <Button
          onClick={handleNext}
          size="lg"
          className="mt-8 w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
        >
          {step < 3 ? t('onboarding.next') : t('onboarding.finish')}
        </Button>
      </motion.div>
    </div>
  );
};

export default Onboarding;