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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const AgendarLembreteModal = ({ open, onClose, onConfirm, recipeTitle }) => {
  const { t } = useTranslation();
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [addListaCompras, setAddListaCompras] = useState(false);

  const handleConfirm = () => {
    onConfirm({ data, hora, addListaCompras });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Calendar className="h-5 w-5 text-orange-500 dark:text-orange-400" />
            {t('agendarLembreteModal.title', { recipeTitle })}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {t('agendarLembreteModal.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="data" className="text-gray-700 dark:text-gray-300">
              {t('agendarLembreteModal.dateLabel')}
            </Label>
            <Input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hora" className="text-gray-700 dark:text-gray-300">
              {t('agendarLembreteModal.timeLabel')}
            </Label>
            <Input
              id="hora"
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="listaCompras"
              checked={addListaCompras}
              onChange={(e) => setAddListaCompras(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-orange-600 dark:text-orange-400 focus:ring-orange-500 dark:focus:ring-orange-400 bg-white dark:bg-gray-700"
            />
            <Label
              htmlFor="listaCompras"
              className="flex items-center gap-1 cursor-pointer text-gray-700 dark:text-gray-300"
            >
              <ShoppingCart className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              {t('agendarLembreteModal.addToShoppingList')}
            </Label>
          </div>
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
            disabled={!data}
            className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};