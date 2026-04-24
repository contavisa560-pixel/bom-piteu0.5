import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, RefreshCw, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const UsageLimitModal = ({ isOpen, onClose, onUpgrade, usageStats, user }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const isPremium = user?.isPremium || false;
  const used = usageStats?.used || 0;
  const limit = usageStats?.limit || 7;
  const imagesUsed = usageStats?.imagesUsed || 0;
  const imagesLimit = usageStats?.imagesLimit || (isPremium ? 50 : 3);

  // Data de reset vem directamente do usageStats (calculada no hook)
  // Só existe se o limite foi atingido — 7 dias após esse momento
  const resetDate = usageStats?.resetDate ? new Date(usageStats.resetDate) : null;

  const resetFormatted = resetDate
    ? resetDate.toLocaleDateString(t('code') === 'pt' ? 'pt-PT' : t('code'), {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    : '—';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

              {/* Faixa superior */}
              <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 to-red-500" />

              {/* Conteúdo */}
              <div className="p-7">

                {/* Título + fechar */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
                      {isPremium ? t('usageLimitModal.title.premium') : t('usageLimitModal.title.free')}
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {t(isPremium ? 'usageLimitModal.usage.premium' : 'usageLimitModal.usage.free', { used, limit })}
                    </p>
                  </div>
                  <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors ml-4 mt-0.5">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Barra de progresso */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all"
                    style={{ width: `${Math.min(100, Math.round((used / limit) * 100))}%` }}
                  />
                </div>

                {/* Contadores mensagens + imagens */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">{t('usageLimitModal.messages')}</p>
                    <p className="text-lg font-bold text-gray-800">
                      {used}<span className="text-sm font-normal text-gray-400">/{limit}</span>
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">{t('usageLimitModal.images')}</p>
                    <p className="text-lg font-bold text-gray-800">
                      {imagesUsed}<span className="text-sm font-normal text-gray-400">/{imagesLimit}</span>
                    </p>
                  </div>
                </div>

                {/* Data de renovação — 7 dias após atingir o limite */}
                <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-4 py-3 mb-6">
                  <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">{t('usageLimitModal.resetLabel')}</p>
                    <p className="text-sm font-medium text-gray-700">{resetFormatted}</p>
                  </div>
                </div>

                {isPremium ? (
                  <>
                    <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                      {t('usageLimitModal.premium.description')}
                    </p>
                    <button
                      onClick={() => { onUpgrade('renew'); onClose(); }}
                      className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-xl text-sm transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                      {t('usageLimitModal.premium.renewButton')}
                    </button>
                    <button onClick={onClose} className="w-full text-center text-gray-400 text-xs mt-3 py-2 hover:text-gray-600 transition-colors">
                      {t('usageLimitModal.premium.waitButton')}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2.5 mb-6">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                          <span className="text-sm text-gray-600">{t(`usageLimitModal.free.benefit${i}`)}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => { onUpgrade('premium'); onClose(); }}
                      className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-xl text-sm transition-colors"
                    >
                      {t('usageLimitModal.free.upgradeButton')}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button onClick={onClose} className="w-full text-center text-gray-400 text-xs mt-3 py-2 hover:text-gray-600 transition-colors">
                      {t('usageLimitModal.free.continueButton')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UsageLimitModal;