import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { ChefHat } from "lucide-react";
import { useTranslation } from 'react-i18next';

const LegalLayout = ({ title, description, children }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const navLinks = [
    { name: t('legalLayout.nav.home'), path: "/legal", badge: "" },
    { name: t('legalLayout.nav.privacy'), path: "/privacy", badge: t('legalLayout.badge.updated') },
    { name: t('legalLayout.nav.terms'), path: "/terms", badge: "" },
    { name: t('legalLayout.nav.cookies'), path: "/cookies", badge: "" },
    { name: t('legalLayout.nav.community'), path: "/community", badge: t('legalLayout.badge.new') },
    { name: t('legalLayout.nav.payments'), path: "/payments", badge: "" },
    { name: t('legalLayout.nav.support'), path: "/support", badge: "" },
    { name: t('legalLayout.nav.dataDeletion'), path: "/data-deletion", badge: "" },
    { name: t('legalLayout.nav.about'), path: "/about", badge: "" },
    { name: t('legalLayout.nav.partnerships'), path: "/partnerships", badge: "" },
  ];

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="flex flex-col lg:flex-row bg-white dark:bg-[#0f0f0f] h-screen w-screen fixed top-0 left-0 overflow-hidden transition-colors duration-300">

      {/* ── MOBILE HEADER ── */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/8 bg-white dark:bg-[#141414]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">Bom Piteu!</span>
          </div>
          <details className="relative">
            <summary className="list-none cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/8 transition-colors">
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </summary>
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-50 p-4">
              <nav className="space-y-1">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-3">
                  {t('legalLayout.transparencyCenter')}
                </p>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm ${
                      location.pathname === link.path
                        ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/6"
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="text-xs bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>
            </div>
          </details>
        </div>
      </div>

      {/* ── SIDEBAR DESKTOP ── */}
      <aside className="hidden lg:flex flex-col w-80 border-r border-gray-200 dark:border-white/7 h-screen bg-white dark:bg-[#141414] overflow-y-auto transition-colors duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-white/6">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">Bom Piteu!</span>
              <p className="text-xs text-gray-500 dark:text-gray-600 mt-0.5">{t('legalLayout.smartKitchen')}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {/* Documentos Legais */}
            <p className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-3 px-3">
              {t('legalLayout.legalDocuments')}
            </p>
            {navLinks.slice(0, 4).map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                      : "text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <span className="font-medium text-sm">{link.name}</span>
                  {link.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Recursos Adicionais */}
            <p className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-3 px-3 mt-8">
              {t('legalLayout.additionalResources')}
            </p>
            {navLinks.slice(4).map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/20"
                      : "text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <span className="font-medium text-sm">{link.name}</span>
                  {link.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ── CONTEÚDO PRINCIPAL ── */}
      <main className="flex-1 overflow-y-auto bg-white dark:bg-[#0f0f0f] transition-colors duration-300">

        {/* Header */}
        <header className="border-b border-gray-100 dark:border-white/7 py-12 md:py-16 px-6 lg:px-20 bg-gradient-to-br from-white via-orange-50/30 to-white dark:from-[#141414] dark:via-[#1a1000] dark:to-[#141414] transition-colors duration-300">
          <div className="max-w-6xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <motion.h1
                  className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight leading-tight"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {title}
                </motion.h1>

                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400 text-xs font-medium px-3 py-1 rounded-full">
                    {t('legalLayout.legalDocument')}
                  </span>
                  <span className="bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 text-xs font-medium px-3 py-1 rounded-full">
                    {t('legalLayout.version', { version: '1.2' })}
                  </span>
                  <span className="bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 text-xs font-medium px-3 py-1 rounded-full">
                    {t('legalLayout.inEffect')}
                  </span>
                </div>
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-600 mt-8">
              <Link to="/" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                {t('legalLayout.home')}
              </Link>
              <span>›</span>
              <Link to="/legal" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                {t('legalLayout.transparencyCenter')}
              </Link>
              <span>›</span>
              <span className="text-orange-600 dark:text-orange-400 font-medium">{title}</span>
            </div>
          </div>
        </header>

        {/* Artigo */}
        <div className="max-w-6xl px-6 lg:px-20 py-10 md:py-12">
          <article className="
            prose prose-slate prose-lg max-w-none

            /* Headings */
            prose-headings:font-bold
            prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4

            /* Text */
            prose-p:text-gray-700 dark:prose-p:text-gray-400
            prose-p:leading-relaxed prose-p:my-4

            /* Lists */
            prose-ul:!pl-6
            prose-li:text-gray-700 dark:prose-li:text-gray-400

            /* Strong */
            prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-bold

            /* Links */
            prose-a:text-orange-600 dark:prose-a:text-orange-400

            /* Dark headings */
            dark:prose-headings:text-white
            dark:prose-h2:text-white
            dark:prose-h3:text-gray-200
          ">

            {/* ── DARK MODE OVERRIDES para componentes filhos ── */}
            <style>{`
              /* Cards brancos dentro dos filhos */
              .dark .bg-white {
                background-color: #1a1a1a !important;
              }
              .dark .bg-gray-50 {
                background-color: #161616 !important;
              }
              .dark .bg-slate-50 {
                background-color: #161616 !important;
              }

              /* Bordas */
              .dark .border-gray-200 {
                border-color: rgba(255,255,255,0.08) !important;
              }
              .dark .border-gray-100 {
                border-color: rgba(255,255,255,0.06) !important;
              }
              .dark .border-gray-300 {
                border-color: rgba(255,255,255,0.12) !important;
              }

              /* Texto */
              .dark .text-gray-600 {
                color: #9a9590 !important;
              }
              .dark .text-gray-700 {
                color: #b0ada8 !important;
              }
              .dark .text-gray-800 {
                color: #d0cdc8 !important;
              }
              .dark .text-gray-500 {
                color: #6a6760 !important;
              }
              .dark .text-slate-900 {
                color: #f0ede8 !important;
              }
              .dark .text-slate-800 {
                color: #e0ddd8 !important;
              }
              .dark .text-slate-600 {
                color: #a0a0a0 !important;
              }

              /* Fundos coloridos — versão escura */
              .dark .bg-orange-50 {
                background-color: rgba(249,115,22,0.07) !important;
              }
              .dark .border-orange-100 {
                border-color: rgba(249,115,22,0.2) !important;
              }
              .dark .text-orange-900 {
                color: #fed7aa !important;
              }
              .dark .text-orange-800 {
                color: #fdba74 !important;
              }

              .dark .bg-blue-50 {
                background-color: rgba(59,130,246,0.07) !important;
              }
              .dark .border-blue-100 {
                border-color: rgba(59,130,246,0.2) !important;
              }
              .dark .text-blue-900 {
                color: #bfdbfe !important;
              }
              .dark .text-blue-800 {
                color: #93c5fd !important;
              }

              .dark .bg-green-50 {
                background-color: rgba(34,197,94,0.07) !important;
              }
              .dark .border-green-100 {
                border-color: rgba(34,197,94,0.2) !important;
              }
              .dark .text-green-900 {
                color: #bbf7d0 !important;
              }
              .dark .text-green-800 {
                color: #86efac !important;
              }

              .dark .bg-amber-50 {
                background-color: rgba(245,158,11,0.07) !important;
              }
              .dark .border-amber-100 {
                border-color: rgba(245,158,11,0.2) !important;
              }
              .dark .text-amber-900 {
                color: #fde68a !important;
              }
              .dark .text-amber-800 {
                color: #fcd34d !important;
              }

              .dark .bg-purple-50 {
                background-color: rgba(168,85,247,0.07) !important;
              }
              .dark .border-purple-100 {
                border-color: rgba(168,85,247,0.2) !important;
              }
              .dark .text-purple-900 {
                color: #e9d5ff !important;
              }
              .dark .text-purple-800 {
                color: #d8b4fe !important;
              }

              .dark .bg-red-50 {
                background-color: rgba(239,68,68,0.07) !important;
              }
              .dark .border-red-200 {
                border-color: rgba(239,68,68,0.2) !important;
              }

              /* Ícones colored backgrounds */
              .dark .bg-orange-100 {
                background-color: rgba(249,115,22,0.12) !important;
              }
              .dark .bg-blue-100 {
                background-color: rgba(59,130,246,0.12) !important;
              }
              .dark .bg-green-100 {
                background-color: rgba(34,197,94,0.12) !important;
              }
              .dark .bg-purple-100 {
                background-color: rgba(168,85,247,0.12) !important;
              }
              .dark .bg-amber-100 {
                background-color: rgba(245,158,11,0.12) !important;
              }
              .dark .bg-red-100 {
                background-color: rgba(239,68,68,0.12) !important;
              }
              .dark .bg-cyan-100 {
                background-color: rgba(6,182,212,0.12) !important;
              }
              .dark .bg-indigo-100 {
                background-color: rgba(99,102,241,0.12) !important;
              }
              .dark .bg-teal-100 {
                background-color: rgba(20,184,166,0.12) !important;
              }
              .dark .bg-gray-100 {
                background-color: rgba(255,255,255,0.07) !important;
              }

              /* Inputs e selects */
              .dark input[type="text"],
              .dark input[type="email"],
              .dark textarea,
              .dark select {
                background-color: #1a1a1a !important;
                border-color: rgba(255,255,255,0.12) !important;
                color: #f0ede8 !important;
              }
              .dark input::placeholder,
              .dark textarea::placeholder {
                color: #5a5650 !important;
              }
              .dark select option {
                background-color: #1a1a1a !important;
              }

              /* Tabelas */
              .dark thead.bg-gray-50 {
                background-color: #1e1e1e !important;
              }
              .dark .divide-gray-100 > * {
                border-color: rgba(255,255,255,0.06) !important;
              }
              .dark tr.hover\:bg-gray-50\/50:hover {
                background-color: rgba(255,255,255,0.03) !important;
              }

              /* Badges coloridos */
              .dark .bg-orange-100.text-orange-700,
              .dark .bg-orange-100.text-orange-800 {
                background-color: rgba(249,115,22,0.12) !important;
                color: #fb923c !important;
              }
              .dark .bg-blue-100.text-blue-700,
              .dark .bg-blue-100.text-blue-800 {
                background-color: rgba(59,130,246,0.12) !important;
                color: #60a5fa !important;
              }
              .dark .bg-green-100.text-green-700,
              .dark .bg-green-100.text-green-800 {
                background-color: rgba(34,197,94,0.12) !important;
                color: #4ade80 !important;
              }
              .dark .bg-amber-100.text-amber-700,
              .dark .bg-amber-100.text-amber-800 {
                background-color: rgba(245,158,11,0.12) !important;
                color: #fbbf24 !important;
              }
              .dark .bg-red-100.text-red-700,
              .dark .bg-red-100.text-red-800 {
                background-color: rgba(239,68,68,0.12) !important;
                color: #f87171 !important;
              }
              .dark .bg-purple-100.text-purple-700,
              .dark .bg-purple-100.text-purple-800 {
                background-color: rgba(168,85,247,0.12) !important;
                color: #c084fc !important;
              }

              /* Secção escura (slate-900) — já está boa, mantém */
              .dark .bg-gradient-to-br.from-slate-900,
              .dark .bg-gradient-to-r.from-slate-900 {
                background: linear-gradient(135deg, #111, #1a1a1a) !important;
                border: 1px solid rgba(255,255,255,0.08) !important;
              }

              /* border-l colorida */
              .dark .border-l-4.border-orange-500 {
                border-left-color: #f97316 !important;
              }
              .dark .border-l-4.border-blue-500 {
                border-left-color: #3b82f6 !important;
              }

              /* Linha divisória */
              .dark .border-t.border-gray-200,
              .dark .border-t.border-gray-100 {
                border-color: rgba(255,255,255,0.07) !important;
              }

              /* Hover cards */
              .dark .hover\:shadow-lg:hover {
                box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
              }
              .dark .hover\:shadow-2xl:hover {
                box-shadow: 0 20px 50px rgba(0,0,0,0.6) !important;
              }

              /* bg-gray-50 rounded em secções */
              .dark .bg-gray-50.rounded-3xl,
              .dark .bg-gray-50.rounded-2xl {
                background-color: #161616 !important;
                border-color: rgba(255,255,255,0.07) !important;
              }

              /* Gradient from-slate-50 */
              .dark .bg-gradient-to-br.from-slate-50,
              .dark .bg-gradient-to-b.from-green-50,
              .dark .bg-gradient-to-b.from-amber-50,
              .dark .bg-gradient-to-b.from-red-50 {
                background: #1a1a1a !important;
              }

              /* Text colors específicos */
              .dark .text-orange-600 { color: #fb923c !important; }
              .dark .text-blue-600 { color: #60a5fa !important; }
              .dark .text-green-600 { color: #4ade80 !important; }
              .dark .text-purple-600 { color: #c084fc !important; }
              .dark .text-amber-600 { color: #fbbf24 !important; }
              .dark .text-red-600 { color: #f87171 !important; }
              .dark .text-cyan-600 { color: #22d3ee !important; }
              .dark .text-cyan-700 { color: #06b6d4 !important; }
              .dark .border-cyan-200 { border-color: rgba(6,182,212,0.2) !important; }

              /* Checkmark e X coloridos em tabelas */
              .dark .text-green-600.inline-flex { color: #4ade80 !important; }
              .dark .text-red-600.inline-flex { color: #f87171 !important; }

              /* bg-white/10 em secções escuras — mantém transparência */
              .dark .bg-white\/10 { background-color: rgba(255,255,255,0.06) !important; }
              .dark .bg-white\/20 { background-color: rgba(255,255,255,0.1) !important; }

              /* Stroke dos SVGs */
              .dark .text-blue-600 svg,
              .dark .text-green-600 svg,
              .dark .text-orange-600 svg {
                color: inherit !important;
              }
            `}</style>

            {children}
          </article>

          {/* ── RODAPÉ INTERNO ── */}
          <footer className="mt-20 pt-10 border-t border-gray-100 dark:border-white/7">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
                    <ChefHat className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{t('legalLayout.footer.title')}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-600">
                      © {new Date().getFullYear()} {t('legalLayout.footer.rights')}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-500 max-w-md">
                  {t('legalLayout.footer.description')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-300 mb-3">{t('legalLayout.language')}</p>
                  <select
                    className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-300 dark:border-white/12 rounded-lg px-4 py-2 text-sm text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                    onChange={handleLanguageChange}
                    value={i18n.language}
                  >
                    <option value="pt">Português</option>
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="it">Italiano</option>
                    <option value="ru">Русский</option>
                    <option value="zh">中文</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                    <option value="ar">العربية</option>
                    <option value="hi">हिन्दी</option>
                    <option value="tr">Türkçe</option>
                    <option value="pl">Polski</option>
                    <option value="nl">Nederlands</option>
                    <option value="sv">Svenska</option>
                    <option value="id">Bahasa Indonesia</option>
                    <option value="vi">Tiếng Việt</option>
                    <option value="th">ไทย</option>
                    <option value="uk">Українська</option>
                    <option value="cs">Čeština</option>
                    <option value="ro">Română</option>
                    <option value="hu">Magyar</option>
                    <option value="el">Ελληνικά</option>
                    <option value="he">עברית</option>
                    <option value="fa">فارسی</option>
                    <option value="bn">বাংলা</option>
                    <option value="sw">Kiswahili</option>
                    <option value="ms">Bahasa Melayu</option>
                  </select>
                </div>

                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-300 mb-3">{t('legalLayout.quickLinks')}</p>
                  <div className="flex flex-col gap-2">
                    <Link to="/privacy" className="text-sm text-gray-600 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                      {t('legalLayout.nav.privacy')}
                    </Link>
                    <Link to="/cookies" className="text-sm text-gray-600 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                      {t('legalLayout.nav.cookies')}
                    </Link>
                    <Link to="/accessibility" className="text-sm text-gray-600 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                      {t('legalLayout.accessibility')}
                    </Link>
                    <Link to="/terms" className="text-sm text-gray-600 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                      {t('legalLayout.nav.terms')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-white/6 text-center text-sm text-gray-500 dark:text-gray-600">
              <p>
                {t('legalLayout.legalContact', { email: 'centaurosa@gmail.com' })}{' '}
                <a href="mailto:centaurosa@gmail.com" className="text-orange-600 dark:text-orange-400 hover:underline">
                  centaurosa@gmail.com
                </a>
              </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default LegalLayout;