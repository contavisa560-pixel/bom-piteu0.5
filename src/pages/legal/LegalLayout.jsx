import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
    ChefHat
} from "lucide-react";



const LegalLayout = ({ title, description, children }) => {
  const location = useLocation();

  // Links expandidos para a sidebar lateral
  const navLinks = [
    { name: "Página Inicial", path: "/legal", badge: "" },
    { name: "Privacidade", path: "/privacy", badge: "Atualizado" },
    { name: "Termos de Uso", path: "/terms", badge: "" },
    { name: "Política de Cookies", path: "/cookies", badge: "" },
    { name: "Comunidade", path: "/community", badge: "Novo" },
    { name: "Política de Pagamentos", path: "/payments", badge: "" },
    { name: "Ajuda & Suporte", path: "/support", badge: "" },
    { name: "Exclusão de Dados", path: "/data-deletion", badge: "" },
    { name: "Sobre Nós", path: "/about", badge: "" },
    { name: "Parcerias", path: "/partnerships", badge: "" },
  ];

  return (
    <div className="flex flex-col lg:flex-row bg-white h-screen w-screen fixed top-0 left-0 overflow-hidden">
      {/* Sidebar para Mobile - Hamburger Menu */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <ChefHat className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold"/>
            <span className="font-bold text-xl tracking-tight text-slate-800">Bom Piteu!</span>
          </div>
          <details className="relative">
            <summary className="list-none cursor-pointer p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </summary>
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4">
              <nav className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Central de Transparência</p>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${location.pathname === link.path
                        ? "bg-orange-50 text-orange-600 font-semibold"
                        : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{link.icon}</span>
                      <span className="text-sm">{link.name}</span>
                    </div>
                    {link.badge && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
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

      {/* Sidebar Lateral para Desktop */}
      <aside className="hidden lg:flex flex-col w-80 border-r border-gray-200 h-screen bg-white overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <ChefHat className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md"/>
            <div>
              <span className="font-bold text-2xl tracking-tight text-slate-900">Bom Piteu!</span>
              <p className="text-xs text-gray-500 mt-1">Cozinha Inteligente</p>
            </div>
          </div>

          <nav className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-3">Documentos Legais</p>
            {navLinks.slice(0, 4).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${location.pathname === link.path
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-50 hover:shadow-sm"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg ${location.pathname === link.path ? '' : 'group-hover:scale-110 transition-transform'}`}>
                    {link.icon}
                  </span>
                  <span className="font-medium">{link.name}</span>
                </div>
                {link.badge && (
                  <span className={`text-xs px-2 py-1 rounded-full ${location.pathname === link.path
                      ? 'bg-white/20 text-white'
                      : 'bg-orange-100 text-orange-700'
                    }`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-3 mt-8">Recursos Adicionais</p>
            {navLinks.slice(4).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${location.pathname === link.path
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-50 hover:shadow-sm"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg ${location.pathname === link.path ? '' : 'group-hover:scale-110 transition-transform'}`}>
                    {link.icon}
                  </span>
                  <span className="font-medium">{link.name}</span>
                </div>
                {link.badge && (
                  <span className={`text-xs px-2 py-1 rounded-full ${location.pathname === link.path
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-100 text-blue-700'
                    }`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto">
        {/* Banner de Cabeçalho */}
        <header className="border-b border-gray-100 py-12 md:py-16 px-6 lg:px-20 bg-gradient-to-br from-white via-orange-50/30 to-white">
          <div className="max-w-6xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <motion.h1
                  className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {title}
                </motion.h1>

                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="bg-orange-100 text-orange-700 text-xs font-medium px-3 py-1 rounded-full">
                    Documento Legal
                  </span>
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                    Versão 1.2
                  </span>
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                    Em vigor
                  </span>
                </div>
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-8">
              <Link to="/" className="hover:text-orange-500 transition-colors">
                Início
              </Link>
              <span>›</span>
              <Link to="/legal" className="hover:text-orange-500 transition-colors">
                Central de Transparência
              </Link>
              <span>›</span>
              <span className="text-orange-600 font-medium">{title}</span>
            </div>

          </div>
        </header>

        {/* Conteúdo do Artigo */}
        <div className="max-w-6xl px-6 lg:px-20 py-10 md:py-12">
          <article className="prose prose-slate prose-lg max-w-none 
            prose-headings:font-bold 
            prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-4
            prose-ul:!pl-6 prose-li:text-gray-700
            prose-strong:text-slate-900 prose-strong:font-bold">
            {children}
          </article>

          {/* Rodapé Interno */}
          <footer className="mt-20 pt-10 border-t border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <ChefHat className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-lg"/>
                  <div>
                    <p className="font-bold text-slate-900">Bom Piteu! · A tua Cozinha Inteligente</p>
                    <p className="text-sm text-gray-500">© {new Date().getFullYear()} Todos os direitos reservados</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 max-w-md">
                  Comprometidos com a transparência e a segurança dos nossos utilizadores.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <div>
                  <p className="font-medium text-gray-800 mb-3">Idioma</p>
                  <select className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option>Português (Portugal)</option>
                    <option>Português (Brasil)</option>
                    <option>English</option>
                    <option>Español</option>
                  </select>
                </div>
                <div>
                  <p className="font-medium text-gray-800 mb-3">Links Rápidos</p>
                  <div className="flex flex-col gap-2">
                    <a href="#" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">Privacidade</a>
                    <a href="#" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">Cookies</a>
                    <a href="#" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">Acessibilidade</a>
                    <a href="#" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">Termos</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
              <p>Para questões legais, contacte: <a href="mailto:suporte@bompiteu.com" className="text-orange-600 hover:underline">suporte@bompiteu.com</a></p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default LegalLayout;