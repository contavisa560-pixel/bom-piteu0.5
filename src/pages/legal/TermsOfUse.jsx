import LegalLayout from "./LegalLayout";
import { useTranslation, Trans } from 'react-i18next';

const TermsOfUse = () => {
  const { t } = useTranslation();

  return (
    <LegalLayout
      title={t('termsOfUse.title')}
      description={t('termsOfUse.description')}
    >
      <section>
        <Trans i18nKey="termsOfUse.section1">
          <h2>Bem-vindo ao Bom Piteu. Ao aceder à nossa plataforma, concorda com estes termos e condições de utilização. Por favor, leia-os atentamente.</h2>
        </Trans>

        <Trans i18nKey="termsOfUse.section1Sub1">
          <h3><strong>1. Aceitação dos Termos</strong></h3>
        </Trans>

        <Trans i18nKey="termsOfUse.section1Text">
          <p>Ao descarregar, instalar ou utilizar a aplicação Bom Piteu, ou ao aceder ao nosso website, concorda em ficar vinculado por estes Termos de Serviço. Se não concordar com qualquer parte dos termos, não poderá aceder ao Serviço.</p>
        </Trans>
      </section>

      <section>
        <Trans i18nKey="termsOfUse.section2Title">
          <h3><strong>2. Licença de Utilização</strong></h3>
        </Trans>

        <Trans i18nKey="termsOfUse.section2List">
          <ul>
            <li>Modificar, copiar ou criar trabalhos derivados baseados no Serviço;</li>
            <li>Utilizar o Serviço para quaisquer fins ilegais ou não autorizados;</li>
            <li>Tentar obter acesso não autorizado aos nossos sistemas ou contas de outros utilizadores.</li>
          </ul>
        </Trans>

        <Trans i18nKey="termsOfUse.section2After">
          <h3><strong>3. Contas de Utilizador</strong></h3>
        </Trans>

        <Trans i18nKey="termsOfUse.section3Text">
          <p>Para aceder a certas funcionalidades, poderá ter de criar uma conta. É responsável por manter a confidencialidade da sua conta e palavra-passe e aceita a responsabilidade por todas as atividades que ocorram sob a sua conta.</p>
        </Trans>

        <div className="bg-gray-100 border-l-4 border-orange-500 p-6 rounded-r-2xl my-6">
          <p className="text-sm italic font-medium">
            <Trans i18nKey="termsOfUse.quote">"É proibida a reprodução, cópia ou extração de dados (scraping) das nossas receitas para fins comerciais sem autorização prévia."</Trans>
          </p>
        </div>
      </section>

      <section>
        <Trans i18nKey="termsOfUse.section4Title">
          <h3><strong>4. Conteúdo Gerado por IA</strong></h3>
        </Trans>
        <Trans i18nKey="termsOfUse.section4Text">
          <p>O Serviço utiliza Inteligência Artificial para gerar receitas e sugestões. Embora nos esforcemos pela precisão, não garantimos que todas as receitas geradas sejam perfeitas ou adequadas para todos os gostos ou restrições dietéticas. Utilize o seu julgamento ao cozinhar.</p>
        </Trans>
      </section>

      <section>
        <Trans i18nKey="termsOfUse.section5Title">
          <h3><strong>5. Propriedade Intelectual</strong></h3>
        </Trans>
        <Trans i18nKey="termsOfUse.section5Text">
          <p>O Bom Piteu esforça-se por fornecer informações precisas, mas não nos responsabilizamos por alergias ou resultados culinários que não correspondam à expectativa, sendo o uso das receitas de inteira responsabilidade do utilizador.</p>
        </Trans>
      </section>

      <section>
        <Trans i18nKey="termsOfUse.section6Title">
          <h3><strong>6. Alterações aos Termos</strong></h3>
        </Trans>
        <Trans i18nKey="termsOfUse.section6Text">
          <p>Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. Se uma revisão for material, tentaremos fornecer um aviso prévio de pelo menos 30 dias antes de quaisquer novos termos entrarem em vigor.</p>
        </Trans>
      </section>
    </LegalLayout>
  );
};

export default TermsOfUse;