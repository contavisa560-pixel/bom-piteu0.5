// src/components/MealHistoryDisplay.jsx - COMPONENTE PROFISSIONAL
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Clock, Users, ChefHat, Calendar, Star,
    ShoppingCart, Heart, Share2, Timer, CheckCircle,
    Sparkle, Recycle, MessageSquare, Edit, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const MealHistoryDisplay = ({ meal, onBack, user, onToggleFavorite }) => {
    const { t } = useTranslation();
    const [activeStep, setActiveStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);

    if (!meal) return null;

    const getRecipeData = () => {
        const baseData = {
            title: meal.recipeTitle || meal.title || `${t('mealHistoryDisplay.meal')} ${new Date(meal.date).toLocaleDateString('pt-PT')}`,
            description: meal.notes || t('mealHistoryDisplay.mealRegistered', { date: new Date(meal.date).toLocaleDateString('pt-PT', { weekday: 'long' }) }),
            prepTime: meal.prepTime || t('mealHistoryDisplay.notRegistered'),
            servings: meal.servings || t('mealHistoryDisplay.onePerson'),
            difficulty: meal.difficulty || t('mealHistoryDisplay.notSpecified'),
            imageUrl: meal.imageUrl || getDefaultImage(meal.mealType),
            ingredients: meal.ingredients && meal.ingredients.length > 0
                ? meal.ingredients
                : [t('mealHistoryDisplay.ingredientsNotRecorded')],
            instructions: meal.instructions && meal.instructions.length > 0
                ? meal.instructions
                : [
                    t('mealHistoryDisplay.historyEntry'),
                    meal.notes ? t('mealHistoryDisplay.note', { note: meal.notes }) : t('mealHistoryDisplay.askChefToRecreate'),
                    meal.mood ? t('mealHistoryDisplay.moodAfter', { mood: meal.mood }) : '',
                    meal.rating ? t('mealHistoryDisplay.rating', { rating: meal.rating }) : ''
                ].filter(Boolean),
            mealType: meal.mealType,
            date: meal.date,
            mood: meal.mood,
            rating: meal.rating,
            nutritionalInfo: meal.nutritionalInfo,
            isDetailed: meal.isDetailed || false
        };
        return baseData;
    };

    const getDefaultImage = (mealType) => {
        const images = {
            breakfast: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=800&q=80',
            lunch: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
            dinner: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
            snack: 'https://images.unsplash.com/photo-1570913199992-91d07c140e7a?auto=format&fit=crop&w=800&q=80'
        };
        return images[mealType] || 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=800&q=80';
    };

    const recipe = getRecipeData();

    const handleStepComplete = (stepIndex) => {
        if (!completedSteps.includes(stepIndex)) {
            setCompletedSteps([...completedSteps, stepIndex]);
            toast({
                title: t('mealHistoryDisplay.stepCompleted'),
                description: t('mealHistoryDisplay.stepCompletedDesc', { step: stepIndex + 1 })
            });
            if (stepIndex < recipe.instructions.length - 1) {
                setActiveStep(stepIndex + 1);
            }
        }
    };

    const handleToggleFavoriteClick = () => {
        if (onToggleFavorite) {
            const newFavStatus = onToggleFavorite(recipe.title);
            setIsFavorite(newFavStatus);
            toast({
                title: newFavStatus ? t('mealHistoryDisplay.favoriteAdded') : t('mealHistoryDisplay.favoriteRemoved'),
                description: newFavStatus ? t('mealHistoryDisplay.favoriteAddedDesc') : t('mealHistoryDisplay.favoriteRemovedDesc')
            });
        } else {
            setIsFavorite(!isFavorite);
            toast({
                title: isFavorite ? t('mealHistoryDisplay.favoriteRemoved') : t('mealHistoryDisplay.favoriteAdded'),
                description: isFavorite ? t('mealHistoryDisplay.favoriteRemovedDesc') : t('mealHistoryDisplay.favoriteAddedDesc')
            });
        }
    };

    const handleShare = () => {
        const shareText = t('mealHistoryDisplay.shareText', { title: recipe.title });
        if (navigator.share) {
            navigator.share({
                title: recipe.title,
                text: shareText,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(shareText);
            toast({
                title: t('mealHistoryDisplay.copied'),
                description: t('mealHistoryDisplay.copiedDesc')
            });
        }
    };

    const handleEditMeal = () => {
        toast({
            title: t('mealHistoryDisplay.editMeal'),
            description: t('mealHistoryDisplay.editMealDesc'),
            variant: "default"
        });
    };

    const handleDeleteMeal = () => {
        if (window.confirm(t('mealHistoryDisplay.deleteConfirm'))) {
            toast({
                title: t('mealHistoryDisplay.mealDeleted'),
                description: t('mealHistoryDisplay.mealDeletedDesc'),
                variant: "destructive"
            });
            onBack();
        }
    };

    // Zero waste ideas from translations
    const zeroWasteIdeas = t('mealHistoryDisplay.zeroWasteIdeas', { returnObjects: true });

    const getMealTypeText = (type) => {
        const types = {
            breakfast: t('mealHistoryDisplay.mealType.breakfast'),
            lunch: t('mealHistoryDisplay.mealType.lunch'),
            dinner: t('mealHistoryDisplay.mealType.dinner'),
            snack: t('mealHistoryDisplay.mealType.snack')
        };
        return types[type] || t('mealHistoryDisplay.mealType.meal');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto px-4"
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Header com imagem */}
                <div className="relative h-64 md:h-80 bg-gradient-to-r from-purple-500 to-pink-500">
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        className="absolute top-4 left-4 bg-black/30 dark:bg-black/50 text-white hover:bg-black/50 dark:hover:bg-black/70 z-10 rounded-full backdrop-blur-sm"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t('mealHistoryDisplay.backButton')}
                    </Button>

                    <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=800&q=80';
                        }}
                    />

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-6">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <Badge className="bg-white/20 dark:bg-black/40 text-white border-0 backdrop-blur-sm">
                                {getMealTypeText(recipe.mealType)}
                            </Badge>
                            <Badge variant="outline" className="text-white border-white/50 dark:border-white/30 backdrop-blur-sm">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(recipe.date).toLocaleDateString('pt-PT')}
                            </Badge>
                            {recipe.mood && (
                                <Badge variant="outline" className="text-white border-white/50 dark:border-white/30 backdrop-blur-sm">
                                    <span className="text-lg mr-1">{recipe.mood}</span>
                                    {t('mealHistoryDisplay.moodLabel')}
                                </Badge>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">{recipe.title}</h1>
                        <p className="text-white/90 max-w-2xl drop-shadow">{recipe.description}</p>
                    </div>
                </div>

                {/* Conteúdo principal */}
                <div className="p-6">
                    {/* Cabeçalho com informações e ações */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex items-center flex-wrap gap-x-6 gap-y-2">
                            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                                <Clock className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                                <span>{recipe.prepTime}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                                <Users className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                <span>{recipe.servings}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                                <ChefHat className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                                <span>{recipe.difficulty}</span>
                            </div>
                            {recipe.rating && (
                                <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400" />
                                    <span>{recipe.rating}/5</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleToggleFavoriteClick}
                                className={`transition-colors ${isFavorite
                                    ? 'text-red-500 border-red-500 bg-red-50 dark:text-red-400 dark:border-red-400 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                <Heart className={`h-4 w-4 mr-2 transition-transform ${isFavorite ? 'fill-current' : ''}`} />
                                {isFavorite ? t('mealHistoryDisplay.favoritedButton') : t('mealHistoryDisplay.favoriteButton')}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShare}
                                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Share2 className="h-4 w-4 mr-2" /> {t('mealHistoryDisplay.shareButton')}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleEditMeal}
                                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Edit className="h-4 w-4 mr-2" /> {t('mealHistoryDisplay.editButton')}
                            </Button>
                        </div>
                    </div>

                    {/* Layout em grade */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Coluna esquerda: Informações detalhadas */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Ingredientes */}
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t('mealHistoryDisplay.ingredientsTitle')}</h2>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-green-600 border-green-600 hover:bg-green-50 dark:text-green-400 dark:border-green-400 dark:hover:bg-green-900/20"
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-2" /> {t('mealHistoryDisplay.buyAgainButton')}
                                    </Button>
                                </div>

                                {recipe.ingredients[0] === t('mealHistoryDisplay.ingredientsNotRecorded') ? (
                                    <div className="text-center py-4">
                                        <ChefHat className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                        <p className="text-gray-600 dark:text-gray-400 mb-3">{t('mealHistoryDisplay.noIngredientsMessage')}</p>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if (onToggleFavorite) {
                                                    onToggleFavorite({
                                                        type: 'chat',
                                                        message: t('mealHistoryDisplay.askChefMessage', { title: recipe.title, date: new Date(recipe.date).toLocaleDateString('pt-PT') })
                                                    });
                                                }
                                            }}
                                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <MessageSquare className="mr-2 h-4 w-4" />
                                            {t('mealHistoryDisplay.askChefButton')}
                                        </Button>
                                    </div>
                                ) : (
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
                                )}
                            </div>

                            {/* Informação Nutricional */}
                            {recipe.nutritionalInfo && (
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                                        <Sparkle className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                                        {t('mealHistoryDisplay.nutritionalInfoTitle')}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {recipe.nutritionalInfo.calories && (
                                            <div className="bg-white/50 dark:bg-gray-700/50 p-3 rounded-lg">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{t('mealHistoryDisplay.calories')}</p>
                                                <p className="font-semibold text-lg text-gray-900 dark:text-white">{recipe.nutritionalInfo.calories} kcal</p>
                                            </div>
                                        )}
                                        {recipe.nutritionalInfo.protein && (
                                            <div className="bg-white/50 dark:bg-gray-700/50 p-3 rounded-lg">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{t('mealHistoryDisplay.protein')}</p>
                                                <p className="font-semibold text-lg text-gray-900 dark:text-white">{recipe.nutritionalInfo.protein}g</p>
                                            </div>
                                        )}
                                        {recipe.nutritionalInfo.carbs && (
                                            <div className="bg-white/50 dark:bg-gray-700/50 p-3 rounded-lg">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{t('mealHistoryDisplay.carbs')}</p>
                                                <p className="font-semibold text-lg text-gray-900 dark:text-white">{recipe.nutritionalInfo.carbs}g</p>
                                            </div>
                                        )}
                                        {recipe.nutritionalInfo.fat && (
                                            <div className="bg-white/50 dark:bg-gray-700/50 p-3 rounded-lg">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{t('mealHistoryDisplay.fat')}</p>
                                                <p className="font-semibold text-lg text-gray-900 dark:text-white">{recipe.nutritionalInfo.fat}g</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Dicas de Zero Desperdício */}
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                                    <Recycle className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                                    {t('mealHistoryDisplay.zeroWasteTitle')}
                                </h3>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{t('mealHistoryDisplay.zeroWasteSubtitle')}</p>
                                <ul className="space-y-3">
                                    {zeroWasteIdeas.slice(0, 2).map((item, index) => (
                                        <li key={index} className="bg-white/50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <p className="font-medium text-gray-800 dark:text-white">{item.title}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.idea}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Coluna direita: Modo de "Preparação" ou Observações */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                                    {recipe.instructions.length > 0 && recipe.instructions[0] !== t('mealHistoryDisplay.historyEntry')
                                        ? t('mealHistoryDisplay.preparationMode')
                                        : t('mealHistoryDisplay.mealDetails')}
                                </h2>

                                {recipe.isDetailed && (
                                    <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-0">
                                        <Sparkle className="h-3 w-3 mr-1" />
                                        {t('mealHistoryDisplay.detailedRecordBadge')}
                                    </Badge>
                                )}
                            </div>

                            <div className="space-y-4">
                                {recipe.instructions.map((instruction, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`border rounded-xl p-4 transition-all duration-300 ${completedSteps.includes(index)
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                            : activeStep === index
                                                ? 'bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border-orange-300 dark:border-orange-700 shadow-md'
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
                                                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 dark:from-orange-600 dark:to-pink-600 text-white'
                                                        : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                                                }
        `}>
                                                {completedSteps.includes(index) ? (
                                                    <CheckCircle size={20} />
                                                ) : (
                                                    index + 1
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-800 dark:text-gray-200 mb-3">{instruction}</p>
                                                <div className="flex items-center space-x-4">
                                                    {activeStep === index && !completedSteps.includes(index) && instruction.includes('Passo') && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleStepComplete(index)}
                                                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" /> {t('mealHistoryDisplay.completeStepButton')}
                                                        </Button>
                                                    )}

                                                    {activeStep !== index && !completedSteps.includes(index) && instruction.includes('Passo') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setActiveStep(index)}
                                                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            <Timer className="h-4 w-4 mr-2" /> {t('mealHistoryDisplay.focusStepButton')}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Botões de ação na parte inferior */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Button
                                        onClick={() => {
                                            if (onToggleFavorite) {
                                                onToggleFavorite({
                                                    type: 'chat',
                                                    title: recipe.title,
                                                    message: t('mealHistoryDisplay.chatMessage', { title: recipe.title })
                                                });
                                            }
                                        }}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                    >
                                        <MessageSquare className="mr-2 h-5 w-5" />
                                        {t('mealHistoryDisplay.chatWithChefButton')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleShare}
                                        className="border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    >
                                        <Share2 className="mr-2 h-5 w-5" />
                                        {t('mealHistoryDisplay.shareMealButton')}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={handleDeleteMeal}
                                        className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 className="mr-2 h-5 w-5" />
                                        {t('mealHistoryDisplay.deleteFromHistoryButton')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MealHistoryDisplay;