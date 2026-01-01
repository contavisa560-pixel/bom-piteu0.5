import LegalLayout from "./LegalLayout";

const Support = () => {
  return (
    <LegalLayout
      title="Ajuda & Suporte"
      description="Encontre respostas rápidas, tutoriais e formas de contactar a nossa equipa."
    >
      <section className="bg-gradient-to-r bg-white border border-gray-200 border border-cyan-100 rounded-3xl p-8 mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="!mt-0 text-slate-900 text-3xl font-semibold">
              Suporte profissional, rápido e humano
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl">
              Obtenha ajuda especializada a qualquer momento através dos nossos canais oficiais.
            </p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-cyan-200 shadow-sm">
            <p className="text-sm font-medium text-cyan-700">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Suporte Online: Disponível
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>Perguntas Frequentes (FAQ)</h2>

        <div className="space-y-4 my-8">
          {[
            {
              q: "Como redefinir a minha password?",
              a: "Aceda à página de login, clique em 'Esqueci a password' e siga as instruções enviadas para o seu email."
            },
            {
              q: "Posso usar a mesma conta em vários dispositivos?",
              a: "Sim, pode aceder à sua conta em até 5 dispositivos simultaneamente."
            },
            {
              q: "Como cancelar a minha subscrição Premium?",
              a: "Vá a Configurações → Subscrição → Cancelar Subscrição. O cancelamento é efetivo no final do período pago."
            },
            {
              q: "A aplicação está disponível offline?",
              a: "Sim, pode descarregar até 50 receitas para acesso offline na versão Premium."
            }
          ].map((faq, index) => (
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

      <section>
        <h2>Canais de Suporte</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <div className="bg-gradient-to-b bg-white border border-gray-200
          border border-orange-100 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 text-2xl mx-auto mb-4">
              Chat
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Chat em Tempo Real</h4>
            <p className="text-sm text-gray-600 mb-4">Resposta em menos de 5 minutos</p>
            <button className="w-full py-3 bg-orange-600 hover:bg-orange-700 transition-colors
           text-white font-medium rounded-xl hover:shadow-md transition-shadow">
              Iniciar Chat
            </button>
          </div>

          <div className="bg-gradient-to-b from-blue-50 to-white border border-blue-100 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-2xl mx-auto mb-4">
              SMS
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Email de Suporte</h4>
            <p className="text-sm text-gray-600 mb-4">Resposta em 24 horas</p>
            <a href="mailto:suporte@bompiteu.com" className="block w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl hover:shadow-md transition-shadow">
              suporte@bompiteu.com
            </a>
          </div>

          <div className="bg-gradient-to-b bg-white border border-gray-200
           border border-purple-100 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 text-2xl mx-auto mb-4">
              TEL
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Telefone</h4>
            <p className="text-sm text-gray-600 mb-4">Seg-Sex, 9h-18h (GMT)</p>
            <a href="tel:+244958999999" className="block w-full py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium rounded-xl hover:shadow-md transition-shadow">
              +244 958 999 999
            </a>
          </div>
        </div>
      </section>

      <section>
        <h2>Formulário de Contacto</h2>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 my-8">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  placeholder="O seu nome"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assunto *</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none">
                <option>Selecione uma opção</option>
                <option>Problemas Técnicos</option>
                <option>Questões de Pagamento</option>
                <option>Privacidade e Dados</option>
                <option>Sugestões</option>
                <option>Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem *</label>
              <textarea
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                placeholder="Descreva o seu problema ou questão em detalhe..."
                required
              ></textarea>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="urgent" className="w-4 h-4 text-orange-600 rounded" />
              <label htmlFor="urgent" className="text-sm text-gray-700">
                Marque se este assunto é urgente
              </label>
            </div>

            <button
              type="submit"
              className="px-8 py-4 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors"
            >
              Enviar pedido de suporte
            </button>
          </form>
        </div>
      </section>

      <section>
        <h2>Recursos Úteis</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
          {[
            { title: "Guia de Início Rápido", icon: "🚀", color: "bg-blue-100 text-blue-600" },
            { title: "Tutoriais em Vídeo", icon: "🎬", color: "bg-purple-100 text-purple-600" },
            { title: "Base de Conhecimento", icon: "📚", color: "bg-green-100 text-green-600" },
            { title: "Comunidade", icon: "👥", color: "bg-orange-100 text-orange-600" },
          ].map((resource, index) => (
            <a
              key={index}
              href="#"
              className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col items-center text-center hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 ${resource.color} rounded-xl flex items-center justify-center text-xl mb-3`}>
                {resource.icon}
              </div>
              <span className="font-medium text-gray-800">{resource.title}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="!mt-0 text-slate-900">
              Estatísticas de Suporte
            </h3>
            <p className="text-gray-600">Nossos números falam por nós</p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">98%</p>
              <p className="text-sm text-gray-600">Satisfação</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">&lt;5min</p>
              <p className="text-sm text-gray-600">Tempo de Resposta</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">24/7</p>
              <p className="text-sm text-gray-600">Disponibilidade</p>
            </div>
          </div>
        </div>
      </section>
    </LegalLayout>
  );
};

export default Support;