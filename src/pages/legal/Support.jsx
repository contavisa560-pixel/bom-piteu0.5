import LegalLayout from "./LegalLayout";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Mail, Phone } from 'lucide-react';
import SupportAssistant from '@/components/SupportAssistant';
import toast from 'react-hot-toast';
import { Rocket, Video, BookOpen, Users } from 'lucide-react';

const Support = () => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const { t } = useTranslation();

  // Estados para o formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    urgent: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' ou 'error'

  // Atualiza os campos do formulário
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Envia o formulário
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação básica
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Por favor, insira um email válido.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    // Construir assunto e corpo do email
    const subject = encodeURIComponent(`[Suporte Bom Piteu] ${formData.subject}`);
    const body = encodeURIComponent(
      `Nome: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Assunto: ${formData.subject}\n` +
      `Urgente: ${formData.urgent ? 'Sim' : 'Não'}\n\n` +
      `Mensagem:\n${formData.message}`
    );

    // Criar link mailto
    const mailtoLink = `mailto:centaurosa@gmail.com?subject=${subject}&body=${body}`;

    // Tentar abrir o cliente de email
    window.location.href = mailtoLink;

    // Simular envio (apenas para feedback visual)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      toast.success('Pedido enviado! Verifique o seu cliente de email.');

      // Limpar formulário
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        urgent: false
      });

      // Esconder a mensagem de sucesso após 5 segundos
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1000); // Pequeno delay para mostrar o loading
  };

  return (
    <>
      <LegalLayout
        title={t('support.title')}
        description={t('support.description')}
      >
        {/* Cabeçalho */}
        <section className="bg-gradient-to-r bg-white border border-gray-200 border border-cyan-100 rounded-3xl p-8 mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="!mt-0 text-slate-900 text-3xl font-semibold">
                {t('support.header.title')}
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl">
                {t('support.header.description')}
              </p>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl border border-cyan-200 shadow-sm">
              <p className="text-sm font-medium text-cyan-700">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                {t('support.header.status')}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2>{t('support.faq.title')}</h2>
          <div className="space-y-4 my-8">
            {(Array.isArray(t('support.faq.items', { returnObjects: true }))
              ? t('support.faq.items', { returnObjects: true })
              : []
            ).map((faq, index) => (
              <details key={index} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <summary className="list-none cursor-pointer p-6 flex justify-between items-center">
                  <span className="font-medium text-slate-900">{faq.q}</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-6 pt-0">
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Canais de contacto */}
        <section>
          <h2>{t('support.channels.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            {/* Live Chat */}
            <div className="bg-gradient-to-b bg-white border border-gray-200 border border-orange-100 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 text-2xl mx-auto mb-4">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">{t('support.channels.liveChat.title')}</h4>
              <p className="text-sm text-gray-600 mb-4">{t('support.channels.liveChat.responseTime')}</p>
              <button
                onClick={() => setIsAssistantOpen(true)}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 transition-colors text-white font-medium rounded-xl hover:shadow-md transition-shadow"
              >
                {t('support.channels.liveChat.button')}
              </button>
            </div>

            {/* Email */}
            <div className="bg-gradient-to-b from-blue-50 to-white border border-blue-100 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-2xl mx-auto mb-4">
                <Mail className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">{t('support.channels.email.title')}</h4>
              <p className="text-sm text-gray-600 mb-4">{t('support.channels.email.responseTime')}</p>
              <a
                href="mailto:centaurosa@gmail.com"
                className="block w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl hover:shadow-md transition-shadow"
              >
                centaurosa@gmail.com
              </a>
            </div>

            {/* Telefone */}
            <div className="bg-gradient-to-b bg-white border border-gray-200 border border-purple-100 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 text-2xl mx-auto mb-4">
                <Phone className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">{t('support.channels.phone.title')}</h4>
              <p className="text-sm text-gray-600 mb-4">{t('support.channels.phone.hours')}</p>
              <a href="tel:+244958999999" className="block w-full py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium rounded-xl hover:shadow-md transition-shadow">
                +244 958 999 999
              </a>
            </div>
          </div>
        </section>

        {/* Formulário de contacto */}
        <section>
          <h2>{t('support.contactForm.title')}</h2>
          <div className="bg-white border border-gray-200 rounded-2xl p-8 my-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('support.contactForm.name.label')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder={t('support.contactForm.name.placeholder')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('support.contactForm.email.label')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder={t('support.contactForm.email.placeholder')}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('support.contactForm.subject.label')} *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">{t('support.contactForm.subject.options.select')}</option>
                  <option value="technical">{t('support.contactForm.subject.options.technical')}</option>
                  <option value="payment">{t('support.contactForm.subject.options.payment')}</option>
                  <option value="privacy">{t('support.contactForm.subject.options.privacy')}</option>
                  <option value="suggestions">{t('support.contactForm.subject.options.suggestions')}</option>
                  <option value="other">{t('support.contactForm.subject.options.other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('support.contactForm.message.label')} *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                  placeholder={t('support.contactForm.message.placeholder')}
                  required
                ></textarea>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="urgent"
                  name="urgent"
                  checked={formData.urgent}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-orange-600 rounded"
                />
                <label htmlFor="urgent" className="text-sm text-gray-700">
                  {t('support.contactForm.urgent.label')}
                </label>
              </div>

              {/* Mensagem de sucesso/erro */}
              {submitStatus === 'success' && (
                <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl">
                  Mensagem enviada com sucesso! Verifique o seu cliente de email.
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-4 bg-orange-600 text-white font-medium rounded-xl transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-700'
                  }`}
              >
                {isSubmitting ? 'A enviar...' : t('support.contactForm.submitButton')}
              </button>
            </form>
          </div>
        </section>

        {/* Recursos úteis */}
        <section>
          <h2>{t('support.resources.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
            {(Array.isArray(t('support.resources.items', { returnObjects: true }))
              ? t('support.resources.items', { returnObjects: true })
              : []
            ).map((resource, index) => {
              // Mapeamento de ícones e cores baseado no título
              const getIconAndColor = (title) => {
                switch (title) {
                  case 'Guia de início rápido':
                    return { icon: Rocket, color: 'bg-blue-100 text-blue-600' };
                  case 'Tutoriais em vídeo':
                    return { icon: Video, color: 'bg-purple-100 text-purple-600' };
                  case 'Base de conhecimento':
                    return { icon: BookOpen, color: 'bg-green-100 text-green-600' };
                  case 'Comunidade':
                    return { icon: Users, color: 'bg-orange-100 text-orange-600' };
                  default:
                    return { icon: Rocket, color: 'bg-gray-100 text-gray-600' };
                }
              };

              const { icon: IconComponent, color } = getIconAndColor(resource.title);

              // Mapeamento de links externos (substitua pelas URLs reais)
              const linkMap = {
                'Guia de início rápido': 'https://react.dev/learn',
                'Tutoriais em vídeo': 'https://youtube.com',
                'Base de conhecimento': 'https://developer.mozilla.org',
                'Comunidade': 'https://github.com',
              };
              const link = linkMap[resource.title] || '#';

              return (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col items-center text-center hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-xl mb-3`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-gray-800">{resource.title}</span>
                </a>
              );
            })}
          </div>
        </section>

        {/* Estatísticas */}
        <section className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="!mt-0 text-slate-900">
                {t('support.stats.title')}
              </h3>
              <p className="text-gray-600">{t('support.stats.subtitle')}</p>
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{t('support.stats.satisfaction')}</p>
                <p className="text-sm text-gray-600">{t('support.stats.satisfactionLabel')}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{t('support.stats.responseTime')}</p>
                <p className="text-sm text-gray-600">{t('support.stats.responseTimeLabel')}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{t('support.stats.availability')}</p>
                <p className="text-sm text-gray-600">{t('support.stats.availabilityLabel')}</p>
              </div>
            </div>
          </div>
        </section>
      </LegalLayout>

      {/* Assistente de chat */}
      <SupportAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </>
  );
};

export default Support;