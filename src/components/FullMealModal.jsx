// src/components/FullMealModal.jsx
import React, { useState, useRef } from 'react';
import {
  X, ChefHat, Plus, Minus, Smile, Star,
  Carrot, Calendar, Camera, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const FullMealModal = ({ isOpen, onClose, onSave, userId }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    mealType: 'lunch',
    date: new Date().toISOString(),
    time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    ingredients: [''],
    notes: '',
    mood: '😊',
    rating: 3,
    estimatedCalories: '',
    estimatedProtein: '',
    estimatedCarbs: '',
    estimatedFat: '',
    imageFile: null,
    imagePreview: null
  });

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, '']
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const moods = ['😊', '😋', '😴', '🤢', '🤤', '😍', '🥱', '😎'];

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('fullMealModal.errors.invalidFormatTitle'),
          description: t('fullMealModal.errors.invalidFormatDesc'),
          variant: "destructive"
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('fullMealModal.errors.fileTooLargeTitle'),
          description: t('fullMealModal.errors.fileTooLargeDesc'),
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imageFile: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      imageFile: null,
      imagePreview: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();

      formDataToSend.append('title', formData.title);
      formDataToSend.append('mealType', formData.mealType);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('notes', formData.notes);
      formDataToSend.append('mood', formData.mood);
      formDataToSend.append('rating', formData.rating);
      formDataToSend.append('isDetailed', 'true');

      const filteredIngredients = formData.ingredients.filter(ing => ing.trim() !== '');
      filteredIngredients.forEach((ing, index) => {
        formDataToSend.append(`ingredients[${index}]`, ing);
      });

      const nutritionalInfo = {
        calories: formData.estimatedCalories || '0',
        protein: formData.estimatedProtein || '0g',
        carbs: formData.estimatedCarbs || '0g',
        fat: formData.estimatedFat || '0g'
      };
      formDataToSend.append('nutritionalInfo', JSON.stringify(nutritionalInfo));

      if (formData.imageFile) {
        formDataToSend.append('image', formData.imageFile);
      }

      await onSave(formDataToSend, true);

      setFormData({
        title: '',
        mealType: 'lunch',
        date: new Date().toISOString(),
        time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        ingredients: [''],
        notes: '',
        mood: '😊',
        rating: 3,
        estimatedCalories: '',
        estimatedProtein: '',
        estimatedCarbs: '',
        estimatedFat: '',
        imageFile: null,
        imagePreview: null
      });
      setStep(1);
      onClose();
    } catch (error) {
      toast({
        title: t('fullMealModal.errors.saveErrorTitle'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      mealType: 'lunch',
      date: new Date().toISOString(),
      time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      ingredients: [''],
      notes: '',
      mood: '😊',
      rating: 3,
      estimatedCalories: '',
      estimatedProtein: '',
      estimatedCarbs: '',
      estimatedFat: '',
      imageFile: null,
      imagePreview: null
    });
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('fullMealModal.title')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('fullMealModal.subtitle')}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Step 1: Informações básicas + Foto */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">{t('fullMealModal.mealNameLabel')} *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('fullMealModal.mealNamePlaceholder')}
                  className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mealType">{t('fullMealModal.mealTypeLabel')}</Label>
                  <Select value={formData.mealType} onValueChange={(value) => setFormData({ ...formData, mealType: value })}>
                    <SelectTrigger className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem value="breakfast" className="text-gray-900 dark:text-white dark:focus:bg-gray-700">{t('fullMealModal.mealTypes.breakfast')}</SelectItem>
                      <SelectItem value="lunch" className="text-gray-900 dark:text-white dark:focus:bg-gray-700">{t('fullMealModal.mealTypes.lunch')}</SelectItem>
                      <SelectItem value="dinner" className="text-gray-900 dark:text-white dark:focus:bg-gray-700">{t('fullMealModal.mealTypes.dinner')}</SelectItem>
                      <SelectItem value="snack" className="text-gray-900 dark:text-white dark:focus:bg-gray-700">{t('fullMealModal.mealTypes.snack')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="time">{t('fullMealModal.timeLabel')}</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">{t('fullMealModal.notesLabel')}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('fullMealModal.notesPlaceholder')}
                  rows={2}
                  className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div>
                <Label>{t('fullMealModal.imageLabel')}</Label>
                <div className="mt-2">
                  {formData.imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={formData.imagePreview}
                        alt={t('fullMealModal.previewAlt')}
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        {t('fullMealModal.takePhotoButton')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        {t('fullMealModal.galleryButton')}
                      </Button>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {t('fullMealModal.imageHelpText')}
                  </p>
                </div>
              </div>

              <Button onClick={() => setStep(2)} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                {t('fullMealModal.continueToIngredients')}
                <Plus className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Ingredientes */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>{t('fullMealModal.ingredientsLabel')} *</Label>
                <div className="space-y-3 mt-2">
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={ingredient}
                        onChange={(e) => handleIngredientChange(index, e.target.value)}
                        placeholder={t('fullMealModal.ingredientPlaceholder', { number: index + 1 })}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                      {formData.ingredients.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeIngredient(index)}
                          className="px-3 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addIngredient}
                    className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('fullMealModal.addIngredientButton')}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calories">{t('fullMealModal.caloriesLabel')}</Label>
                  <Input
                    id="calories"
                    value={formData.estimatedCalories}
                    onChange={(e) => setFormData({ ...formData, estimatedCalories: e.target.value })}
                    placeholder={t('fullMealModal.caloriesPlaceholder')}
                    className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="protein">{t('fullMealModal.proteinLabel')}</Label>
                  <Input
                    id="protein"
                    value={formData.estimatedProtein}
                    onChange={(e) => setFormData({ ...formData, estimatedProtein: e.target.value })}
                    placeholder={t('fullMealModal.proteinPlaceholder')}
                    className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('fullMealModal.backButton')}
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {t('fullMealModal.continueToRating')}
                  <Plus className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Avaliação */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label>{t('fullMealModal.moodLabel')}</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {moods.map((mood) => (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => setFormData({ ...formData, mood })}
                      className={`text-2xl p-3 rounded-lg transition-colors ${formData.mood === mood
                        ? 'bg-yellow-100 dark:bg-yellow-900/50 border-2 border-yellow-400 dark:border-yellow-600'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>{t('fullMealModal.ratingLabel')}</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1"
                    >
                      <Star className={`h-8 w-8 transition-colors ${star <= formData.rating
                        ? 'text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                        }`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t('fullMealModal.backButton')}
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  disabled={loading || !formData.title.trim()}
                >
                  {loading ? t('fullMealModal.saving') : t('fullMealModal.submitButton')}
                  <ChefHat className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FullMealModal;