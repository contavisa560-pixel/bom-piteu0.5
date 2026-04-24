import LegalLayout from "./LegalLayout";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
    HeartHandshake,
    ShoppingCart,
    Leaf,
    BarChart3,
    Target,
    RefreshCcw
} from "lucide-react";

const Partnerships = () => {
    const { t } = useTranslation();

    // Estados do formulário
    const [formData, setFormData] = useState({
        companyName: '',
        sector: '',
        contactName: '',
        email: '',
        partnershipTypes: [],
        message: '',
        nda: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    // Handlers
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleMultiSelect = (e) => {
        const { options } = e.target;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(options[i].value);
            }
        }
        setFormData(prev => ({ ...prev, partnershipTypes: selected }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validações
        if (!formData.companyName || !formData.sector || !formData.contactName || !formData.email || !formData.message) {
            toast.error('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        if (formData.partnershipTypes.length === 0) {
            toast.error('Selecione pelo menos um tipo de parceria.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Por favor, insira um email válido.');
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);

        // Construir corpo do email
        const subject = encodeURIComponent(`[Parceria] ${formData.companyName}`);
        const body = encodeURIComponent(
            `Nome da empresa: ${formData.companyName}\n` +
            `Setor: ${formData.sector}\n` +
            `Nome do contacto: ${formData.contactName}\n` +
            `Email: ${formData.email}\n` +
            `Tipos de parceria: ${formData.partnershipTypes.join(', ')}\n` +
            `NDA solicitado: ${formData.nda ? 'Sim' : 'Não'}\n\n` +
            `Mensagem:\n${formData.message}`
        );

        // Abrir cliente de email
        window.location.href = `mailto:centaurosa@gmail.com?subject=${subject}&body=${body}`;

        // Simular envio e mostrar feedback
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitStatus('success');
            toast.success('Proposta enviada! Verifique o seu cliente de email.');

            // Limpar formulário
            setFormData({
                companyName: '',
                sector: '',
                contactName: '',
                email: '',
                partnershipTypes: [],
                message: '',
                nda: false
            });

            // Esconder mensagem após 5 segundos
            setTimeout(() => setSubmitStatus(null), 5000);
        }, 1000);
    };

    return (
        <LegalLayout
            title={t('partnerships.title')}
            description={t('partnerships.description')}
        >
            {/* Cabeçalho */}
            <section className="mb-12">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-3xl p-8 md:p-12">
                    <h2 className="!mt-0 text-blue-900 text-center flex items-center justify-center gap-3">
                        <HeartHandshake className="w-7 h-7" />
                        {t('partnerships.workWithUs')}
                    </h2>
                    <p className="text-lg text-blue-800 text-center max-w-3xl mx-auto">
                        {t('partnerships.workWithUsDesc')}
                    </p>
                </div>
            </section>

            {/* Tipos de parceria */}
            <section>
                <h2>{t('partnerships.partnershipTypes')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                            <ShoppingCart size={28} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-3">{t('partnerships.type1Title')}</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {t('partnerships.type1Desc')}
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                            <li>• {t('partnerships.type1Benefit1')}</li>
                            <li>• {t('partnerships.type1Benefit2')}</li>
                            <li>• {t('partnerships.type1Benefit3')}</li>
                        </ul>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                            <Leaf size={28} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-3">{t('partnerships.type2Title')}</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {t('partnerships.type2Desc')}
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                            <li>• {t('partnerships.type2Benefit1')}</li>
                            <li>• {t('partnerships.type2Benefit2')}</li>
                            <li>• {t('partnerships.type2Benefit3')}</li>
                        </ul>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                            <BarChart3 size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-3">{t('partnerships.type3Title')}</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {t('partnerships.type3Desc')}
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                            <li>• {t('partnerships.type3Benefit1')}</li>
                            <li>• {t('partnerships.type3Benefit2')}</li>
                            <li>• {t('partnerships.type3Benefit3')}</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Parceiros atuais */}
            <section className="bg-gray-50 rounded-3xl p-8 my-12">
                <h2>{t('partnerships.currentPartners')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                    <div className="bg-white h-24 rounded-xl flex items-center justify-center p-4">
                        <div className="text-2xl font-bold text-gray-400">{t('partnerships.partner1')}</div>
                    </div>
                    <div className="bg-white h-24 rounded-xl flex items-center justify-center p-4">
                        <div className="text-2xl font-bold text-gray-400">{t('partnerships.partner2')}</div>
                    </div>
                    <div className="bg-white h-24 rounded-xl flex items-center justify-center p-4">
                        <div className="text-2xl font-bold text-gray-400">{t('partnerships.partner3')}</div>
                    </div>
                    <div className="bg-white h-24 rounded-xl flex items-center justify-center p-4">
                        <div className="text-2xl font-bold text-gray-400">{t('partnerships.partner4')}</div>
                    </div>
                </div>
            </section>

            {/* Vantagens */}
            <section>
                <h2>{t('partnerships.advantages')}</h2>
                <div className="space-y-6 my-8">
                    <div className="flex items-start gap-4 p-6 bg-white border border-gray-200 rounded-2xl">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 flex-shrink-0">
                            <Target size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-2">{t('partnerships.advantage1Title')}</h4>
                            <p className="text-gray-600">
                                {t('partnerships.advantage1Desc')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-6 bg-white border border-gray-200 rounded-2xl">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                            <Target size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-2">{t('partnerships.advantage2Title')}</h4>
                            <p className="text-gray-600">
                                {t('partnerships.advantage2Desc')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-6 bg-white border border-gray-200 rounded-2xl">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 flex-shrink-0">
                            <RefreshCcw size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-2">{t('partnerships.advantage3Title')}</h4>
                            <p className="text-gray-600">
                                {t('partnerships.advantage3Desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Formulário de contacto */}
            <section className="mt-12">
                <h2>{t('partnerships.contactFormTitle')}</h2>
                <div className="bg-white border border-gray-200 rounded-2xl p-8 my-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('partnerships.form.companyName')} *
                                </label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder={t('partnerships.form.companyPlaceholder')}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('partnerships.form.sector')} *
                                </label>
                                <select
                                    name="sector"
                                    value={formData.sector}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    required
                                >
                                    <option value="">{t('partnerships.form.selectSector')}</option>
                                    <option value="supermarket">{t('partnerships.form.sectorSupermarket')}</option>
                                    <option value="foodIndustry">{t('partnerships.form.sectorFoodIndustry')}</option>
                                    <option value="health">{t('partnerships.form.sectorHealth')}</option>
                                    <option value="tech">{t('partnerships.form.sectorTech')}</option>
                                    <option value="other">{t('partnerships.form.sectorOther')}</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('partnerships.form.contactName')} *
                                </label>
                                <input
                                    type="text"
                                    name="contactName"
                                    value={formData.contactName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder={t('partnerships.form.namePlaceholder')}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('partnerships.form.email')} *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder={t('partnerships.form.emailPlaceholder')}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('partnerships.form.partnershipType')} *
                            </label>
                            <select
                                multiple
                                name="partnershipTypes"
                                value={formData.partnershipTypes}
                                onChange={handleMultiSelect}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                required
                            >
                                <option value="tech">{t('partnerships.form.partnershipTech')}</option>
                                <option value="promo">{t('partnerships.form.partnershipPromo')}</option>
                                <option value="cobrand">{t('partnerships.form.partnershipCobrand')}</option>
                                <option value="sponsor">{t('partnerships.form.partnershipSponsor')}</option>
                                <option value="joint">{t('partnerships.form.partnershipJoint')}</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-2">{t('partnerships.form.multipleSelectHint')}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('partnerships.form.message')} *
                            </label>
                            <textarea
                                rows="6"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                placeholder={t('partnerships.form.messagePlaceholder')}
                                required
                            ></textarea>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="nda"
                                name="nda"
                                checked={formData.nda}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="nda" className="text-sm text-gray-700">
                                {t('partnerships.form.ndaLabel')}
                            </label>
                        </div>

                        {submitStatus === 'success' && (
                            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl">
                                Proposta enviada! Verifique o seu cliente de email.
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:from-blue-600 hover:to-cyan-600'
                                }`}
                        >
                            {isSubmitting ? 'A enviar...' : t('partnerships.form.submitButton')}
                        </button>
                    </form>
                </div>
            </section>

            {/* Contactos e avaliação */}
            <section className="mt-12 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl">
                        <h4 className="font-bold text-blue-900 mb-3">{t('partnerships.contactTitle')}</h4>
                        <p className="text-sm text-blue-800">
                            <strong>{t('partnerships.email')}:</strong> centaurosa@gmail.com<br />
                            <strong>{t('partnerships.phone')}:</strong> +244 958 999 999
                        </p>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl">
                        <h4 className="font-bold text-orange-900 mb-3">{t('partnerships.evaluationTitle')}</h4>
                        <p className="text-sm text-orange-800">
                            {t('partnerships.evaluationDesc')}
                        </p>
                    </div>
                </div>
            </section>
        </LegalLayout>
    );
};

export default Partnerships;