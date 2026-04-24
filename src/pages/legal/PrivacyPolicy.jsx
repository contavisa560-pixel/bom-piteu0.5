import LegalLayout from "./LegalLayout";
import { useTranslation, Trans } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <LegalLayout
      title={t('privacyPolicy.title')}
      description={t('privacyPolicy.description')}
    >
      <section>
        <Trans i18nKey="privacyPolicy.intro">
          <h2>A sua privacidade é fundamental para nós. Na <strong>Bom Piteu</strong>, comprometemo-nos a proteger os seus dados pessoais e a ser transparentes sobre a forma como os recolhemos e utilizamos.</h2>
        </Trans>
        <Trans i18nKey="privacyPolicy.section1Title">
          <h2><strong>1. Introdução</strong></h2>
        </Trans>
        <Trans i18nKey="privacyPolicy.section1Text">
          <p>Esta Política de Privacidade descreve as nossas práticas relativas à recolha, utilização e divulgação de informações quando utiliza a nossa aplicação e website. Ao aceder ou utilizar o Serviço, concorda com a recolha e utilização de informações de acordo com esta política.</p>
        </Trans>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="p-6 border border-gray-100 rounded-2xl bg-slate-50">
            <h4 className="font-bold text-orange-600 mb-2">{t('privacyPolicy.rightsTitle')}</h4>
            <p className="text-sm">{t('privacyPolicy.rightsText')}</p>
          </div>
          <div className="p-6 border border-gray-100 rounded-2xl bg-slate-50">
            <h4 className="font-bold text-orange-600 mb-2">{t('privacyPolicy.promiseTitle')}</h4>
            <p className="text-sm">{t('privacyPolicy.promiseText')}</p>
          </div>
        </div>
      </section>

      <section>
        <Trans i18nKey="privacyPolicy.section2Title">
          <h2><strong>2. Dados que recolhemos</strong></h2>
        </Trans>
        <p>{t('privacyPolicy.section2Intro')}</p>
        <ul className="list-none space-y-4 !pl-0">
          <li className="flex gap-3 items-start p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            <span className="text-orange-500 font-bold">●</span>
            <div>
              <strong>{t('privacyPolicy.dataProfileTitle')}:</strong> {t('privacyPolicy.dataProfileText')}
            </div>
          </li>
          <li className="flex gap-3 items-start p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            <span className="text-orange-500 font-bold">●</span>
            <div>
              <strong>{t('privacyPolicy.dataPreferencesTitle')}:</strong> {t('privacyPolicy.dataPreferencesText')}
            </div>
          </li>
          <li className="flex gap-3 items-start p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            <span className="text-orange-500 font-bold">●</span>
            <div>
              <strong>{t('privacyPolicy.dataUsageTitle')}:</strong> {t('privacyPolicy.dataUsageText')}
            </div>
          </li>
          <li className="flex gap-3 items-start p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            <span className="text-orange-500 font-bold">●</span>
            <div>
              <strong>{t('privacyPolicy.dataTechnicalTitle')}:</strong> {t('privacyPolicy.dataTechnicalText')}
            </div>
          </li>
        </ul>
      </section>

      <section>
        <Trans i18nKey="privacyPolicy.section3Title">
          <h2><strong>3. Como utilizamos os seus dados</strong></h2>
        </Trans>
        <p>{t('privacyPolicy.section3Intro')}</p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>{t('privacyPolicy.use1')}</li>
          <li>{t('privacyPolicy.use2')}</li>
          <li>{t('privacyPolicy.use3')}</li>
          <li>{t('privacyPolicy.use4')}</li>
          <li>{t('privacyPolicy.use5')}</li>
        </ul>
      </section>

      <section>
        <Trans i18nKey="privacyPolicy.section4Title">
          <h2><strong>Partilha de Dados</strong></h2>
        </Trans>
        <p>{t('privacyPolicy.section4Text')}</p>
      </section>

      <section>
        <Trans i18nKey="privacyPolicy.section5Title">
          <h2><strong>5. Segurança</strong></h2>
        </Trans>
        <p>{t('privacyPolicy.section5Text')}</p>
      </section>

      <section>
        <Trans i18nKey="privacyPolicy.section6Title">
          <h2><strong>6. Contacto</strong></h2>
        </Trans>
        <Trans i18nKey="privacyPolicy.section6Text">
          <p>Se tiver dúvidas sobre esta Política de Privacidade, contacte-nos através do email: <a href="mailto:privacidade@bompiteu.com" className="text-orange-600 hover:underline">privacidade@bompiteu.com</a>.</p>
        </Trans>
      </section>
    </LegalLayout>
  );
};

export default PrivacyPolicy;