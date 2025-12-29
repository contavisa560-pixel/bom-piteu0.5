import LegalLayout from "./LegalLayout";

const PrivacyPolicy = () => {
  return (
    <LegalLayout
      title="Política de Privacidade"
      description="Saiba como o Bom Piteu trata seus dados para oferecer a melhor experiência gastronômica."
    >
      <section>
        <h2>O que é a Política de Privacidade e o que ela aborda?</h2>
        <p>
          Esta Política descreve as informações que processamos para apoiar o Bom Piteu. 
          Explicamos como coletamos, usamos e compartilhamos suas informações, garantindo total transparência.
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
        <h2>Quais informações coletamos?</h2>
        <p>Coletamos informações quando você cria sua conta, salva uma receita ou interage com a nossa comunidade:</p>
        <ul className="list-none space-y-4 !pl-0">
          <li className="flex gap-3 items-start p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            <span className="text-orange-500 font-bold">●</span>
            <div>
              <strong>Informações de Perfil:</strong> Nome, e-mail e preferências de dieta.
            </div>
          </li>
          <li className="flex gap-3 items-start p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            <span className="text-orange-500 font-bold">●</span>
            <div>
              <strong>Conteúdo gerado:</strong> Comentários em receitas e fotos de pratos enviados.
            </div>
          </li>
        </ul>
      </section>

      <section>
        <h2>Como usamos suas informações?</h2>
        <p>Usamos os dados para personalizar sua "Cozinha Inteligente", recomendando receitas que combinam com seu paladar e restrições alimentares.</p>
      </section>
    </LegalLayout>
  );
};

export default PrivacyPolicy;