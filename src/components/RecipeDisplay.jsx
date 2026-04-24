import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, Users, ChefHat, ShoppingCart, Heart, Share2, Timer, CheckCircle, Sparkle, Recycle, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const RecipeDisplay = ({ recipe, onBack, user, onToggleFavorite }) => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  const hasCompleteData = (recipe) => {
    return recipe && recipe.ingredients && recipe.instructions &&
      recipe.ingredients.length > 0 && recipe.instructions.length > 0;
  };
  
  useEffect(() => {
    if (user && user.favorites) {
      setIsFavorite(user.favorites.includes(recipe.title));
    }
  }, [user, recipe.title]);

  const handleStepComplete = (stepIndex) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
      toast({
        title: t('recipeDisplay.stepCompleted'),
        description: t('recipeDisplay.stepCompletedDesc', { step: stepIndex + 1 })
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
      title: newFavStatus ? t('recipeDisplay.favoriteAdded') : t('recipeDisplay.favoriteRemoved'),
      description: newFavStatus ? t('recipeDisplay.favoriteAddedDesc') : t('recipeDisplay.favoriteRemovedDesc')
    });
  };

  const handleShare = () => {
    toast({
      title: t('recipeDisplay.comingSoon'),
      description: t('recipeDisplay.comingSoonDesc')
    });
  };

  const handleBuyIngredients = () => {
    toast({
      title: t('recipeDisplay.comingSoon'),
      description: t('recipeDisplay.comingSoonDesc')
    });
  };

  const zeroWasteIdeas = [
    { title: t('recipeDisplay.zeroWaste1.title'), idea: t('recipeDisplay.zeroWaste1.idea') },
    { title: t('recipeDisplay.zeroWaste2.title'), idea: t('recipeDisplay.zeroWaste2.idea') },
    { title: t('recipeDisplay.zeroWaste3.title'), idea: t('recipeDisplay.zeroWaste3.idea') },
    { title: t('recipeDisplay.zeroWaste4.title'), idea: t('recipeDisplay.zeroWaste4.idea') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto px-4"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="relative h-64 md:h-80 bg-gradient-to-r from-orange-400 to-red-500">
          <Button
            variant="ghost"
            onClick={onBack}
            className="absolute top-4 left-4 bg-black/30 dark:bg-black/50 text-white hover:bg-black/50 dark:hover:bg-black/70 z-10 rounded-full backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>

          <img className="w-full h-full object-cover" alt={recipe.title} src="https://images.unsplash.com/photo-1676436293942-99438c6058be" />

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">{recipe.title}</h1>
            <p className="text-white/90 max-w-2xl drop-shadow">{recipe.description}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <Clock className="h-5 w-5 text-orange-500 dark:text-orange-400" />
              <span>{recipe.prepTime}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <Users className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <span>{t('recipeDisplay.servings', { count: recipe.servings })}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <ChefHat className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              <span>{recipe.difficulty}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleFavoriteClick}
                className={`transition-colors ${isFavorite
                  ? 'text-red-500 border-red-500 bg-red-50 dark:text-red-400 dark:border-red-400 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                <Heart className={`h-4 w-4 mr-2 transition-transform ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? t('recipeDisplay.favorited') : t('recipeDisplay.favorite')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Share2 className="h-4 w-4 mr-2" /> {t('recipeDisplay.share')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              {hasCompleteData(recipe) ? (
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('recipeDisplay.ingredients')}</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBuyIngredients}
                      className="text-green-600 border-green-600 hover:bg-green-50 dark:text-green-400 dark:border-green-400 dark:hover:bg-green-900/20"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" /> {t('recipeDisplay.buy')}
                    </Button>
                  </div>
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ingredient, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-2 h-2 bg-orange-400 dark:bg-orange-500 rounded-full mt-1 flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300">{ingredient}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center mb-3">
                    <div className="bg-yellow-100 dark:bg-yellow-800/30 p-2 rounded-lg mr-3">
                      <ChefHat className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">{t('recipeDisplay.incompleteData')}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('recipeDisplay.incompleteDataDesc')}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => window.alert("Use o MealHistoryDisplay para refeições do histórico")}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {t('recipeDisplay.askChef')}
                  </Button>
                </div>
              )}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                  <Recycle className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  {t('recipeDisplay.zeroWaste')}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{t('recipeDisplay.zeroWasteSubtitle')}</p>
                <ul className="space-y-2">
                  {zeroWasteIdeas.slice(0, 2).map((item, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                      <strong className="text-gray-800 dark:text-white">{item.title}:</strong> {item.idea}
                    </li>
                  ))}
                </ul>
              </div>

              {recipe.decoration && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                    <Sparkle className="h-5 w-5 mr-2 text-purple-500 dark:text-purple-400" />
                    {t('recipeDisplay.plateDecoration')}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{recipe.decoration}</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">{t('recipeDisplay.preparationMode')}</h2>
              <div className="space-y-4">
                {recipe?.instructions?.map((instruction, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border rounded-xl p-4 transition-all duration-300 ${completedSteps.includes(index)
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : activeStep === index
                          ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 shadow-md'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold 
            flex-shrink-0 transition-colors
            ${completedSteps.includes(index)
                          ? 'bg-green-500 dark:bg-green-600 text-white'
                          : activeStep === index
                            ? 'bg-orange-500 dark:bg-orange-600 text-white'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                        }
        `}>
                        {completedSteps.includes(index) ? <CheckCircle size={20} /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 dark:text-gray-200 mb-3">{instruction}</p>
                        <div className="flex items-center space-x-4">
                          {activeStep === index && !completedSteps.includes(index) && (
                            <Button
                              size="sm"
                              onClick={() => handleStepComplete(index)}
                              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" /> {t('recipeDisplay.completeStep')}
                            </Button>
                          )}
                          {activeStep !== index && !completedSteps.includes(index) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveStep(index)}
                              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Timer className="h-4 w-4 mr-2" /> {t('recipeDisplay.focusStep')}
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