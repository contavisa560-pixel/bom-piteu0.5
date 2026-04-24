import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {  ChefHat, HelpCircle, FileText, Shield, Cookie, Info, Mail } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const footerLinks = [
    { key: 'support', label: t('footer.support'), icon: HelpCircle, path: '/support' },
    { key: 'privacy', label: t('footer.privacy'), icon: Shield, path: '/privacy' },
    { key: 'terms', label: t('footer.terms'), icon: FileText, path: '/terms' },
    { key: 'cookies', label: t('footer.cookies'), icon: Cookie, path: '/cookies' },
    { key: 'about', label: t('footer.about'), icon: Info, path: '/about' },
    { key: 'contact', label: t('footer.contact'), icon: Mail, path: '/support' },
  ];

  return (
    <footer className="mt-16 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8 md:py-10">
        {/* Logo / Marca */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-2 text-orange-500 dark:text-orange-400 mb-2">
  <ChefHat className="h-5 w-5" />
  <span className="font-bold text-lg">Bom Piteu!</span>
</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
            {t('footer.tagline', 'A tua cozinha inteligente, cheia de sabor e saúde.')}
          </p>
        </div>

        {/* Links rápidos */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
          {footerLinks.map((link) => (
            <button
              key={link.key}
              onClick={() => navigate(link.path)}
              className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200"
            >
              <link.icon className="h-3.5 w-3.5" />
              <span>{link.label}</span>
            </button>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} Bom Piteu! – {t('footer.rights', 'Todos os direitos reservados.')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;