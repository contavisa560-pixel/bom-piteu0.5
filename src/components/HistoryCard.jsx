import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChefHat,
  Clock,
  MessageSquare,
  Image as ImageIcon,
  Trash2,
  Share2,
  Download,
  ExternalLink,
  ZoomIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const HistoryCard = ({ session, onSelect, onDelete, onExport }) => {
  const { t } = useTranslation();
  const [showImagePreview, setShowImagePreview] = useState(null);

  // Encontra a primeira imagem para thumbnail
  const firstImage = session.messages?.find(msg => msg.imageUrl || msg.thumbnailUrl);

  // Conta imagens
  const imageCount = session.messages?.filter(msg => msg.imageUrl).length || 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-xl dark:hover:shadow-2xl transition-all cursor-pointer group"
        onClick={() => onSelect(session)}
      >
        <div className="flex gap-4">
          {/* Thumbnail da imagem (se houver) */}
          {firstImage?.imageUrl && (
            <div className="relative w-20 h-20 flex-shrink-0">
              <img
                src={firstImage.thumbnailUrl || firstImage.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImagePreview(firstImage.imageUrl);
                }}
              />
              {imageCount > 1 && (
                <div className="absolute -bottom-2 -right-2 bg-blue-500 dark:bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                  +{imageCount - 1}
                </div>
              )}
            </div>
          )}
          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1">
                  {session.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock size={12} className="text-gray-400 dark:text-gray-500" />
                  {formatDate(session.createdAt)}
                  {session.storageInfo?.totalImages > 0 && (
                    <>
                      <span className="mx-1">•</span>
                      <ImageIcon size={12} className="text-gray-400 dark:text-gray-500" />
                      <span>{t('historyCard.imagesCount', { count: session.storageInfo.totalImages })}</span>
                    </>
                  )}
                </div>
              </div>

              {session.recipeData?.completed && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {t('historyCard.completed')}
                </div>
              )}
            </div>

            {/* Preview das mensagens */}
            <div className="space-y-2 mb-4">
              {session.messages?.slice(-2).map((msg, idx) => (
                <div
                  key={idx}
                  className={`text-sm p-2 rounded-lg ${msg.type === 'user'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {msg.type === 'user' ? (
                        <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></span>
                      ) : (
                        <span className="w-2 h-2 bg-orange-500 dark:bg-orange-400 rounded-full"></span>
                      )}
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {msg.type === 'user' ? t('historyCard.you') : t('historyCard.chefIA')}:
                      </span>
                    </div>
                    {msg.imageUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowImagePreview(msg.imageUrl);
                        }}
                      >
                        <ZoomIn size={12} />
                      </Button>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-gray-700 dark:text-gray-300">
                    {msg.content || (msg.imageUrl ? t('historyCard.sentImage') : '...')}
                  </p>
                </div>
              ))}
            </div>

            {/* Estatísticas e ações */}
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <MessageSquare size={14} className="text-gray-500 dark:text-gray-500" />
                  <span>{session.statistics?.messageCount || 0}</span>
                </div>
                {session.statistics?.recipeSteps > 0 && (
                  <div className="flex items-center gap-1">
                    <ChefHat size={14} className="text-gray-500 dark:text-gray-500" />
                    <span>{t('historyCard.stepsCount', { count: session.statistics.recipeSteps })}</span>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(session);
                  }}
                  title={t('historyCard.delete')}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal de preview de imagem */}
      {showImagePreview && (
        <div className="fixed inset-0 bg-black/80 dark:bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={showImagePreview}
              alt={t('historyCard.fullPreviewAlt')}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(showImagePreview, '_blank')}
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ExternalLink size={16} className="mr-2" />
                {t('historyCard.openOriginal')}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowImagePreview(null)}
                className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white"
              >
                {t('historyCard.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HistoryCard;