
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { internationalRecipes } from '@/data/internationalRecipes';

const InternationalRecipes = ({ onNavigate, onStartChat }) => {
  const countries = [...new Set(internationalRecipes.map(r => r.pais))].map(country => {
    const recipe = internationalRecipes.find(r => r.pais === country);
    return { name: country, recipeExample: recipe.nome_receita };
  });

  const getCountryFlag = (countryName) => {
    const flags = {
        'Itália': '🇮🇹', 'Japão': '🇯🇵', 'México': '🇲🇽', 'França': '🇫🇷', 'EUA': '🇺🇸',
        'Espanha': '🇪🇸', 'Brasil': '🇧🇷', 'Portugal': '🇵🇹', 'Índia': '🇮🇳', 'Tailândia': '🇹🇭',
        'África do Sul': '🇿🇦', 'Nigéria': '🇳🇬', 'China': '🇨🇳', 'Áustria': '🇦🇹', 'Grécia': '🇬🇷',
        'Hungria': '🇭🇺', 'Peru': '🇵🇪', 'Coreia do Sul': '🇰🇷', 'Reino Unido': '🇬🇧', 'Canadá': '🇨🇦',
        'Colômbia/Venezuela': '🇨🇴', 'Marrocos': '🇲🇦', 'Vietname': '🇻🇳', 'Ucrânia': '🇺🇦',
        'Argélia': '🇩🇿', 'Suécia': '🇸🇪', 'Angola': '🇦🇴'
    };
    return flags[countryName] || '🏳️';
  };

  const handleCountryClick = (country) => {
    onStartChat({ title: `Receitas de ${country}`, query: `Quero receitas de ${country}` });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Button variant="ghost" onClick={() => onNavigate('dashboard')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Início
      </Button>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">Viagem Gastronómica</h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Clica num país para explorar os seus sabores e descobrir receitas autênticas.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {countries.map(({ name, recipeExample }) => (
          <motion.div key={name} whileHover={{ y: -5, scale: 1.05 }}>
            <Card
              className="text-center p-4 cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => handleCountryClick(name)}
            >
              <CardContent className="flex flex-col items-center justify-center p-0">
                <div className="text-6xl mb-4">{getCountryFlag(name)}</div>
                <h3 className="font-bold text-lg text-gray-800">{name}</h3>
                <p className="text-xs text-gray-500">{recipeExample}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default InternationalRecipes;
  