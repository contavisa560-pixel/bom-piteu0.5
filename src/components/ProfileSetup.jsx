import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { Leaf, Heart, WheatOff, MilkOff, FishOff, Shell, NutOff as PeanutOff, Sparkles, ArrowLeft, UserPlus, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UserProfile from '@/components/UserProfile';

const ProfileSetup = ({ onSave, user, onNavigate }) => {
  const [selectedProfiles, setSelectedProfiles] = useState(user?.foodProfile || []);
  const [age, setAge] = useState(user?.age || '');
  const [bloodType, setBloodType] = useState(user?.bloodType || 'A+');
  const [country, setCountry] = useState(user?.country || 'AO');
  const [language, setLanguage] = useState(user?.language || 'pt');
  const [otherAllergy, setOtherAllergy] = useState('');

  const profiles = [
    { id: 'vegetariano', label: 'Vegetariano', icon: Leaf },
    { id: 'vegano', label: 'Vegano', icon: Leaf },
    { id: 'celiaco', label: 'Celíaco', icon: WheatOff },
    { id: 'intolerante_lactose', label: 'Intolerante à Lactose', icon: MilkOff },
    { id: 'alergia_peixe', label: 'Alergia a Peixe', icon: FishOff },
    { id: 'alergia_marisco', label: 'Alergia a Marisco', icon: Shell },
    { id: 'alergia_amendoim', label: 'Alergia a Amendoim', icon: PeanutOff },
    { id: 'hipertenso', label: 'Hipertenso', icon: Heart },
    { id: 'diabetico', label: 'Diabético', icon: Heart },
  ];

  const handleToggleProfile = (profileId) => {
    setSelectedProfiles(prev =>
      prev.includes(profileId)
        ? prev.filter(p => p !== profileId)
        : [...prev, profileId]
    );
  };

  const handleSaveProfile = () => {
    const finalProfiles = [...selectedProfiles];
    if (otherAllergy.trim()) finalProfiles.push(`outro: ${otherAllergy.trim()}`);
    onSave({ foodProfile: finalProfiles, age, bloodType, country, language });
    toast({
      title: "Perfil guardado!",
      description: "As tuas preferências foram atualizadas.",
    });
    onNavigate('/profile'); // volta para perfil
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Button variant="ghost" onClick={() => onNavigate('/profile')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg p-8 md:p-12 rounded-3xl shadow-2xl w-full"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center">Configurações do Perfil</h1>
        <p className="text-gray-600 mb-8 text-center">Personaliza a tua experiência para receberes as melhores sugestões.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h2 className="font-semibold text-xl text-gray-700 mb-4 flex items-center"><UserPlus className="mr-2"/> Dados Pessoais</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Idade</Label>
                  <Input id="age" type="number" value={age} onChange={e => setAge(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="bloodType">Tipo Sanguíneo</Label>
                  <select id="bloodType" value={bloodType} onChange={e => setBloodType(e.target.value)} className="w-full h-10 border border-input rounded-md px-3">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-xl text-gray-700 mb-4 flex items-center"><Globe className="mr-2"/> Localização e Idioma</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">País</Label>
                  <select id="country" value={country} onChange={e => setCountry(e.target.value)} className="w-full h-10 border border-input rounded-md px-3">
                    <option value="AO">Angola</option>
                    <option value="BR">Brasil</option>
                    <option value="PT">Portugal</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <select id="language" value={language} onChange={e => setLanguage(e.target.value)} className="w-full h-10 border border-input rounded-md px-3">
                    <option value="pt">Português</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="font-semibold text-xl text-gray-700 flex items-center"><Heart className="mr-2"/> Alergias e Intolerâncias</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {profiles.map(p => (
                <motion.div key={p.id} whileHover={{ scale: 1.05 }}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${selectedProfiles.includes(p.id) ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                  onClick={() => handleToggleProfile(p.id)}
                >
                  <Checkbox id={p.id} checked={selectedProfiles.includes(p.id)} className="mr-3" />
                  <p.icon className={`h-5 w-5 mr-2 ${selectedProfiles.includes(p.id) ? 'text-orange-600' : 'text-gray-500'}`} />
                  <label htmlFor={p.id} className="text-sm font-medium text-gray-800 cursor-pointer">{p.label}</label>
                </motion.div>
              ))}
            </div>
            <div>
              <Label htmlFor="otherAllergy" className="flex items-center"><Sparkles className="h-4 w-4 mr-2"/> Outra Alergia</Label>
              <Input id="otherAllergy" type="text" value={otherAllergy} onChange={e => setOtherAllergy(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button onClick={handleSaveProfile} size="lg" className="mt-12 w-full md:w-1/2 mx-auto bg-gradient-to-r from-orange-500 to-red-500 text-white">
            Guardar Alterações
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;
