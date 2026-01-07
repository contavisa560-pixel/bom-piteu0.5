import LegalLayout from "./LegalLayout";
import { Brain, Users, RefreshCw, BarChart2, Rocket, MapPin } from "lucide-react";
import { motion } from "framer-motion";
const CentaurusAIcon = ({ className }) => (
    <svg
        viewBox="0 0 120 104"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
    >
        {/* Contorno do A */}
        <path
            d="M60 4 L116 100 H4 L60 4 Z"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinejoin="round"
        />

        {/* Barra superior azul */}
        <rect
            x="44"
            y="38"
            width="32"
            height="6"
            fill="#22d3ee"
            rx="2"
        />
    </svg>
);



const About = () => {
    return (
        <LegalLayout
            title="Sobre Nós"
            description="Conheça a história, missão e equipa por trás do Bom Piteu."
        >
            {/* LOGOTIPO CENTAURUS OFICIAL */}
            <section className="relative mb-16 flex justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="absolute -top-14 md:-top-18 z-20"
                >
                    <div className="flex items-center gap-4 text-slate-500">

                        <span className="text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.28em]">
                            C
                        </span>

                        <span className="text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.28em]">
                            ENT
                        </span>

                        {/* A estilizado central */}
                        <CentaurusAIcon className="w-7 sm:w-8 md:w-9 text-slate-400" />

                        <span className="text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.28em]">
                            URUS
                        </span>

                        {/* A estilizado final */}
                        <CentaurusAIcon className="w-7 sm:w-8 md:w-9 text-slate-400 opacity-80" />

                    </div>

                    {/* Linha premium */}
                    <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                </motion.div>
            </section>

            <section className="mb-12">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-3xl p-8 md:p-12">
                    <h2 className="!mt-0 text-orange-900 text-center">Visão & Compromisso</h2>
                    <p className="text-lg text-orange-800 text-center max-w-3xl mx-auto">
                        A Centaurus A nasceu em 2025 com uma missão clara: democratizar a cozinha inteligente. Acreditamos que a tecnologia deve servir para unir pessoas, combater o desperdício e celebrar a cultura gastronómica local e global.
                    </p>
                </div>
            </section>

            <section>
                <h2>O Que Nos Torna Únicos</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
                    <div className="text-center p-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-6">
                            <Brain size={32} />
                        </div>
                        <h3 className="font-bold text-xl text-slate-900 mb-3">IA Personalizada</h3>
                        <p className="text-gray-600">
                            A única plataforma que aprende com os seus gostos e restrições para criar receitas verdadeiramente personalizadas.
                        </p>
                    </div>

                    <div className="text-center p-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-6">
                            <Users size={32} />
                        </div>
                        <h3 className="font-bold text-xl text-slate-900 mb-3">Para toda Família </h3>
                        <p className="text-gray-600">
                            Criado por angolanos, para o mundo. Focamos nos ingredientes e tradições da nossa gastronomia.
                        </p>
                    </div>

                    <div className="text-center p-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-6">
                            <RefreshCw size={32} />
                        </div>
                        <h3 className="font-bold text-xl text-slate-900 mb-3">Zero Desperdício</h3>
                        <p className="text-gray-600">
                            O nosso algoritmo cria receitas baseadas nos ingredientes que já tem em casa, reduzindo o desperdício alimentar.
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 rounded-3xl p-8 my-12">
                <h2> <BarChart2 size={28} className="inline-block mr-2" />O Nosso Impacto</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                    <div className="bg-white p-6 rounded-2xl text-center">
                        <p className="text-3xl font-bold text-orange-600">10K+</p>
                        <p className="text-sm text-gray-600 mt-2">Utilizadores Ativos</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl text-center">
                        <p className="text-3xl font-bold text-blue-600">100K+</p>
                        <p className="text-sm text-gray-600 mt-2">Receitas Geradas</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl text-center">
                        <p className="text-3xl font-bold text-green-600">30%</p>
                        <p className="text-sm text-gray-600 mt-2">Redução Desperdício</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl text-center">
                        <p className="text-3xl font-bold text-purple-600">4.8</p>
                        <p className="text-sm text-gray-600 mt-2">Avaliação Média</p>
                    </div>
                </div>
            </section>

            <section>
                <h2>A Nossa Equipa:</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full mx-auto mb-4"></div>
                        <h3 className="font-bold text-lg text-slate-900">Joaquim Carruagem</h3>
                        <p className="text-sm text-orange-600 mb-2">CEO & Fundador</p>
                        <p className="text-sm text-gray-600">
                            Chef profissional com 10 anos de experiência e paixão por tecnologia.
                        </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full mx-auto mb-4"></div>
                        <h3 className="font-bold text-lg text-slate-900"> Santos Pedro </h3>
                        <p className="text-sm text-blue-600 mb-2">Lead Software Architect</p>
                        <p className="text-sm text-gray-600">
                            Arquiteto de Sistemas escaláveis e especialista em infraestrutura de dados.
                        </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full mx-auto mb-4"></div>
                        <h3 className="font-bold text-lg text-slate-900">Mauricio Carruagem</h3>
                        <p className="text-sm text-green-600 mb-2">Product Engineer</p>
                        <p className="text-sm text-gray-600">
                            Engenheiro de Produto focado em interfaces de alta fidelidade e otimização da jornada do usuário.
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-8 my-12">
                <h2 className="!mt-0 text-white"><Rocket size={28} className="inline-block mr-2" />
                    A Nossa Missão</h2>
                <p className="text-lg text-slate-200 mb-6">
                    Democratizar o acesso à alimentação saudável e sustentável no mundo,
                    utilizando tecnologia de ponta para criar soluções personalizadas que se
                    adaptam à vida de cada família.
                </p>

                <div className="flex flex-wrap gap-4 mt-8">
                    <span className="bg-white/10 px-4 py-2 rounded-lg text-sm">Inovação</span>
                    <span className="bg-white/10 px-4 py-2 rounded-lg text-sm">Sustentabilidade</span>
                    <span className="bg-white/10 px-4 py-2 rounded-lg text-sm">Saúde</span>
                    <span className="bg-white/10 px-4 py-2 rounded-lg text-sm">Tradição</span>
                    <span className="bg-white/10 px-4 py-2 rounded-lg text-sm">Comunidade</span>
                </div>
            </section>

            <section className="mt-12 pt-8 border-t border-gray-200">
                <h3><MapPin size={28} className="inline-block mr-2" />
                    Onde Estamos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    <div className="bg-gray-50 p-6 rounded-2xl">
                        <h4 className="font-bold text-gray-800 mb-4">Sede Principal</h4>
                        <p className="text-gray-600">
                            Benfica, Zona verde 3<br />
                            0000-000 Luanda, Angola
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Segunda a Sexta: 9h00 - 18h00
                        </p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl">
                        <h4 className="font-bold text-gray-800 mb-4">Contactos Empresariais</h4>
                        <p className="text-gray-600">
                            <strong>Email:</strong> centaurosa@gmail.com<br />
                            <strong>Telefone:</strong> +244 958 999 999<br />
                            <strong>NIF:</strong> PT 123 456 789
                        </p>
                    </div>
                </div>
            </section>
        </LegalLayout>
    );
};

export default About;