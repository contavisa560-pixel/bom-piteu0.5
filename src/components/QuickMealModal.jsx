// src/components/QuickMealModal.jsx
import React, { useState, useRef } from 'react';
import { X, Plus, Camera, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const QuickMealModal = ({ isOpen, onClose, onSave, userId }) => {
  const { t } = useTranslation();
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState('lunch');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('quickMealModal.errors.invalidFormatTitle'),
          description: t('quickMealModal.errors.invalidFormatDesc'),
          variant: "destructive"
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('quickMealModal.errors.fileTooLargeTitle'),
          description: t('quickMealModal.errors.fileTooLargeDesc'),
          variant: "destructive"
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!mealName.trim()) {
      toast({
        title: t('quickMealModal.errors.requiredFieldTitle'),
        description: t('quickMealModal.errors.requiredFieldDesc'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', mealName);
      formData.append('mealType', mealType);
      formData.append('date', new Date().toISOString());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await onSave(formData, true);

      setMealName('');
      setMealType('lunch');
      setImageFile(null);
      setImagePreview(null);
      onClose();
    } catch (error) {
      toast({
        title: t('quickMealModal.errors.saveErrorTitle'),
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const suggestedMeals = [
    t('quickMealModal.suggestions.chickenSalad'),
    t('quickMealModal.suggestions.vegetableSoup'),
    t('quickMealModal.suggestions.grilledFish'),
    t('quickMealModal.suggestions.riceAndBeans'),
    t('quickMealModal.suggestions.vegetableOmelette'),
    t('quickMealModal.suggestions.yogurtWithFruits')
  ];

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('quickMealModal.title')}</h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Nome da refeição */}
            <div>
              <Label htmlFor="mealName" className="text-gray-700 dark:text-gray-300">
                {t('quickMealModal.mealNameLabel')} *
              </Label>
              <Input
                id="mealName"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder={t('quickMealModal.mealNamePlaceholder')}
                className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />

              {/* Sugestões rápidas */}
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestedMeals.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setMealName(suggestion)}
                    className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo de refeição */}
            <div>
              <Label htmlFor="mealType" className="text-gray-700 dark:text-gray-300">
                {t('quickMealModal.mealTypeLabel')}
              </Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectItem value="breakfast" className="text-gray-900 dark:text-white dark:focus:bg-gray-700">{t('quickMealModal.mealTypes.breakfast')}</SelectItem>
                  <SelectItem value="lunch" className="text-gray-900 dark:text-white dark:focus:bg-gray-700">{t('quickMealModal.mealTypes.lunch')}</SelectItem>
                  <SelectItem value="dinner" className="text-gray-900 dark:text-white dark:focus:bg-gray-700">{t('quickMealModal.mealTypes.dinner')}</SelectItem>
                  <SelectItem value="snack" className="text-gray-900 dark:text-white dark:focus:bg-gray-700">{t('quickMealModal.mealTypes.snack')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Upload de imagem */}
            <div>
              <Label className="text-gray-700 dark:text-gray-300">
                {t('quickMealModal.imageLabel')}
              </Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt={t('quickMealModal.previewAlt')}
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors shadow-lg"
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
                      {t('quickMealModal.takePhotoButton')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      {t('quickMealModal.galleryButton')}
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
                  {t('quickMealModal.imageHelpText')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
              disabled={loading}
            >
              {loading ? t('quickMealModal.saving') : t('quickMealModal.addButton')}
              <Plus className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickMealModal;