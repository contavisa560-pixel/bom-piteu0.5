import LegalLayout from "./LegalLayout";

const TermsOfUse = () => {
  return (
    <LegalLayout
      title="Termos de Uso"
      description="Ao utilizar o Bom Piteu, você concorda com as regras de convivência e uso da nossa inteligência culinária."
    >
      <section>
        <h2>Bem-vindo ao Bom Piteu. Ao aceder à nossa plataforma, concorda com estes termos e condições de utilização. Por favor, leia-os atentamente.</h2>
        <p>
          <p> <strong>1. Aceitação dos Termos</strong> </p>
          Ao descarregar, instalar ou utilizar a aplicação Bom Piteu, ou ao aceder ao nosso website, concorda em ficar vinculado por estes Termos de Serviço. Se não concordar com qualquer parte dos termos, não poderá aceder ao Serviço.
        </p>
      </section>

      <section>
        <h2>
          <p><strong>2. Licença de Utilização</strong> </p>

          Modificar, copiar ou criar trabalhos derivados baseados no Serviço;
          Utilizar o Serviço para quaisquer fins ilegais ou não autorizados;
          Tentar obter acesso não autorizado aos nossos sistemas ou contas de outros utilizadores.

          <p><strong>3. Contas de Utilizador</strong></p>
        </h2>
        <p>
          Para aceder a certas funcionalidades, poderá ter de criar uma conta. É responsável por manter a confidencialidade da sua conta e palavra-passe e aceita a responsabilidade por todas as atividades que ocorram sob a sua conta..
        </p>
        <div className="bg-gray-100 border-l-4 border-orange-500 p-6 rounded-r-2xl my-6">
          <p className="text-sm italic font-medium">
            "É proibida a reprodução, cópia ou extração de dados (scraping) das nossas receitas para fins comerciais sem autorização prévia."
          </p>
        </div>
      </section>

      <section>
        <h2><strong>4. Conteúdo Gerado por IA</strong></h2>
        <p>O Serviço utiliza Inteligência Artificial para gerar receitas e sugestões. Embora nos esforcemos pela precisão, não garantimos que todas as receitas geradas sejam perfeitas ou adequadas para todos os gostos ou restrições dietéticas. Utilize o seu julgamento ao cozinhar.</p>
      </section>

      <section>
        <h2><strong>5. Propriedade Intelectual</strong></h2>
        <p>
          O Bom Piteu esforça-se por fornecer informações precisas, mas não nos responsabilizamos por alergias ou resultados culinários que não correspondam à expectativa, sendo o uso das receitas de inteira responsabilidade do utilizador.
        </p>
      </section>
      <section>
        <h2><strong>6. Alterações aos Termos</strong></h2>
        <p>
          Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. Se uma revisão for material, tentaremos fornecer um aviso prévio de pelo menos 30 dias antes de quaisquer novos termos entrarem em vigor.
        </p>
      </section>
    </LegalLayout>
  );
};

export default TermsOfUse;