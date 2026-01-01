import LegalLayout from "./LegalLayout";

const CookiesPolicy = () => {
  return (
    <LegalLayout
      title="Política de Cookies"
      description="Entenda como usamos cookies para tornar a sua experiência no Bom Piteu mais rápida e personalizada."
    >
      <section>
        <p>Esta Política de Cookies explica como a Bom Piteu utiliza cookies e tecnologias semelhantes para o reconhecer quando visita o nosso website ou utiliza a nossa app.</p>
        <h2><strong>O que são cookies?</strong></h2>
        <p>
          Cookies são pequenos ficheiros de dados que são colocados no seu computador ou dispositivo móvel quando visita um website. Os cookies são amplamente utilizados pelos proprietários de websites para fazer com que os seus websites funcionem, ou funcionem de forma mais eficiente, bem como para fornecer informações de relatórios.
        </p>
      </section>

      <section className="bg-orange-50/50 border border-orange-100 rounded-3xl p-8 my-12">
        <h2 className="!mt-0">Categorias de Cookies que Utilizamos</h2>
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h4 className="font-bold text-slate-900 mb-1"> Cookies Essenciais</h4>
            <p className="text-sm text-gray-500">Necessários para o funcionamento básico do site. Sem estes cookies, o site não funciona corretamente.</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h4 className="font-bold text-slate-900 mb-1"> Cookies de Desempenho</h4>
            <p className="text-sm text-gray-500">Recolhem informações sobre como os visitantes utilizam o site, ajudando-nos a melhorar a funcionalidade.</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h4 className="font-bold text-slate-900 mb-1"> Cookies Analíticos</h4>
            <p className="text-sm text-gray-500">Permitem-nos contar visitas e fontes de tráfego para medir e melhorar o desempenho do nosso site.</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h4 className="font-bold text-slate-900 mb-1"> Cookies de Marketing</h4>
            <p className="text-sm text-gray-500">Utilizados para rastrear visitantes em websites. A intenção é exibir anúncios relevantes para o utilizador individual..</p>
          </div>
        </div>
      </section>

      <section>
        <h2><strong>Como gerir os seus cookies?</strong></h2>
        <p>
         Tem o direito de decidir se aceita ou rejeita cookies. Pode definir ou alterar os controlos do seu navegador para aceitar ou recusar cookies. Se optar por rejeitar cookies, ainda poderá utilizar o nosso website, embora o seu acesso a algumas funcionalidades e áreas do nosso website possa ser restringido.
        </p>
      </section>
    </LegalLayout>
  );
};

export default CookiesPolicy;