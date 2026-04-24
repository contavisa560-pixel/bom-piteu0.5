import LegalLayout from "./LegalLayout";
import { Brain, Users, RefreshCw, BarChart2, Rocket, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

    return (
        <LegalLayout
            title={t('about.title')}
            description={t('about.description')}
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
                    <h2 className="!mt-0 text-orange-900 text-center">{t('about.visionTitle')}</h2>
                    <p className="text-lg text-orange-800 text-center max-w-3xl mx-auto">
                        {t('about.visionText')}
                    </p>
                </div>
            </section>

            <section>
                <h2>{t('about.uniqueTitle')}</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
                    <div className="text-center p-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-6">
                            <Brain size={32} />
                        </div>
                        <h3 className="font-bold text-xl text-slate-900 mb-3">{t('about.unique1Title')}</h3>
                        <p className="text-gray-600">
                            {t('about.unique1Text')}
                        </p>
                    </div>

                    <div className="text-center p-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-6">
                            <Users size={32} />
                        </div>
                        <h3 className="font-bold text-xl text-slate-900 mb-3">{t('about.unique2Title')}</h3>
                        <p className="text-gray-600">
                            {t('about.unique2Text')}
                        </p>
                    </div>

                    <div className="text-center p-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-6">
                            <RefreshCw size={32} />
                        </div>
                        <h3 className="font-bold text-xl text-slate-900 mb-3">{t('about.unique3Title')}</h3>
                        <p className="text-gray-600">
                            {t('about.unique3Text')}
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 rounded-3xl p-8 my-12">
                <h2> <BarChart2 size={28} className="inline-block mr-2" />{t('about.impactTitle')}</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                    <div className="bg-white p-6 rounded-2xl text-center">
                        <p className="text-3xl font-bold text-orange-600">10K+</p>
                        <p className="text-sm text-gray-600 mt-2">{t('about.impact1')}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl text-center">
                        <p className="text-3xl font-bold text-blue-600">100K+</p>
                        <p className="text-sm text-gray-600 mt-2">{t('about.impact2')}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl text-center">
                        <p className="text-3xl font-bold text-green-600">30%</p>
                        <p className="text-sm text-gray-600 mt-2">{t('about.impact3')}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl text-center">
                        <p className="text-3xl font-bold text-purple-600">4.8</p>
                        <p className="text-sm text-gray-600 mt-2">{t('about.impact4')}</p>
                    </div>
                </div>
            </section>

            <section>
                <h2>{t('about.teamTitle')}</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full mx-auto mb-4"></div>
                        <h3 className="font-bold text-lg text-slate-900">{t('about.team1Name')}</h3>
                        <p className="text-sm text-orange-600 mb-2">{t('about.team1Role')}</p>
                        <p className="text-sm text-gray-600">
                            {t('about.team1Bio')}
                        </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full mx-auto mb-4"></div>
                        <h3 className="font-bold text-lg text-slate-900">{t('about.team2Name')}</h3>
                        <p className="text-sm text-blue-600 mb-2">{t('about.team2Role')}</p>
                        <p className="text-sm text-gray-600">
                            {t('about.team2Bio')}
                        </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full mx-auto mb-4"></div>
                        <h3 className="font-bold text-lg text-slate-900">{t('about.team3Name')}</h3>
                        <p className="text-sm text-green-600 mb-2">{t('about.team3Role')}</p>
                        <p className="text-sm text-gray-600">
                            {t('about.team3Bio')}
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-8 my-12">
                <h2 className="!mt-0 text-white"><Rocket size={28} className="inline-block mr-2" />
                    {t('about.missionTitle')}</h2>
                <p className="text-lg text-slate-200 mb-6">
                    {t('about.missionText')}
                </p>

                <div className="flex flex-wrap gap-4 mt-8">
                    <span className="bg-white/10 px-4 py-2 rounded-lg text-sm">{t('about.value1')}</span>
                    <span className="bg-white/10 px-4 py-2 rounded-lg text-sm">{t('about.value2')}</span>
                    <span className="bg-white/10 px-4 py-2 rounded-lg text-sm">{t('about.value3')}</span>
                    <span className="bg-white/10 px-4 py-2 rounded-lg text-sm">{t('about.value4')}</span>
                    <span className="bg-white/10 px-4 py-2 rounded-lg text-sm">{t('about.value5')}</span>
                </div>
            </section>

            <section className="mt-12 pt-8 border-t border-gray-200">
                <h3><MapPin size={28} className="inline-block mr-2" />
                    {t('about.locationTitle')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    <div className="bg-gray-50 p-6 rounded-2xl">
                        <h4 className="font-bold text-gray-800 mb-4">{t('about.headquarters')}</h4>
                        <p className="text-gray-600">
                            {t('about.address')}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            {t('about.hours')}
                        </p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl">
                        <h4 className="font-bold text-gray-800 mb-4">{t('about.contacts')}</h4>
                        <p className="text-gray-600">
                            <strong>{t('about.emailLabel')}:</strong> centaurosa@gmail.com<br />
                            <strong>{t('about.phoneLabel')}:</strong> +244 958 999 999<br />
                            <strong>{t('about.nifLabel')}:</strong> 500 281 546 6
                        </p>
                    </div>
                </div>
            </section>
        </LegalLayout>
    );
};

export default About;