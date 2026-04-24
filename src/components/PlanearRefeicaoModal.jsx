import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { pt } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

export const PlanearRefeicaoModal = ({ open, onClose, onConfirm, recipeTitle }) => {
    const { t } = useTranslation();
    const [date, setDate] = useState(new Date());
    const [mealType, setMealType] = useState('almoco');

    const handleConfirm = () => {
        onConfirm({
            date: date.toISOString(),
            mealType,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">
                        {t('planearRefeicaoModal.title', { recipeTitle })}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                        {t('planearRefeicaoModal.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <input
                        type="date"
                        value={date.toISOString().split('T')[0]}
                        onChange={(e) => setDate(new Date(e.target.value))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900/30 outline-none"
                    />

                    <Select value={mealType} onValueChange={setMealType}>
                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                            <SelectValue placeholder={t('planearRefeicaoModal.mealTypePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <SelectItem value="pequeno-almoco" className="text-gray-900 dark:text-white dark:focus:bg-gray-700">
                                {t('planearRefeicaoModal.mealTypes.breakfast')}
                            </SelectItem>
                            <SelectItem value="almoco" className="text-gray-900 dark:text-white dark:focus:bg-gray-700">
                                {t('planearRefeicaoModal.mealTypes.lunch')}
                            </SelectItem>
                            <SelectItem value="jantar" className="text-gray-900 dark:text-white dark:focus:bg-gray-700">
                                {t('planearRefeicaoModal.mealTypes.dinner')}
                            </SelectItem>
                            <SelectItem value="snack" className="text-gray-900 dark:text-white dark:focus:bg-gray-700">
                                {t('planearRefeicaoModal.mealTypes.snack')}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white"
                    >
                        {t('planearRefeicaoModal.confirmButton')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};