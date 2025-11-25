
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, MessageCircle, Mic, AlertCircle, Wine, Cake, UtensilsCrossed as UtensilsCross, ShoppingCart, Heart, Globe, Calendar, Clipboard, ArrowRight, Baby, User as UserIcon, Beer, GlassWater as GlassWhiskey } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = ({ onStartChat, onNavigate, user }) => {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const lastLoginStr = localStorage.getItem('bomPiteuLastLogin');
    const today = new Date().toDateString();

    if (lastLoginStr) {
      const lastLogin = new Date(lastLoginStr);
      const currentStreak = parseInt(localStorage.getItem('bomPiteuStreak') || '0', 10);

      const diffTime = new Date(today) - new Date(lastLogin.toDateString());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        const newStreak = currentStreak + 1;
        setStreak(newStreak);
        localStorage.setItem('bomPiteuStreak', newStreak.toString());
        toast({ title: `🔥 Dia ${newStreak}!`, description: "Estás imparável! Continuas a tua jornada culinária." });
      } else if (diffDays > 1) {
        setStreak(1);
        localStorage.setItem('bomPiteuStreak', '1');
        toast({ title: "De volta à cozinha!", description: "Um novo começo para uma nova série de delícias!" });
      } else {
        setStreak(currentStreak);
      }
    } else {
      setStreak(1);
      localStorage.setItem('bomPiteuStreak', '1');
    }

    localStorage.setItem('bomPiteuLastLogin', today);
  }, []);

  const handleFeatureClick = (feature) => {
    if (feature === 'Viagem Gastronómica') {
      onNavigate('internationalRecipes');
      return;
    }
    toast({
      title: `🚧 Funcionalidade '${feature}' em breve!`,
      description: "Estamos a construir esta secção para ti. Fica atento às novidades!",
    });
  };

  const handleSpecialFoodClick = (category) => {
    toast({
      title: `Bem-vindo à secção de ${category}!`,
      description: "Aqui encontrarás receitas especiais. Pede ao Chef IA o que precisas!",
    });
    onStartChat({ title: category });
  };

  const handleRecipeClick = (recipeName) => {
    onStartChat({ title: recipeName });
  };

  const dailyRecipes = [
    { name: "Salada Caesar com Frango", image: "Salada Caesar com frango grelhado e croutons", category: "Almoço Leve" },
    { name: "Sopa de Lentilhas", image: "Sopa de lentilhas vermelhas com um fio de azeite", category: "Jantar Rápido" },
    { name: "Panquecas de Aveia", image: "Pilha de panquecas de aveia com frutos vermelhos", category: "Pequeno-almoço" },
  ];

  const petiscos = [
    { name: "Tábua de Queijos (Vinho)", icon: Wine, country: "🇵🇹", recipe: "Petiscos com queijo para vinho" },
    { name: "Asas de Frango Picantes (Cerveja)", icon: Beer, country: "🇺🇸", recipe: "Asas de frango picantes para cerveja" },
    { name: "Amendoim Torrado (Whisky)", icon: GlassWhiskey, country: "🇧🇷", recipe: "Amendoim torrado para whisky" },
    { name: "Bruschetta de Tomate (Vinho)", icon: Wine, country: "🇮🇹", recipe: "Bruschetta italiana para vinho" },
  ];

  const quickAccessItems = [
    { title: "Marketplace", icon: ShoppingCart, color: "text-green-500", action: () => onNavigate('marketplace') },
    { title: "Canto da Saúde", icon: Heart, color: "text-red-500", action: () => handleSpecialFoodClick('Receitas Saudáveis') },
    { title: "Viagem Gastronómica", icon: Globe, color: "text-blue-500", action: () => handleFeatureClick('Viagem Gastronómica') },
    { title: "Notas Médicas", icon: Clipboard, color: "text-purple-500", action: () => handleFeatureClick('Notas Médicas') },
  ];

  const specialFoodItems = [
    { title: "Alimentação Infantil", icon: Baby, color: "text-teal-500", action: () => handleSpecialFoodClick('Comida para Bebés e Crianças') },
    { title: "Alimentação Sénior", icon: UserIcon, color: "text-indigo-500", action: () => handleSpecialFoodClick('Comida para Idosos') },
  ];
  if (!user) {
    return <div className="text-center text-gray-500 mt-10">A carregar informações do utilizador...</div>;
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center bg-gradient-to-r from-orange-500 to-red-500 text-white p-8 rounded-2xl shadow-2xl overflow-hidden relative"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full"></div>
        <h1 className="text-4xl md:text-5xl font-bold mb-2 relative z-10">
          Olá, {user?.name ? user.name.split(' ')[0] : 'Chef'}!
        </h1>

        <p className="text-lg text-white/90 max-w-3xl mx-auto mb-6 relative z-10">O que vamos cozinhar hoje?</p>
        <div className="flex justify-center flex-wrap gap-4 relative z-10">
          <Button onClick={() => onNavigate('imageRecognition')} size="lg" className="bg-white text-orange-600 hover:bg-white/90 rounded-full shadow-lg transition-all transform hover:scale-105"><Camera className="mr-2 h-6 w-6" /> Reconhecer Imagem</Button>
          <Button onClick={() => onStartChat(null)} size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-full shadow-lg transition-all transform hover:scale-105"><MessageCircle className="mr-2 h-6 w-6" /> Falar com o Chef</Button>
          <Button onClick={() => onNavigate('voiceRecognition')} size="lg" className="bg-white text-blue-600 hover:bg-white/90 rounded-full shadow-lg transition-all transform hover:scale-105"><Mic className="mr-2 h-6 w-6" /> Pesquisa por Voz</Button>
        </div>
      </motion.div>

      {(!user.foodProfile || user.foodProfile.length === 0) && (
        <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-r-lg flex items-center justify-between">
          <div className="flex items-center"><AlertCircle className="h-6 w-6 mr-3" /><h3 className="font-bold">Completa o teu perfil para receberes sugestões personalizadas!</h3></div>
          <Button onClick={() => onNavigate('profileSetup')} size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white flex-shrink-0">Completar</Button>
        </motion.div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        <Card className="col-span-2 sm:col-span-1 lg:col-span-1 flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-800">
          <Calendar className="h-8 w-8 mb-2" />
          <p className="text-2xl font-bold">{streak} {streak === 1 ? 'Dia' : 'Dias'}</p>
          <p className="text-xs font-semibold text-center">de sequência!</p>
        </Card>
        {quickAccessItems.map(item => (
          <Card key={item.title} className="flex flex-col items-center justify-center p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={item.action}>
            <item.icon className={`h-8 w-8 mb-2 ${item.color}`} />
            <p className="text-sm font-semibold text-center text-gray-700">{item.title}</p>
          </Card>
        ))}
        {specialFoodItems.map(item => (
          <Card key={item.title} className="flex flex-col items-center justify-center p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={item.action}>
            <item.icon className={`h-8 w-8 mb-2 ${item.color}`} />
            <p className="text-sm font-semibold text-center text-gray-700">{item.title}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Sugestões do Dia</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dailyRecipes.map((recipe) => (
            <motion.div key={recipe.name} whileHover={{ y: -5 }} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer" onClick={() => handleRecipeClick(recipe.name)}>
              <div className="h-40 overflow-hidden relative">
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={recipe.image} src="https://images.unsplash.com/photo-1676436293942-99438c6058be" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <span className="absolute bottom-2 left-3 text-white font-semibold text-lg">{recipe.name}</span>
                <span className="absolute top-2 right-2 bg-white/80 text-gray-800 text-xs font-bold px-2 py-1 rounded-full">{recipe.category}</span>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">Petiscos & Acompanhamentos</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => handleFeatureClick('Petiscos')}>Ver Mais <ArrowRight className="ml-1 h-4 w-4" /></Button>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {petiscos.map(item => (
            <div key={item.name} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border" onClick={() => handleRecipeClick(item.recipe)}>
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center relative">
                <item.icon className="w-6 h-6 text-gray-700" />
                <span className="absolute -top-1 -right-1 text-lg">{item.country}</span>
              </div>
              <p className="font-semibold text-gray-700 text-sm flex-1">{item.name}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center"><Cake className="mr-2 text-pink-500" />Doces & Sobremesas</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => handleFeatureClick('Doces')}>Ver Mais <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {[{ name: "Mousse de Chocolate", icon: Cake }, { name: "Pudim de Leite Condensado", icon: UtensilsCross }, { name: "Bolo de Cenoura", icon: Cake }].map(item => (
              <div key={item.name} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => handleRecipeClick(item.name)}>
                <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center"><item.icon className="w-6 h-6 text-pink-600" /></div>
                <p className="font-semibold text-gray-700 flex-1">{item.name}</p>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center"><Wine className="mr-2 text-cyan-500" />Cocktails & Bebidas</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => handleFeatureClick('Cocktails')}>Ver Mais <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {[{ name: "Mojito Clássico", icon: Wine }, { name: "Caipirinha Brasileira", icon: Wine }, { name: "Margarita", icon: Wine }].map(item => (
              <div key={item.name} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => handleRecipeClick(item.name)}>
                <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center"><item.icon className="w-6 h-6 text-cyan-600" /></div>
                <p className="font-semibold text-gray-700 flex-1">{item.name}</p>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
