import LegalLayout from "./LegalLayout";
import { useTranslation } from 'react-i18next';

const CookiesPolicy = () => {
  const { t } = useTranslation();

  return (
    <LegalLayout
      title={t('cookiesPolicy.title')}
      description={t('cookiesPolicy.description')}
    >
      <section>
        <p>{t('cookiesPolicy.intro')}</p>
        <h2><strong>{t('cookiesPolicy.whatAreCookies')}</strong></h2>
        <p>{t('cookiesPolicy.whatAreCookiesText')}</p>
      </section>

      <section className="bg-orange-50/50 border border-orange-100 rounded-3xl p-8 my-12">
        <h2 className="!mt-0">{t('cookiesPolicy.categoriesTitle')}</h2>
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h4 className="font-bold text-slate-900 mb-1">{t('cookiesPolicy.essential')}</h4>
            <p className="text-sm text-gray-500">{t('cookiesPolicy.essentialDesc')}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h4 className="font-bold text-slate-900 mb-1">{t('cookiesPolicy.performance')}</h4>
            <p className="text-sm text-gray-500">{t('cookiesPolicy.performanceDesc')}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h4 className="font-bold text-slate-900 mb-1">{t('cookiesPolicy.analytics')}</h4>
            <p className="text-sm text-gray-500">{t('cookiesPolicy.analyticsDesc')}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h4 className="font-bold text-slate-900 mb-1">{t('cookiesPolicy.marketing')}</h4>
            <p className="text-sm text-gray-500">{t('cookiesPolicy.marketingDesc')}</p>
          </div>
        </div>
      </section>

      <section>
        <h2><strong>{t('cookiesPolicy.manageTitle')}</strong></h2>
        <p>{t('cookiesPolicy.manageText')}</p>
      </section>
    </LegalLayout>
  );
};

export default CookiesPolicy;