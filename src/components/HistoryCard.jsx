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

const HistoryCard = ({ session, onSelect, onDelete, onExport }) => {
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
        className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-xl transition-all cursor-pointer group"
        onClick={() => onSelect(session)}
      >
        <div className="flex gap-4">
          {/* Thumbnail da imagem (se houver) */}
          {firstImage?.imageUrl && (
            <div className="relative w-20 h-20 flex-shrink-0">
              <img
                src={firstImage.thumbnailUrl || firstImage.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg border border-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImagePreview(firstImage.imageUrl);
                }}
              />
              {imageCount > 1 && (
                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  +{imageCount}
                </div>
              )}
            </div>
          )}
          
          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
                  {session.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={12} />
                  {formatDate(session.createdAt)}
                  {session.storageInfo?.totalImages > 0 && (
                    <>
                      <span className="mx-1">•</span>
                      <ImageIcon size={12} />
                      <span>{session.storageInfo.totalImages} imagens</span>
                    </>
                  )}
                </div>
              </div>
              
              {session.recipeData?.completed && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  ✅ Concluído
                </div>
              )}
            </div>

            {/* Preview das mensagens */}
            <div className="space-y-2 mb-4">
              {session.messages?.slice(-2).map((msg, idx) => (
                <div 
                  key={idx}
                  className={`text-sm p-2 rounded-lg ${msg.type === 'user' 
                    ? 'bg-blue-50 text-blue-800' 
                    : 'bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {msg.type === 'user' ? (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      ) : (
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      )}
                      <span className="font-medium">
                        {msg.type === 'user' ? 'Você' : 'Chef IA'}:
                      </span>
                    </div>
                    {msg.imageUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowImagePreview(msg.imageUrl);
                        }}
                      >
                        <ZoomIn size={12} />
                      </Button>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2">
                    {msg.content || (msg.imageUrl ? '📷 Enviou uma imagem' : '...')}
                  </p>
                </div>
              ))}
            </div>

            {/* Estatísticas e ações */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MessageSquare size={14} />
                  <span>{session.statistics?.messageCount || 0}</span>
                </div>
                {session.statistics?.recipeSteps > 0 && (
                  <div className="flex items-center gap-1">
                    <ChefHat size={14} />
                    <span>{session.statistics.recipeSteps} passos</span>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExport(session, 'html');
                  }}
                  title="Exportar"
                >
                  <Download size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(session);
                  }}
                  title="Eliminar"
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
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={showImagePreview}
              alt="Preview completo"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(showImagePreview, '_blank')}
              >
                <ExternalLink size={16} className="mr-2" />
                Abrir original
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowImagePreview(null)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HistoryCard;