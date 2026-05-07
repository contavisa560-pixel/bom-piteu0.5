import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CreditCard, Building2, CheckCircle, Lock, ShieldCheck, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

// ─────────────────────────────────────────────────────────────────────────────
// GATEWAY CONFIGURATION
// Quando quiseres ligar uma API real, basta definir enabled: true
// e implementar a função processPayment correspondente.
// ─────────────────────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
    {
        id: 'multicaixa',
        label: 'Multicaixa Express', // será substituído por t()
        description: 'Paga com o teu número de telemóvel',
        icon: 'multicaixa',
        color: 'from-red-500 to-red-700',
        borderColor: 'border-red-200 dark:border-red-800',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        enabled: true,
        fields: ['phone'],
        badge: 'Angola',
    },
    {
        id: 'visa',
        label: 'Cartão de Crédito / Débito',
        description: 'VISA, Mastercard, American Express',
        icon: 'visa',
        color: 'from-blue-600 to-indigo-700',
        borderColor: 'border-blue-200 dark:border-blue-800',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        enabled: true,
        fields: ['cardNumber', 'cardHolder', 'expiry', 'cvv'],
        badge: 'Internacional',
    },
    {
        id: 'paypal',
        label: 'PayPal',
        description: 'Paga com a tua conta PayPal',
        icon: 'paypal',
        color: 'from-blue-400 to-blue-600',
        borderColor: 'border-sky-200 dark:border-sky-800',
        bgColor: 'bg-sky-50 dark:bg-sky-900/20',
        enabled: true,
        fields: ['email'],
        badge: 'Internacional',
    },
    {
        id: 'transferencia',
        label: 'Transferência Bancária',
        description: 'BFA, BAI, BIC, Millennium Angola',
        icon: 'bank',
        color: 'from-gray-600 to-gray-800',
        borderColor: 'border-gray-200 dark:border-gray-700',
        bgColor: 'bg-gray-50 dark:bg-gray-800/50',
        enabled: true,
        fields: ['iban'],
        badge: 'Angola',
    },
];

const PaymentIcon = ({ id, size = 28 }) => {
    if (id === 'multicaixa') return (
        <img
            src="/transferir (10).jpeg"
            alt="Multicaixa Express"
            style={{ width: size, height: size, objectFit: 'contain', borderRadius: 4 }}
            onError={e => { e.target.style.display = 'none'; }}
        />
    );
    if (id === 'visa') return (
        <img
            src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/visa.svg"
            alt="Visa"
            style={{ width: size * 1.6, height: size * 0.8, objectFit: 'contain', filter: 'invert(20%) sepia(100%) saturate(2000%) hue-rotate(200deg)' }}
            onError={e => { e.target.style.display = 'none'; }}
        />
    );
    if (id === 'paypal') return (
        <img
            src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/paypal.svg"
            alt="PayPal"
            style={{ width: size * 1.6, height: size * 0.8, objectFit: 'contain', filter: 'invert(27%) sepia(89%) saturate(1200%) hue-rotate(195deg)' }}
            onError={e => { e.target.style.display = 'none'; }}
        />
    );
    if (id === 'bank') return (
        <Building2 style={{ width: size, height: size, color: '#6b7280' }} />
    );
    return null;
};

// ─── Campos do formulário por método ─────────────────────────────────────────
const FIELD_CONFIG = {
    phone: { labelKey: 'payment.fields.phone.label', placeholderKey: 'payment.fields.phone.placeholder', type: 'tel', maxLength: 12 },
    email: { labelKey: 'payment.fields.email.label', placeholderKey: 'payment.fields.email.placeholder', type: 'email', maxLength: 100 },
    cardNumber: { labelKey: 'payment.fields.cardNumber.label', placeholderKey: 'payment.fields.cardNumber.placeholder', type: 'text', maxLength: 19 },
    cardHolder: { labelKey: 'payment.fields.cardHolder.label', placeholderKey: 'payment.fields.cardHolder.placeholder', type: 'text', maxLength: 50 },
    expiry: { labelKey: 'payment.fields.expiry.label', placeholderKey: 'payment.fields.expiry.placeholder', type: 'text', maxLength: 5 },
    cvv: { labelKey: 'payment.fields.cvv.label', placeholderKey: 'payment.fields.cvv.placeholder', type: 'password', maxLength: 4 },
    iban: { labelKey: 'payment.fields.iban.label', placeholderKey: 'payment.fields.iban.placeholder', type: 'text', maxLength: 34 },
};

