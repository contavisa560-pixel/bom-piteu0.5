import LegalLayout from "./LegalLayout";
import {
    FileBarChart,
    Users,
    CreditCard,
    Trash2,
    Award,
    ShieldCheck,
    Lock,
    Star,
    Leaf
} from "lucide-react";


const LegalCentral = () => {
    return (
        <LegalLayout
            title="Central de Transparência"
            description="Transparência total na gestão dos seus dados e operações da nossa plataforma."
        >
            {/* Hero Section com Vídeo Background */}
            <section className="relative mb-16 overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-amber-600/90 z-10"></div>

                {/* Vídeo Background */}
                <div className="absolute inset-0 z-0">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src="https://assets.mixkit.co/videos/preview/mixkit-cooking-ingredients-in-a-kitchen-41747-large.mp4" type="video/mp4" />
                    </video>
                </div>

                <div className="relative z-20 p-12 text-white">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-3 mb-6 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">Certificado ISO 27001 & GDPR Compliant</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            Transparência <span className="text-amber-200">Total</span> em Cada Pixel
                        </h1>

                        <p className="text-xl text-white/90 mb-8 max-w-3xl">
                            No Bom Piteu, acreditamos que a confiança é construída através da clareza absoluta.
                            Explore como protegemos, processamos e respeitamos os seus dados em cada interação.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button className="px-8 py-3 bg-white text-orange-700 font-semibold rounded-xl hover:bg-gray-100 transition-all hover:scale-105">
                                Documentos Legais
                            </button>
                            <button className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
                                Relatório de Transparência 2025
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cards de Destaque com Ícones SVG */}
            <section className="mb-20">
                <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Compromissos Fundamentais</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Segurança de Dados</h3>
                        <p className="text-gray-600 mb-4">
                            Encriptação AES-256, autenticação multi-fator e monitorização 24/7 dos nossos sistemas.
                        </p>
                        <div className="text-sm text-blue-600 font-medium">Nível de Segurança: Militar</div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Privacidade por Design</h3>
                        <p className="text-gray-600 mb-4">
                            Implementamos princípios de privacidade desde a fase de conceção de todos os nossos produtos.
                        </p>
                        <div className="text-sm text-green-600 font-medium">Certificado Privacy by Design</div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Compliance Total</h3>
                        <p className="text-gray-600 mb-4">
                            Conformidade total com RGPD, CCPA, LGPD e outras regulamentações internacionais de proteção de dados.
                        </p>
                        <div className="text-sm text-purple-600 font-medium">100% Compliant Global</div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Auditorias Regulares</h3>
                        <p className="text-gray-600 mb-4">
                            Auditorias independentes trimestrais e relatórios públicos de segurança disponíveis para análise.
                        </p>
                        <div className="text-sm text-orange-600 font-medium">Última Auditoria: Dez 2025</div>
                    </div>
                </div>
            </section>

            {/* Documentos Principais com Ícones Profissionais */}
            <section className="mb-20">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Documentação Legal Completa</h2>
                        <p className="text-gray-600 max-w-2xl">
                            Acesso a todos os nossos documentos legais, constantemente atualizados e disponíveis em múltiplos formatos.
                        </p>
                    </div>
                    <div className="mt-4 lg:mt-0">
                        <button className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Baixar Todos (PDF)
                            </span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Documento 1 */}
                    <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-8 hover:border-orange-300 transition-all">
                        <div className="flex items-start gap-6">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xl font-bold text-slate-900">Política de Privacidade</h3>
                                    <span className="text-xs font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Versão 4.2</span>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Documento detalhado explicando como recolhemos, processamos, armazenamos e protegemos os seus dados pessoais.
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                            Última atualização: 28/12/2025
                                        </span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Ver Online</button>
                                        <button className="text-sm text-gray-600 hover:text-gray-800 font-medium">PDF</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documento 2 */}
                    <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-8 hover:border-orange-300 transition-all">
                        <div className="flex items-start gap-6">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xl font-bold text-slate-900">Termos de Serviço</h3>
                                    <span className="text-xs font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">Versão 3.1</span>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Acordo legal que estabelece os direitos e responsabilidades entre si e o Bom Piteu.
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                            Vigente desde: 15/11/2025
                                        </span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button className="text-sm text-green-600 hover:text-green-700 font-medium">Ver Online</button>
                                        <button className="text-sm text-gray-600 hover:text-gray-800 font-medium">PDF</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid de Documentos Secundários */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                    {[
                        { title: "Política de Cookies", icon: FileBarChart, color: "bg-amber-500", version: "2.3" },
                        { title: "Diretrizes da Comunidade", icon: Users, color: "bg-purple-500", version: "1.8" },
                        { title: "Política de Pagamentos", icon: CreditCard, color: "bg-blue-500", version: "3.0" },
                        { title: "Exclusão de Dados", icon: Trash2, color: "bg-red-500", version: "2.1" },
                    ].map((doc, index) => (

                        <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                            <div className={`w-12 h-12 ${doc.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                                <doc.icon className="w-6 h-6" />
                            </div>

                            <h4 className="font-bold text-slate-900 mb-2">{doc.title}</h4>
                            <p className="text-sm text-gray-600 mb-3">Versão {doc.version}</p>
                            <button className="text-sm text-gray-700 hover:text-orange-600 font-medium">
                                Aceder Documento →
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Dashboard de Transparência com Gráficos */}
            <section className="mb-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-10">
                <h2 className="text-3xl font-bold text-white mb-10">Dashboard de Transparência</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Métrica 1 */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg">Tempo de Resposta a Incidentes</h3>
                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-bold mb-2">15min</div>
                            <p className="text-sm text-slate-300">Média de resposta a incidentes de segurança</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/20">
                            <div className="flex items-center justify-between text-sm">
                                <span>Meta: 30min</span>
                                <span className="text-green-400">-50%</span>
                            </div>
                        </div>
                    </div>

                    {/* Métrica 2 */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg">Pedidos de Dados Processados</h3>
                            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-bold mb-2">2,847</div>
                            <p className="text-sm text-slate-300">Pedidos de acesso/exclusão em 2025</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/20">
                            <div className="flex items-center justify-between text-sm">
                                <span>Tempo médio: 2.3 dias</span>
                                <span className="text-green-400">98% dentro do prazo</span>
                            </div>
                        </div>
                    </div>

                    {/* Métrica 3 */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg">Uptime do Serviço</h3>
                            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-bold mb-2">99.97%</div>
                            <p className="text-sm text-slate-300">Disponibilidade nos últimos 12 meses</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/20">
                            <div className="flex items-center justify-between text-sm">
                                <span>SLA Garantido: 99.9%</span>
                                <span className="text-green-400">+0.07%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Equipa de Proteção de Dados */}
            <section className="mb-20">
                <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Equipa de Proteção de Dados</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                        <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full mx-auto mb-6 relative">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400"></div>
                            <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                                <svg className="w-16 h-16 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Dr. Miguel Santos</h3>
                        <p className="text-blue-600 font-medium mb-4">Encarregado de Proteção de Dados (DPO)</p>
                        <p className="text-gray-600 mb-6">
                            Com 15 anos de experiência em compliance de dados e certificações CIPP/E e CIPM.
                        </p>
                        <a href="mailto:dpo@bompitieu.com" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                            dpo@bompitieu.com
                        </a>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                        <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full mx-auto mb-6 relative">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-400"></div>
                            <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                                <svg className="w-16 h-16 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Dra. Sofia Almeida</h3>
                        <p className="text-green-600 font-medium mb-4">Chefe de Segurança da Informação</p>
                        <p className="text-gray-600 mb-6">
                            Especialista em cibersegurança com certificações CISSP e CISM, ex-consultora da PwC.
                        </p>
                        <a href="mailto:security@bompitieu.com" className="text-green-600 hover:text-green-700 font-medium text-sm">
                            security@bompitieu.com
                        </a>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                        <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-violet-400 rounded-full mx-auto mb-6 relative">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-violet-400"></div>
                            <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                                <svg className="w-16 h-16 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Eng. Ricardo Costa</h3>
                        <p className="text-purple-600 font-medium mb-4">Diretor de Conformidade Legal</p>
                        <p className="text-gray-600 mb-6">
                            Advogado especializado em direito digital e proteção de dados, mestre em Direito da UE.
                        </p>
                        <a href="mailto:compliance@bompitieu.com" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                            compliance@bompitieu.com
                        </a>
                    </div>
                </div>
            </section>

            {/* Certificações e Reconhecimentos */}
            <section className="mb-20">
                <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Certificações & Reconhecimentos</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center justify-center">
                        <div className="text-center">
                            <Award className="w-10 h-10 mx-auto mb-2 text-amber-600" />
                            <p className="text-sm font-medium text-gray-800">ISO 27001</p>

                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center justify-center">
                        <div className="text-center">
                             <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-amber-600" />
                            <p className="text-sm font-medium text-gray-800">GDPR Certified</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center justify-center">
                        <div className="text-center">
                            <Lock className="w-10 h-10 mx-auto mb-2 text-amber-600" />
                            <p className="text-sm font-medium text-gray-800">SOC 2 Type II</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center justify-center">
                        <div className="text-center">
                            <Award className="w-10 h-10 mx-auto mb-2 text-amber-600" />
                            <p className="text-sm font-medium text-gray-800">Best Startup 2024</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center justify-center">
                        <div className="text-center">
                            <Star className="w-10 h-10 mx-auto mb-2 text-amber-600" />
                            <p className="text-sm font-medium text-gray-800">4.9/5 Trustpilot</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center justify-center">
                        <div className="text-center">
                              <Leaf className="w-10 h-10 mx-auto mb-2 text-amber-600" />
                            <p className="text-sm font-medium text-gray-800">Eco-Friendly</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-12 text-center">
                <h2 className="text-3xl font-bold text-white mb-6">A Transparência Não É Uma Opção, É Um Compromisso</h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                    Estamos disponíveis para esclarecer qualquer dúvida sobre as nossas políticas,
                    práticas de segurança ou gestão de dados.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-8 py-3 bg-white text-orange-700 font-semibold rounded-xl hover:bg-gray-100 transition-all">
                        Agendar Reunião com DPO
                    </button>
                    <button className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
                        Pedir Relatório Personalizado
                    </button>
                </div>

                <div className="mt-10 pt-8 border-t border-white/20">
                    <p className="text-white/80">
                        <strong>Horário de Contacto DPO:</strong> Segunda a Sexta, 9h00-18h00 (GMT) |
                        <strong> Emergências:</strong> +351 211 234 568 (24/7)
                    </p>
                </div>
            </section>
        </LegalLayout>
    );
};

export default LegalCentral;