import LegalLayout from "./LegalLayout";
import {
    HeartHandshake,
    ShoppingCart,
    Leaf,
    Stethoscope,
    BarChart3,
    Target,
    RefreshCcw
} from "lucide-react";


const Partnerships = () => {
    return (
        <LegalLayout
            title="Parcerias"
            description="Junte-se a nós na missão de transformar a alimentação em Portugal."
        >
            <section className="mb-12">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-3xl p-8 md:p-12">
                    <h2 className="!mt-0 text-blue-900 text-center flex items-center justify-center gap-3">
                        <HeartHandshake className="w-7 h-7" />
                        Trabalhe Connosco
                    </h2>


                    <p className="text-lg text-blue-800 text-center max-w-3xl mx-auto">
                        Valorizamos parcerias estratégicas com marcas que partilham a nossa visão
                        de uma alimentação mais saudável, sustentável e acessível.
                    </p>
                </div>
            </section>

            <section>
                <h2>Tipos de Parcerias</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                            <ShoppingCart size={28} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-3">Supermercados</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Integração direta com listas de compras e promoções personalizadas.
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                            <li>• Sync de preços em tempo real</li>
                            <li>• Campanhas exclusivas</li>
                            <li>• Dados de consumo anonimizados</li>
                        </ul>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                            <Leaf size={28} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-3">Marcas Alimentares</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Receitas destacadas com os seus produtos e campanhas segmentadas.
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                            <li>• Branded recipes</li>
                            <li>• Análise de mercado</li>
                            <li>• Testes de produtos</li>
                        </ul>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                            <BarChart3 size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-3">Saúde & Bem-Estar</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Parcerias com nutricionistas, ginásios e clínicas especializadas.
                        </p>
                        <ul className="text-xs text-gray-500 space-y-1">
                            <li>• Programas personalizados</li>
                            <li>• Referenciação cruzada</li>
                            <li>• Conteúdo especializado</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="bg-gray-50 rounded-3xl p-8 my-12">
                <h2>Parceiros Atuais</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                    <div className="bg-white h-24 rounded-xl flex items-center justify-center p-4">
                        <div className="text-2xl font-bold text-gray-400">Supermercado A</div>
                    </div>
                    <div className="bg-white h-24 rounded-xl flex items-center justify-center p-4">
                        <div className="text-2xl font-bold text-gray-400">Marca B</div>
                    </div>
                    <div className="bg-white h-24 rounded-xl flex items-center justify-center p-4">
                        <div className="text-2xl font-bold text-gray-400">Clínica C</div>
                    </div>
                    <div className="bg-white h-24 rounded-xl flex items-center justify-center p-4">
                        <div className="text-2xl font-bold text-gray-400">Ginásio D</div>
                    </div>
                </div>
            </section>

            <section>
                <h2>Vantagens de Ser Parceiro</h2>

                <div className="space-y-6 my-8">
                    <div className="flex items-start gap-4 p-6 bg-white border border-gray-200 rounded-2xl">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 flex-shrink-0">
                            <Target size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-2">Acesso a Dados de Mercado</h4>
                            <p className="text-gray-600">
                                Relatórios mensais sobre tendências alimentares, comportamentos de consumo e insights demográficos.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-6 bg-white border border-gray-200 rounded-2xl">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                            <Target size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-2">Segmentação Precisiva</h4>
                            <p className="text-gray-600">
                                Atinga o público certo com base em preferências alimentares, restrições dietéticas e hábitos de compra.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-6 bg-white border border-gray-200 rounded-2xl">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 flex-shrink-0">
                            <RefreshCcw size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-2">Integração Tecnológica</h4>
                            <p className="text-gray-600">
                                APIs dedicadas para sincronização de produtos, stocks e campanhas promocionais.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-12">
                <h2>Formulário de Contacto para Parcerias</h2>

                <div className="bg-white border border-gray-200 rounded-2xl p-8 my-8">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Sua empresa"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Setor de Atividade *</label>
                                <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                                    <option>Selecione o setor</option>
                                    <option>Supermercado/Retalho</option>
                                    <option>Indústria Alimentar</option>
                                    <option>Saúde & Nutrição</option>
                                    <option>Tecnologia</option>
                                    <option>Outro</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Contacto *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Seu nome"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="empresa@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Parceria Pretendida *</label>
                            <select multiple className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                                <option>Integração Tecnológica</option>
                                <option>Campanhas Promocionais</option>
                                <option>Co-branding</option>
                                <option>Patrocínio de Conteúdo</option>
                                <option>Programas Conjuntos</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-2">Mantenha Ctrl pressionado para selecionar múltiplas opções</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem *</label>
                            <textarea
                                rows="6"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                placeholder="Descreva a sua proposta de parceria..."
                                required
                            ></textarea>
                        </div>

                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="nda" className="w-4 h-4 text-blue-600 rounded" />
                            <label htmlFor="nda" className="text-sm text-gray-700">
                                Preciso de um acordo de confidencialidade (NDA) antes de partilhar detalhes
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg transition-shadow"
                        >
                            Enviar Proposta de Parceria
                        </button>
                    </form>
                </div>
            </section>

            <section className="mt-12 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl">
                        <h4 className="font-bold text-blue-900 mb-3">Contacto de Parcerias</h4>
                        <p className="text-sm text-blue-800">
                            <strong>Email:</strong> partnerships@bompitieu.com<br />
                            <strong>Telefone:</strong> +351 211 234 568
                        </p>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl">
                        <h4 className="font-bold text-orange-900 mb-3">Processo de Avaliação</h4>
                        <p className="text-sm text-orange-800">
                            Todas as propostas são avaliadas em 5-10 dias úteis. Entraremos em contacto para agendar uma reunião inicial.
                        </p>
                    </div>
                </div>
            </section>
        </LegalLayout>
    );
};

export default Partnerships;