// ─── Simula chamada à API (substituir pelo gateway real) ──────────────────────
const processPaymentAPI = async (method, formData, plan, user) => {
    const token = localStorage.getItem('bomPiteuToken');
    const userId = user?._id || user?.id;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Simula delay do gateway de pagamento
    await new Promise(r => setTimeout(r, 2000));

    // Chama a rota dedicada que activa premium E limpa o ciclo de uso
    const res = await fetch(`${API_URL}/api/users/${userId}/activate-subscription`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            plan: plan?.plan || 'premium',
            durationDays: 30
        })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao ativar premium');

    return {
        success: true,
        transactionId: `BMP-${Date.now()}`,
        user: data.user   
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────
const PaymentPage = ({ user, plan = { plan: 'premium', price: '3.500 Kz', period: 'mês' }, onNavigate, onSubscribe }) => {
    const { t } = useTranslation();
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Traduzir os métodos de pagamento
    const translatedMethods = PAYMENT_METHODS.map(method => ({
        ...method,
        label: t(`payment.methods.${method.id}.label`),
        description: t(`payment.methods.${method.id}.description`),
        badge: t(`payment.methods.${method.id}.badge`),
    }));

    const handleFieldChange = (field, value) => {
        if (field === 'cardNumber') {
            value = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
        }
        if (field === 'expiry') {
            value = value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2').slice(0, 5);
        }
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isFormValid = () => {
        if (!selectedMethod) return false;
        const method = translatedMethods.find(m => m.id === selectedMethod);
        return method.fields.every(f => formData[f]?.trim?.()?.length > 0);
    };

    const handleSubmit = async () => {
        if (!isFormValid()) return;
        setLoading(true);
        try {
            const result = await processPaymentAPI(selectedMethod, formData, plan, user);
            if (result.success) {
                setSuccess(true);
                if (result.user) {
                    // Guarda o utilizador actualizado (com isPremium, premiumExpiresAt, etc.)
                    localStorage.setItem('bomPiteuUser', JSON.stringify(result.user));
                }
                setTimeout(() => {
                    // Passa o utilizador actualizado para o App.jsx
                    onSubscribe?.('premium', result.user);
                    onNavigate?.('dashboard');
                }, 2500);
            }
        } catch (err) {
            toast({ title: t('payment.error.title'), description: t('payment.error.description'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="min-h-[60vh] flex items-center justify-center"
            >
                <div className="text-center max-w-md mx-auto px-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 12 }}
                        className="w-24 h-24 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle className="h-12 w-12 text-green-500" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('payment.success.title')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                        {t('payment.success.message', { name: user?.name?.split(' ')[0] || t('common.chef') })}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">{t('payment.success.redirecting')}</p>
                </div>
            </motion.div>
        );
    }

    const activeMethod = translatedMethods.find(m => m.id === selectedMethod);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto px-4 pb-12"
        >
            {/* Voltar */}
            <button
                onClick={() => onNavigate('subscription')}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white mb-6 text-sm font-medium transition-colors"
            >
                <ArrowLeft className="h-4 w-4" /> {t('payment.backToPlans')}
            </button>

            {/* Resumo do plano */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 text-white mb-6 flex items-center justify-between">
                <div>
                    <p className="text-white/80 text-sm font-medium uppercase tracking-wider">{t('payment.subscribingTo')}</p>
                    <p className="text-2xl font-bold mt-0.5">{t('payment.premiumPlan')}</p>
                    <p className="text-white/80 text-sm mt-1">{t('payment.planDescription')}</p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-3xl font-extrabold">{plan.price}</p>
                    <p className="text-white/70 text-sm">/{t(`payment.period.${plan.period}`)}</p>
                </div>
            </div>

            {/* Métodos de pagamento */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-4">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-white text-base">{t('payment.methodTitle')}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('payment.methodSubtitle')}</p>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {translatedMethods.map((method) => (
                        <button
                            key={method.id}
                            onClick={() => { setSelectedMethod(method.id); setFormData({}); }}
                            className={`w-full flex items-center gap-4 px-5 py-4 transition-colors text-left ${selectedMethod === method.id
                                ? 'bg-orange-50 dark:bg-orange-900/20'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selectedMethod === method.id
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                {selectedMethod === method.id && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                            </div>

                            <div className="w-10 flex items-center justify-center shrink-0">
                                <PaymentIcon id={method.icon} size={24} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 dark:text-white text-sm">{method.label}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{method.description}</p>
                            </div>

                            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                {method.badge}
                            </span>

                            <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${selectedMethod === method.id ? 'rotate-90 text-orange-500' : 'text-gray-400'
                                }`} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Formulário do método selecionado */}
            <AnimatePresence>
                {selectedMethod && activeMethod && (
                    <motion.div
                        key={selectedMethod}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-4">
                            <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r ${activeMethod.color} text-white mb-4`}>
                                <PaymentIcon id={activeMethod.icon} size={16} />
                                {activeMethod.label}
                            </div>

                            {/* Mensagem específica por método */}
                            {selectedMethod === 'multicaixa' && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800">
                                    {t('payment.methodMessages.multicaixa')}
                                </p>
                            )}
                            {selectedMethod === 'paypal' && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 bg-sky-50 dark:bg-sky-900/20 p-3 rounded-lg border border-sky-100 dark:border-sky-800">
                                    {t('payment.methodMessages.paypal')}
                                </p>
                            )}
                            {selectedMethod === 'transferencia' && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                    {t('payment.methodMessages.transferencia')}
                                </p>
                            )}

                            {/* Campos do formulário */}
                            <div className={`grid gap-4 ${selectedMethod === 'visa'
                                ? 'grid-cols-1 sm:grid-cols-2'
                                : 'grid-cols-1'
                                }`}>
                                {activeMethod.fields.map(field => {
                                    const cfg = FIELD_CONFIG[field];
                                    const isHalf = field === 'expiry' || field === 'cvv';
                                    return (
                                        <div key={field} className={isHalf ? '' : 'sm:col-span-2'}>
                                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                                                {t(cfg.labelKey)}
                                            </label>
                                            <input
                                                type={cfg.type}
                                                placeholder={t(cfg.placeholderKey)}
                                                maxLength={cfg.maxLength}
                                                value={formData[field] || ''}
                                                onChange={e => handleFieldChange(field, e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Botão de pagamento */}
            <button
                onClick={handleSubmit}
                disabled={!isFormValid() || loading}
                className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-3 shadow-lg ${isFormValid() && !loading
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white active:scale-[0.98]'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
            >
                {loading ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {t('payment.processing')}
                    </>
                ) : (
                    <>
                        <Lock className="h-5 w-5" />
                        {t('payment.confirmButton', { price: plan.price, period: t(`payment.period.${plan.period}`) })}
                    </>
                )}
            </button>

            {/* Selos de segurança */}
            <div className="flex items-center justify-center gap-6 mt-5">
                <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs">{t('payment.security.securePayment')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                    <Lock className="h-4 w-4" />
                    <span className="text-xs">{t('payment.security.encrypted')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs">{t('payment.security.cancelAnytime')}</span>
                </div>
            </div>

            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
                {t('payment.terms', { terms: t('payment.termsLink'), privacy: t('payment.privacyLink') })}
            </p>
        </motion.div>
    );
};

export default PaymentPage;