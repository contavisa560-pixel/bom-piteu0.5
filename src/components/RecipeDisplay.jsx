
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  ChefHat, 
  ShoppingCart, 
  Heart,
  Share2,
  Timer,
  CheckCircle,
  Sparkle,
  Recycle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const RecipeDisplay = ({ recipe, onBack, user, onToggleFavorite }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (user && user.favorites) {
      setIsFavorite(user.favorites.includes(recipe.title));
    }
  }, [user, recipe.title]);

  const handleStepComplete = (stepIndex) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
      toast({
        title: "Passo Concluído! ✅",
        description: `Excelente trabalho! Passo ${stepIndex + 1} marcado como completo.`
      });
      if (stepIndex < recipe.instructions.length - 1) {
        setActiveStep(stepIndex + 1);
      }
    }
  };

  const handleToggleFavoriteClick = () => {
    const newFavStatus = onToggleFavorite(recipe.title);
    setIsFavorite(newFavStatus);
    toast({
      title: newFavStatus ? "Adicionado aos Favoritos! ❤️" : "Removido dos Favoritos",
      description: newFavStatus ? "Esta receita foi guardada no seu perfil." : "Receita removida da sua lista."
    });
  };

  const handleShare = () => {
    toast({
      title: "🚧 Funcionalidade em breve!",
      description: "Poderás partilhar as tuas criações nas redes sociais."
    });
  };

  const handleBuyIngredients = () => {
    toast({
      title: "🚧 Loja a caminho!",
      description: "Em breve poderás comprar ingredientes diretamente dos nossos parceiros."
    });
  };

  const zeroWasteIdeas = [
    { title: "Cascas de Batata", idea: "Transforma em chips crocantes! Lava bem, tempera com azeite e sal, e assa até dourar." },
    { title: "Cascas de Cebola", idea: "Não deites fora! Usa para fazer um caldo de legumes aromático e cheio de nutrientes." },
    { title: "Talos de Brócolos", idea: "Pica finamente e salteia com alho, ou usa em sopas e purés. São deliciosos!" },
    { title: "Sementes de Abóbora", idea: "Lava, seca e tosta no forno com um pouco de sal. Um snack saudável e viciante!" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="relative h-64 md:h-80 bg-gradient-to-r from-orange-400 to-red-500">
          <Button
            variant="ghost"
            onClick={onBack}
            className="absolute top-4 left-4 bg-black/30 text-white hover:bg-black/50 z-10 rounded-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <img class="w-full h-full object-cover" alt={recipe.title} src="https://images.unsplash.com/photo-1676436293942-99438c6058be" />
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{recipe.title}</h1>
            <p className="text-white/90 max-w-2xl">{recipe.description}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center flex-wrap gap-x-6 gap-y-2">
              <div className="flex items-center space-x-2 text-gray-700"><Clock className="h-5 w-5 text-orange-500" /><span>{recipe.prepTime}</span></div>
              <div className="flex items-center space-x-2 text-gray-700"><Users className="h-5 w-5 text-blue-500" /><span>{recipe.servings} pessoas</span></div>
              <div className="flex items-center space-x-2 text-gray-700"><ChefHat className="h-5 w-5 text-purple-500" /><span>{recipe.difficulty}</span></div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleToggleFavoriteClick} className={`transition-colors ${isFavorite ? 'text-red-500 border-red-500 bg-red-50' : ''}`}>
                <Heart className={`h-4 w-4 mr-2 transition-transform ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Favorito' : 'Favoritar'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" /> Partilhar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-orange-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Ingredientes</h2>
                  <Button variant="outline" size="sm" onClick={handleBuyIngredients} className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">
                    <ShoppingCart className="h-4 w-4 mr-2" /> Comprar
                  </Button>
                </div>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <motion.li key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-1 flex-shrink-0"></div>
                      <span className="text-gray-700">{ingredient}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center"><Recycle className="h-5 w-5 mr-2 text-green-600"/>Zero Desperdício</h3>
                <p className="text-sm text-gray-700 mb-4">O que fazer com as sobras? O Chef IA sugere:</p>
                <ul className="space-y-2">
                  {zeroWasteIdeas.slice(0,2).map((item, index) => (
                     <li key={index} className="text-sm text-gray-600"><strong>{item.title}:</strong> {item.idea}</li>
                  ))}
                </ul>
              </div>

              {recipe.decoration && (
                <div className="bg-purple-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center"><Sparkle className="h-5 w-5 mr-2 text-purple-500"/>Decoração do Prato</h3>
                  <p className="text-sm text-gray-700">{recipe.decoration}</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Modo de Preparação</h2>
              <div className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className={`border rounded-xl p-4 transition-all duration-300 ${completedSteps.includes(index) ? 'bg-green-50 border-green-200' : activeStep === index ? 'bg-orange-50 border-orange-300 shadow-md' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-start space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-colors ${completedSteps.includes(index) ? 'bg-green-500 text-white' : activeStep === index ? 'bg-orange-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                        {completedSteps.includes(index) ? <CheckCircle size={20} /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 mb-3">{instruction}</p>
                        <div className="flex items-center space-x-4">
                          {activeStep === index && !completedSteps.includes(index) && (
                            <Button size="sm" onClick={() => handleStepComplete(index)} className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-2" /> Concluir Passo
                            </Button>
                          )}
                          {activeStep !== index && !completedSteps.includes(index) && (
                            <Button variant="outline" size="sm" onClick={() => setActiveStep(index)}>
                              <Timer className="h-4 w-4 mr-2" /> Focar neste passo
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecipeDisplay;
