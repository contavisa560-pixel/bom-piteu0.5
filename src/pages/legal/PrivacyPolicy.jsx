import LegalLayout from "./LegalLayout";

const PrivacyPolicy = () => {
  return (
    <LegalLayout
      title="Política de Privacidade"
      description="Saiba como o Bom Piteu trata seus dados para oferecer a melhor experiência gastronômica."
    >
      <section>
        <h2>A sua privacidade é fundamental para nós. Na <strong>Bom Piteu</strong>, comprometemo-nos a proteger os seus dados pessoais e a ser transparentes sobre a forma como os recolhemos e utilizamos.</h2>
        <h2><strong>1. Introdução</strong></h2>
        <p>
          Esta Política de Privacidade descreve as nossas práticas relativas à recolha, utilização e divulgação de informações quando utiliza a nossa aplicação e website. Ao aceder ou utilizar o Serviço, concorda com a recolha e utilização de informações de acordo com esta política.
        </p>

        {/* Opção extra: Accordion Style ou Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="p-6 border border-gray-100 rounded-2xl bg-slate-50">
            <h4 className="font-bold text-orange-600 mb-2">Seus Direitos</h4>
            <p className="text-sm">Acesse, corrija e apague seus dados a qualquer momento nas configurações.</p>
          </div>
          <div className="p-6 border border-gray-100 rounded-2xl bg-slate-50">
            <h4 className="font-bold text-orange-600 mb-2">Nossa Promessa</h4>
            <p className="text-sm">Nunca venderemos seus dados pessoais para terceiros ou anunciantes.</p>
          </div>
        </div>
      </section>

      <section>
        <h2><strong>2. Dados que recolhemos</strong></h2>
        <p>Coletamos informações quando você cria sua conta, salva uma receita ou interage com a nossa comunidade:</p>
        <ul className="list-none space-y-4 !pl-0">
          <li className="flex gap-3 items-start p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            <span className="text-orange-500 font-bold">●</span>
            <div>
              <strong>Informações de Perfil:</strong> Nome, endereço de email e número de telefone (opcional).
            </div>
          </li>
          <li className="flex gap-3 items-start p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            <span className="text-orange-500 font-bold">●</span>
            <div>
              <strong>Dados de Preferências:</strong> Restrições alimentares, alergias e preferências de ingredientes.
            </div>
          </li>
          <li className="flex gap-3 items-start p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            <span className="text-orange-500 font-bold">●</span>
            <div>
              <strong>Dados de Utilização</strong> Receitas visualizadas, ingredientes digitalizados e interações com a app.
            </div>
          </li>
          <li className="flex gap-3 items-start p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            <span className="text-orange-500 font-bold">●</span>
            <div>
              <strong>Dados Técnicos:</strong> Endereço IP, tipo de dispositivo, sistema operativo e dados de navegação.
            </div>
          </li>
        </ul>
      </section>

      <section>
        <h2><strong>3. Como utilizamos os seus dados</strong></h2>
        <p>Utilizamos as informações recolhidas para:</p>
        <p>Fornecer e manter o nosso Serviço;</p>
        <p>Personalizar a sua experiência e sugestões de receitas;</p>
        <p>Melhorar os nossos algoritmos de Inteligência Artificial;</p>
        <p>Comunicar consigo sobre atualizações, ofertas e suporte;</p>
        <p>Detetar, prevenir e resolver problemas técnicos.</p>
      </section>

      <section>
        <h2><strong>Partilha de Dados</strong></h2>
        <p>Não vendemos os seus dados pessoais a terceiros. Podemos partilhar informações com prestadores de serviços de confiança que nos ajudam a operar o nosso negócio (ex: alojamento cloud, análise de dados), sempre sob estritas obrigações de confidencialidade.</p>
      </section>
      <section>
        <h2><strong>5. Segurança</strong></h2>
        <p>A segurança dos seus dados é importante para nós, mas lembre-se que nenhum método de transmissão pela Internet ou método de armazenamento eletrónico é 100% seguro. Envidamos todos os esforços comercialmente aceitáveis para proteger os seus dados pessoais.</p>
      </section>
      <section>
        <h2><strong>6. Contacto</strong></h2>
        <p>Se tiver dúvidas sobre esta Política de Privacidade, contacte-nos através do email: privacidade@bompiteu.com.</p>
      </section>
    </LegalLayout>
  );
};

export default PrivacyPolicy;