import LegalLayout from "./LegalLayout";

const DataDeletion = () => {
  return (
    <LegalLayout
      title="Exclusão de Dados"
      description="Como solicitamos, processamos e confirmamos a exclusão dos seus dados pessoais."
    >
      <section className="bg-white border border-gray-200 rounded-3xl p-10 mb-12">
        <h2 className="!mt-0 text-3xl font-semibold text-slate-900">
          Exclusão de Dados Pessoais
        </h2>
        <p className="text-lg text-slate-600 max-w-3xl mt-4">
          Em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD),
          pode solicitar a eliminação dos seus dados pessoais a qualquer momento.
          Processamos todos os pedidos num prazo máximo de 30 dias.
        </p>
      </section>


      <section>
        <h2>O Que é Excluído?</h2>

        <div className="space-y-4 my-8">
          <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
              OK
            </div>
            <div className="flex-1">
              <strong className="text-slate-900">Dados Pessoais</strong>
              <p className="text-sm text-gray-600 mt-1">Nome, email, telefone, data de nascimento</p>
            </div>
            <span className="text-xs font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">Imediato</span>
          </div>

          <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
              !
            </div>
            <div className="flex-1">
              <strong className="text-slate-900">Conteúdo Gerado</strong>
              <p className="text-sm text-gray-600 mt-1">Receitas, comentários, fotos (anónimo após 7 dias)</p>
            </div>
            <span className="text-xs font-medium bg-amber-100 text-amber-800 px-3 py-1 rounded-full">7 dias</span>
          </div>

          <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              i
            </div>
            <div className="flex-1">
              <strong className="text-slate-900">Dados Analíticos</strong>
              <p className="text-sm text-gray-600 mt-1">Estatísticas de uso anonimizadas</p>
            </div>
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">30 dias</span>
          </div>

          <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
              X
            </div>
            <div className="flex-1">
              <strong className="text-slate-900">Dados Financeiros</strong>
              <p className="text-sm text-gray-600 mt-1">Registos de pagamento (retenção legal: 10 anos)</p>
            </div>
            <span className="text-xs font-medium bg-red-100 text-red-800 px-3 py-1 rounded-full">Não excluído*</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 italic mt-4">
          *Dados financeiros são mantidos para cumprimento de obrigações legais e fiscais.
        </p>
      </section>

      <section>
        <h2>Como Solicitar a Exclusão?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-2xl"></div>
            <div className="pt-8 p-6 bg-white border border-gray-200 rounded-2xl">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 text-xl mb-4">
                1
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Configurações da Conta</h4>
              <p className="text-sm text-gray-600">
                Aceda a "Configurações" → "Privacidade" → "Excluir minha conta"
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-2xl"></div>
            <div className="pt-8 p-6 bg-white border border-gray-200 rounded-2xl">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-xl mb-4">
                2
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Formulário Online</h4>
              <p className="text-sm text-gray-600">
                Preencha o formulário de exclusão disponível na nossa Central
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-t-2xl"></div>
            <div className="pt-8 p-6 bg-white border border-gray-200 rounded-2xl">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 text-xl mb-4">
                3
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Email Direto</h4>
              <p className="text-sm text-gray-600">
                Envie um email para privacy@bompitieu.com com o assunto "Exclusão de Dados"
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>Processo de Exclusão</h2>

        <div className="relative my-12">
          {/* Timeline */}
          <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 via-amber-500 to-green-500"></div>
          <div className="space-y-12">
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold z-10">Dia 0</div>
              <div className="flex-1 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm md:ml-8">
                <h4 className="font-bold text-slate-900 mb-2">Solicitação Recebida</h4>
                <p className="text-sm text-gray-600">Recebemos e validamos o seu pedido. Enviamos um email de confirmação.</p>
              </div>
            </div>

            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold z-10">1-7</div>
              <div className="flex-1 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm md:mr-8 md:text-right">
                <h4 className="font-bold text-slate-900 mb-2">Análise e Backup</h4>
                <p className="text-sm text-gray-600">Criamos backup de segurança (30 dias) e iniciamos exclusão dos dados primários.</p>
              </div>
            </div>

            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold z-10">8-30</div>
              <div className="flex-1 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm md:ml-8">
                <h4 className="font-bold text-slate-900 mb-2">Exclusão Completa</h4>
                <p className="text-sm text-gray-600">Exclusão de todos os sistemas, logs e dados anónimos. Envio de confirmação final.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>Considerações Importantes</h2>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 my-8">
          <h4 className="font-bold text-slate-900 mb-4">
            Informações importantes antes de prosseguir
          </h4>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">•</span>
              <span>A exclusão é <strong>irreversível</strong>. Não poderá recuperar a sua conta ou dados.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">•</span>
              <span>Receitas partilhadas publicamente serão anonimizadas, mas mantidas na plataforma.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">•</span>
              <span>Subscrições ativas serão canceladas sem reembolso proporcional.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">•</span>
              <span>Pode optar por uma <strong>exportação dos seus dados</strong> antes da exclusão.</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="!mt-0">Pronto para prosseguir?</h3>
            <p className="text-gray-600">Escolha uma das opções abaixo</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-6 py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700">
              Solicitar Exclusão de Conta
            </button>
            <button className="px-6 py-3 bg-white border border-gray-300 text-gray-800 font-medium rounded-xl hover:bg-gray-50 transition-colors">
              Exportar Meus Dados Primeiro
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-6 text-center">
          Para assistência, contacte: <a href="mailto:suporte@bompiteu.com" className="text-orange-600 hover:underline">suport@bompiteu.com</a>
        </p>
      </section>
    </LegalLayout>
  );
};

export default DataDeletion;