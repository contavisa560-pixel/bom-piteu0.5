// src/components/Subscription.jsx
// Mostra planos normais OU renovação se já é premium/familiar
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, RefreshCw, ArrowLeft, Zap, Users, Star, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/ui/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Subscription = ({ user, onSubscribe, onNavigate }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [sysConfig, setSysConfig] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/settings/public`)
      .then(r => r.json())
      .then(d => setSysConfig(d.data))
      .catch(err => console.error('Erro ao buscar configurações:', err));
  }, []);

  const premiumPrice = sysConfig?.premiumPrices?.monthly
    ? `${sysConfig.premiumPrices.monthly.toLocaleString('pt-PT')} Kz`
    : '3.500 Kz';

  const familiarPrice = sysConfig?.premiumPrices?.lifetime
    ? `${sysConfig.premiumPrices.lifetime.toLocaleString('pt-PT')} Kz`
    : '7.500 Kz';

  const subsEnabled = sysConfig?.subscriptionsEnabled ?? true;

  const isPremium = user?.isPremium || false;
  const isFamiliar = user?.plan === 'familiar';
  const hasActivePlan = isPremium || isFamiliar;

  const expiresAt = user?.premiumExpiresAt
    ? new Date(user.premiumExpiresAt).toLocaleDateString(t('code') === 'pt' ? 'pt-PT' : t('code'), {
      day: 'numeric', month: 'long', year: 'numeric'
    })
    : null;

  const handleAction = async (plan) => {
    if (plan === 'free') {
      onSubscribe?.('free');
      onNavigate?.('dashboard');
      return;
    }
    setLoading(plan);
    onNavigate?.('payment', {
      plan,
      price: plan === 'premium' ? premiumPrice : familiarPrice,
      period: 'mês'
    });
    setLoading(null);
  };

  const handleCancel = async () => {
    setLoading('cancel');
    try {
      const token = localStorage.getItem('bomPiteuToken');
      const userId = user?._id || user?.id; // pegar o ID do utilizador
      const res = await fetch(`${API_URL}/api/users/${userId}/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: t('subscription.cancelSuccess'),
          description: t('subscription.cancelSuccessDesc'),
        });
        // Atualiza o estado do utilizador para free
        onSubscribe?.('free');
        onNavigate?.('dashboard');
      } else {
        throw new Error(data.error || 'Erro ao cancelar');
      }
    } catch (err) {
      toast({
        title: t('common.error'),
        description: err.message || t('subscription.cancelError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
      setShowCancelConfirm(false);
    }
  };

  // ── VISTA DE RENOVAÇÃO (utilizador já tem plano activo) ────────────────────
  if (hasActivePlan) {
    const planLabel = isFamiliar ? t('subscription.family.title') : t('subscription.premium.title');
    const planIcon = isFamiliar ? <Users className="h-5 w-5" /> : <Zap className="h-5 w-5" />;
    const planPrice = isFamiliar ? familiarPrice : premiumPrice;
    const planFeatures = isFamiliar
      ? [
        t('subscription.family.feature1'),
        t('subscription.family.feature2'),
        t('subscription.family.feature3'),
      ]
      : [
        t('subscription.premium.feature1'),
        t('subscription.premium.feature2'),
        t('subscription.premium.feature3'),
        t('subscription.premium.feature4'),
      ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto px-4 py-10"
      >
        <button
          onClick={() => onNavigate?.('dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </button>

        {/* Plano activo */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-red-500" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                {planIcon}
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{t('subscription.activePlan')}</p>
                <h2 className="text-lg font-semibold text-gray-900">{planLabel}</h2>
              </div>
              <div className="ml-auto">
                <span className="text-xs bg-green-50 text-green-600 font-medium px-2.5 py-1 rounded-full border border-green-100">
                  {t('subscription.active')}
                </span>
              </div>
            </div>

            {expiresAt && (
              <p className="text-sm text-gray-400 mb-5">
                {t('subscription.renewsOn')} <span className="text-gray-600 font-medium">{expiresAt}</span>
              </p>
            )}

            <div className="space-y-2.5 mb-6">
              {planFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm text-gray-600">{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleAction(isFamiliar ? 'familiar' : 'premium')}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              {t('subscription.renewButton')} {planLabel}
              <span className="text-gray-400 text-xs ml-1">— {planPrice}/{t('subscription.perMonth')}</span>
            </button>

            {/* Botão de cancelar */}
            <button
              onClick={() => setShowCancelConfirm(true)}
              disabled={loading !== null}
              className="w-full mt-3 flex items-center justify-center gap-2 border border-red-200 hover:border-red-400 text-red-600 font-medium py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              {t('subscription.cancelButton')}
            </button>
          </div>
        </div>

        {/* Upgrade para familiar (se for só premium) */}
        {isPremium && !isFamiliar && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{t('subscription.family.title')}</h3>
                <p className="text-xs text-gray-400">{t('subscription.family.description')}</p>
              </div>
              <span className="ml-auto text-sm font-bold text-gray-900">{familiarPrice}<span className="text-xs text-gray-400 font-normal">/{t('subscription.perMonth')}</span></span>
            </div>
            <p className="text-xs text-gray-500 mb-4">{t('subscription.family.upgradeDesc')}</p>
            <button
              disabled={!subsEnabled}
              className="w-full border border-gray-200 hover:border-gray-400 text-gray-700 font-medium py-2.5 rounded-xl text-sm transition-colors opacity-60 cursor-not-allowed"
            >
              {t('subscription.family.comingSoon')}
            </button>
          </div>
        )}

        {/* Modal de confirmação de cancelamento */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('subscription.confirmCancelTitle')}</h3>
              <p className="text-sm text-gray-600 mb-6">{t('subscription.confirmCancelDesc')}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-xl text-sm transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading === 'cancel'}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  {loading === 'cancel' ? t('common.processing') : t('subscription.confirmCancelButton')}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // ── VISTA NORMAL (sem plano activo) ────────────────────────────────────────
  const plans = [
    {
      id: 'free',
      name: t('subscription.free.title'),
      price: '0',
      period: '',
      description: t('subscription.free.description'),
      features: [
        t('subscription.free.feature1'),
        t('subscription.free.feature2'),
        t('subscription.free.feature3'),
      ],
      cta: t('subscription.free.button'),
      highlight: false,
    },
    {
      id: 'premium',
      name: t('subscription.premium.title'),
      price: sysConfig?.premiumPrices?.monthly?.toLocaleString('pt-PT') || '3.500',
      period: `Kz/${t('subscription.perMonth')}`,
      description: t('subscription.premium.description'),
      features: [
        t('subscription.premium.feature1'),
        t('subscription.premium.feature2'),
        t('subscription.premium.feature3'),
        t('subscription.premium.feature4'),
        t('subscription.premium.feature5'),
      ],
      cta: t('subscription.premium.button'),
      highlight: true,
      badge: t('subscription.popular'),
    },
    {
      id: 'familiar',
      name: t('subscription.family.title'),
      price: sysConfig?.premiumPrices?.lifetime?.toLocaleString('pt-PT') || '7.500',
      period: `Kz/${t('subscription.perMonth')}`,
      description: t('subscription.family.description'),
      features: [
        t('subscription.family.feature1'),
        t('subscription.family.feature2'),
        t('subscription.family.feature3'),
      ],
      cta: t('subscription.family.button'),
      highlight: false,
      badge: t('subscription.comingSoon'),
      comingSoon: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto px-4 py-10"
    >
      <button
        onClick={() => onNavigate?.('dashboard')}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('common.back')}
      </button>

      <div className="text-center mb-10">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{t('subscription.title')}</h1>
        <p className="text-gray-400 text-sm mt-2">{t('subscription.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl border overflow-hidden transition-all ${plan.highlight
              ? 'border-gray-900 shadow-lg'
              : 'border-gray-100 shadow-sm'
              }`}
          >
            {plan.highlight && (
              <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-red-500" />
            )}

            {plan.badge && (
              <div className={`absolute top-4 right-4 text-xs font-medium px-2 py-0.5 rounded-full ${plan.highlight
                ? 'bg-orange-50 text-orange-600 border border-orange-100'
                : 'bg-gray-100 text-gray-400'
                }`}>
                {plan.badge}
              </div>
            )}

            <div className="p-6">
              <h3 className="font-semibold text-gray-900 text-base mb-0.5">{plan.name}</h3>
              <p className="text-xs text-gray-400 mb-4">{plan.description}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                {plan.period && <span className="text-xs text-gray-400">{plan.period}</span>}
              </div>

              <div className="space-y-2.5 mb-6">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Check className={`h-3.5 w-3.5 shrink-0 ${plan.highlight ? 'text-orange-500' : 'text-gray-300'}`} />
                    <span className="text-xs text-gray-600">{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => !plan.comingSoon && handleAction(plan.id)}
                disabled={loading !== null || plan.comingSoon || (!subsEnabled && plan.id !== 'free')}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${plan.comingSoon
                  ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  : plan.highlight
                    ? 'bg-gray-900 hover:bg-gray-800 text-white'
                    : 'border border-gray-200 hover:border-gray-400 text-gray-600'
                  } disabled:opacity-60`}
              >
                {loading === plan.id ? t('common.processing') : plan.comingSoon ? t('subscription.comingSoon') : plan.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-300 mt-8">
        {t('subscription.footer')}
      </p>
    </motion.div>
  );
};

export default Subscription;