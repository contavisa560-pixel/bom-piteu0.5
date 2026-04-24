import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { Leaf, Heart, WheatOff, MilkOff, FishOff, Shell, NutOff as PeanutOff, Sparkles, ArrowLeft, UserPlus, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

const ProfileSetup = ({ onSave, user, onNavigate }) => {
  const { t } = useTranslation();
  // Garantir que os estados iniciais nunca sejam undefined ou null
  const [selectedProfiles, setSelectedProfiles] = useState(user?.foodProfile || []);
  const [age, setAge] = useState(user?.age || "");
  const [bloodType, setBloodType] = useState(user?.bloodType || 'A+');
  const [country, setCountry] = useState(user?.country || 'AO');
  const [language, setLanguage] = useState(user?.language || 'pt');
  const [otherAllergy, setOtherAllergy] = useState('');

  // Sincronizar estados se o 'user' demorar a carregar do Atlas
  useEffect(() => {
    if (user) {
      setSelectedProfiles(user.foodProfile || []);
      setAge(user.age || "");
      setBloodType(user.bloodType || 'A+');
      setCountry(user.country || 'AO');
      setLanguage(user.language || 'pt');
    }
  }, [user]);

  const profiles = [
    { id: 'vegetariano', label: t('profileSetup.profiles.vegetarian'), icon: Leaf },
    { id: 'vegano', label: t('profileSetup.profiles.vegan'), icon: Leaf },
    { id: 'celiaco', label: t('profileSetup.profiles.celiac'), icon: WheatOff },
    { id: 'intolerante_lactose', label: t('profileSetup.profiles.lactoseIntolerant'), icon: MilkOff },
    { id: 'alergia_peixe', label: t('profileSetup.profiles.fishAllergy'), icon: FishOff },
    { id: 'alergia_marisco', label: t('profileSetup.profiles.shellfishAllergy'), icon: Shell },
    { id: 'alergia_amendoim', label: t('profileSetup.profiles.peanutAllergy'), icon: PeanutOff },
    { id: 'hipertenso', label: t('profileSetup.profiles.hypertensive'), icon: Heart },
    { id: 'diabetico', label: t('profileSetup.profiles.diabetic'), icon: Heart },
  ];

  const handleToggleProfile = (profileId) => {
    setSelectedProfiles(prev =>
      prev.includes(profileId)
        ? prev.filter(p => p !== profileId)
        : [...prev, profileId]
    );
  };

  const handleSaveProfile = async () => {
    try {
      const finalProfiles = [...selectedProfiles];
      if (otherAllergy.trim()) {
        const allergyLabel = `outro: ${otherAllergy.trim()}`;
        if (!finalProfiles.includes(allergyLabel)) {
          finalProfiles.push(allergyLabel);
        }
      }

      // Envia os dados estruturados para o componente pai (App.jsx ou similar)
      await onSave({ 
        foodProfile: finalProfiles, 
        age: String(age), // Garantir que vai como string se necessário
        bloodType, 
        country, 
        language 
      });

      toast({
        title: t('profileSetup.toast.successTitle'),
        description: t('profileSetup.toast.successDesc'),
      });

      // Pequeno delay para garantir que o utilizador vê o feedback antes de mudar de página
      setTimeout(() => onNavigate('/profile'), 500);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: t('profileSetup.toast.errorDesc'),
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Button variant="ghost" onClick={() => onNavigate('/profile')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
      </Button>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg p-8 md:p-12 rounded-3xl shadow-2xl w-full"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center">{t('profileSetup.title')}</h1>
        <p className="text-gray-600 mb-8 text-center">{t('profileSetup.subtitle')}</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h2 className="font-semibold text-xl text-gray-700 mb-4 flex items-center"><UserPlus className="mr-2"/> {t('profileSetup.personalDataTitle')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">{t('profileSetup.ageLabel')}</Label>
                  <Input 
                    id="age" 
                    type="number" 
                    value={age || ""} 
                    onChange={e => setAge(e.target.value)} 
                    placeholder={t('profileSetup.agePlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="bloodType">{t('profileSetup.bloodTypeLabel')}</Label>
                  <select 
                    id="bloodType" 
                    value={bloodType || "A+"} 
                    onChange={e => setBloodType(e.target.value)} 
                    className="w-full h-10 border border-input rounded-md px-3 bg-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-xl text-gray-700 mb-4 flex items-center"><Globe className="mr-2"/> {t('profileSetup.locationTitle')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">{t('profileSetup.countryLabel')}</Label>
                  <select id="country" value={country} onChange={e => setCountry(e.target.value)} className="w-full h-10 border border-input rounded-md px-3 bg-white">
                    <option value="AO">{t('countries.angola')}</option>
                    <option value="BR">{t('countries.brazil')}</option>
                    <option value="PT">{t('countries.portugal')}</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="language">{t('profileSetup.languageLabel')}</Label>
                  <select id="language" value={language} onChange={e => setLanguage(e.target.value)} className="w-full h-10 border border-input rounded-md px-3 bg-white">
                    <option value="pt">{t('profileSetup.languages.pt')}</option>
                    <option value="en">{t('profileSetup.languages.en')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="font-semibold text-xl text-gray-700 flex items-center"><Heart className="mr-2"/> {t('profileSetup.allergiesTitle')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {profiles.map(p => (
                <motion.div key={p.id} whileHover={{ scale: 1.02 }}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${selectedProfiles.includes(p.id) ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                  onClick={() => handleToggleProfile(p.id)}
                >
                  <Checkbox id={p.id} checked={selectedProfiles.includes(p.id)} onCheckedChange={() => handleToggleProfile(p.id)} className="mr-3" />
                  <p.icon className={`h-5 w-5 mr-2 ${selectedProfiles.includes(p.id) ? 'text-orange-600' : 'text-gray-500'}`} />
                  <label className="text-sm font-medium text-gray-800 cursor-pointer">{p.label}</label>
                </motion.div>
              ))}
            </div>
            <div>
              <Label htmlFor="otherAllergy" className="flex items-center"><Sparkles className="h-4 w-4 mr-2"/> {t('profileSetup.otherAllergyLabel')}</Label>
              <Input 
                id="otherAllergy" 
                type="text" 
                value={otherAllergy || ""} 
                onChange={e => setOtherAllergy(e.target.value)} 
                placeholder={t('profileSetup.otherAllergyPlaceholder')}
              />
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button onClick={handleSaveProfile} size="lg" className="mt-12 w-full md:w-1/2 mx-auto bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 transition-opacity">
            {t('profileSetup.saveButton')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;