// src/components/ReceitaDetalheModal.jsx - VERSÃO CORRIGIDA
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Clock, Users, ChefHat, Calendar, Star,
    ShoppingCart, Heart, Share2, Timer, CheckCircle,
    Sparkle, Recycle, MessageSquare, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const ReceitaDetalheModal = ({ receita, onClose, onCozinhar, user }) => {
    const { t } = useTranslation();
    const [activeStep, setActiveStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);

    if (!receita) return null;

    // Estruturar dados da receita para exibição
    const recipeData = {
        title: receita.notes?.[0]?.content || t('receitaDetalheModal.recipe'),
        description: t('receitaDetalheModal.mealRegistered', { date: new Date(receita.createdAt).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }),
        prepTime: receita.prepTime || '30-45 min',
        servings: receita.quantity || t('receitaDetalheModal.onePerson'),
        difficulty: receita.difficulty || t('receitaDetalheModal.medium'),
        imageUrl: receita.imageUrl && receita.imageUrl !== '/default-recipe.jpg'
            ? receita.imageUrl
            : getDefaultImage(receita.mealType),
        ingredients: receita.ingredients || [t('receitaDetalheModal.ingredientsNotSpecified')],
        instructions: receita.steps || [
            t('receitaDetalheModal.noInstructions'),
            t('receitaDetalheModal.startCookingHint')
        ],
        mealType: receita.mealType,
        date: receita.createdAt,
        mood: receita.mood,
        rating: receita.rating,
        nutritionalInfo: receita.nutritionalInfo,
        isDetailed: receita.isDetailed || false
    };

    // Imagem padrão baseada no tipo de refeição
    function getDefaultImage(mealType) {
        const images = {
            breakfast: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=800&q=80',
            lunch: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80',
            dinner: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
            snack: 'https://images.unsplash.com/photo-1570913199992-91d07c140e7a?auto=format&fit=crop&w=800&q=80'
        };
        return images[mealType] || 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=800&q=80';
    }

    // Traduzir tipo de refeição
    const getMealTypeText = (type) => {
        const types = {
            breakfast: t('receitaDetalheModal.mealTypes.breakfast'),
            lunch: t('receitaDetalheModal.mealTypes.lunch'),
            dinner: t('receitaDetalheModal.mealTypes.dinner'),
            snack: t('receitaDetalheModal.mealTypes.snack')
        };
        return types[type] || t('receitaDetalheModal.mealTypes.meal');
    };

    const handleStepComplete = (stepIndex) => {
        if (!completedSteps.includes(stepIndex)) {
            setCompletedSteps([...completedSteps, stepIndex]);
            toast({
                title: t('receitaDetalheModal.stepCompleted'),
                description: t('receitaDetalheModal.stepCompletedDesc', { step: stepIndex + 1 })
            });
            if (stepIndex < recipeData.instructions.length - 1) {
                setActiveStep(stepIndex + 1);
            }
        }
    };

    const handleToggleFavorite = () => {
        setIsFavorite(!isFavorite);
        toast({
            title: isFavorite ? t('receitaDetalheModal.favoriteRemoved') : t('receitaDetalheModal.favoriteAdded'),
            description: isFavorite ? t('receitaDetalheModal.favoriteRemovedDesc') : t('receitaDetalheModal.favoriteAddedDesc')
        });
    };

    const handleShare = () => {
        const shareText = t('receitaDetalheModal.shareText', { title: recipeData.title });
        if (navigator.share) {
            navigator.share({ title: recipeData.title, text: shareText, url: window.location.href });
        } else {
            navigator.clipboard.writeText(shareText);
            toast({ title: t('receitaDetalheModal.copied'), description: t('receitaDetalheModal.copiedDesc') });
        }
    };

    // Ideias de zero desperdício
    const zeroWasteIdeas = [
        { title: t('receitaDetalheModal.zeroWaste1.title'), idea: t('receitaDetalheModal.zeroWaste1.idea') },
        { title: t('receitaDetalheModal.zeroWaste2.title'), idea: t('receitaDetalheModal.zeroWaste2.idea') },
    ];

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent
                className="
        max-w-[1200px]
        w-[96vw]
        max-h-[92vh]
        overflow-hidden
        p-0
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
    "
            >

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
                >
                    {/* Header com imagem */}
                    <div className="relative h-44 sm:h-52 md:h-56 lg:h-60 bg-gradient-to-r from-purple-500 to-pink-500">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="absolute top-3 left-3 bg-black/30 dark:bg-black/50 text-white hover:bg-black/50 dark:hover:bg-black/70 z-10 rounded-full h-8 px-3 backdrop-blur-sm"
                        >
                            <ArrowLeft className="h-3 w-3 mr-1" />
                            <span className="text-xs">{t('common.back')}</span>
                        </Button>

                        <img
                            src={recipeData.imageUrl}
                            alt={recipeData.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&w=800&q=80';
                            }}
                        />

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <Badge className="bg-white/20 dark:bg-black/40 text-white border-0 text-xs backdrop-blur-sm">
                                    {getMealTypeText(recipeData.mealType)}
                                </Badge>
                                <Badge variant="outline" className="text-white border-white/50 dark:border-white/30 text-xs backdrop-blur-sm">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(recipeData.date).toLocaleDateString('pt-PT')}
                                </Badge>
                                {recipeData.mood && (
                                    <Badge variant="outline" className="text-white border-white/50 dark:border-white/30 text-xs backdrop-blur-sm">
                                        <span className="text-sm mr-1">{recipeData.mood}</span>
                                        {t('receitaDetalheModal.mood')}
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 line-clamp-1 drop-shadow-lg">{recipeData.title}</h1>
                            <p className="text-white/80 text-xs sm:text-sm max-w-2xl line-clamp-1 drop-shadow">{recipeData.description}</p>
                        </div>
                    </div>

                    {/* Conteúdo principal */}
                    <div className="p-4 sm:p-5 md:p-6 overflow-y-auto max-h-[calc(92vh-240px)]">
                        {/* Botão COZINHAR e informações em linha */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                            <Button
                                onClick={() => onCozinhar(receita)}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-5 py-3 text-sm rounded-full shadow-lg order-2 sm:order-1"
                            >
                                <ChefHat className="mr-2 h-4 w-4" />
                                {t('receitaDetalheModal.cookNow')}
                            </Button>

                            <div className="flex items-center justify-between sm:justify-end gap-3 order-1 sm:order-2">
                                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                                    <div className="flex items-center space-x-1">
                                        <Clock className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                                        <span className="text-xs">{recipeData.prepTime}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Users className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                        <span className="text-xs">{recipeData.servings}</span>
                                    </div>
                                    {recipeData.rating && (
                                        <div className="flex items-center space-x-1">
                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400" />
                                            <span className="text-xs">{recipeData.rating}/5</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleToggleFavorite}
                                        className={`h-8 w-8 ${isFavorite ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                    >
                                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleShare}
                                        className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                    >
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Layout em grid para conteúdo principal */}
                        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
                            {/* Coluna esquerda - Ingredientes e Zero Desperdício */}
                            <div className="md:col-span-1 space-y-4">
                                {/* Ingredientes */}
                                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                                    <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                                        <ShoppingCart className="h-4 w-4 mr-2 text-orange-600 dark:text-orange-400" />
                                        {t('receitaDetalheModal.ingredients')}
                                    </h2>
                                    <ul className="space-y-2">
                                        {recipeData.ingredients.map((ing, index) => (
                                            <li key={index} className="flex items-start space-x-2">
                                                <div className="w-1.5 h-1.5 bg-orange-400 dark:bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{ing}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Zero Desperdício */}
                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                                        <Recycle className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                                        {t('receitaDetalheModal.zeroWaste')}
                                    </h3>
                                    <ul className="space-y-2">
                                        {zeroWasteIdeas.map((item, index) => (
                                            <li key={index} className="bg-white/50 dark:bg-gray-700/50 p-2 rounded-lg">
                                                <p className="font-medium text-xs text-gray-800 dark:text-white">{item.title}</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{item.idea}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Coluna direita - Modo de Preparo */}
                            <div className="md:col-span-2">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3">{t('receitaDetalheModal.preparationMode')}</h2>
                                <div className="space-y-2">
                                    {recipeData.instructions.map((instruction, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`border rounded-lg p-3 transition-all duration-300 ${completedSteps.includes(index)
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                                : activeStep === index
                                                    ? 'bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border-orange-300 dark:border-orange-700'
                                                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                                                }`}
                                        >
                                            <div className="flex items-start space-x-2">
                                                <div className={`
            w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold 
            flex-shrink-0 transition-colors mt-0.5
            ${completedSteps.includes(index)
                                                        ? 'bg-green-500 dark:bg-green-600 text-white'
                                                        : activeStep === index
                                                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 dark:from-orange-600 dark:to-pink-600 text-white'
                                                            : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                                                    }
        `}>
                                                    {completedSteps.includes(index) ? (
                                                        <CheckCircle size={12} />
                                                    ) : (
                                                        index + 1
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200">{instruction}</p>
                                                    {activeStep === index && !completedSteps.includes(index) && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleStepComplete(index)}
                                                            className="mt-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-7 px-3 text-xs"
                                                        >
                                                            <CheckCircle className="h-3 w-3 mr-1" /> {t('receitaDetalheModal.complete')}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Botão secundário */}
                                <div className="mt-6 flex justify-end">
                                    <Button
                                        onClick={() => onCozinhar(receita)}
                                        variant="outline"
                                        className="border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 text-sm px-5 py-2"
                                    >
                                        <ChefHat className="mr-2 h-4 w-4" />
                                        {t('receitaDetalheModal.startStepByStep')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

export default ReceitaDetalheModal;