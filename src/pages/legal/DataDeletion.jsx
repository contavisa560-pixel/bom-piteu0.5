import LegalLayout from "./LegalLayout";
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const DataDeletion = () => {
  const { t } = useTranslation();

  return (
    <LegalLayout
      title={t('dataDeletion.title')}
      description={t('dataDeletion.description')}
    >
      <section className="bg-white border border-gray-200 rounded-3xl p-10 mb-12">
        <h2 className="!mt-0 text-3xl font-semibold text-slate-900">
          {t('dataDeletion.personalDataTitle')}
        </h2>
        <p className="text-lg text-slate-600 max-w-3xl mt-4">
          {t('dataDeletion.personalDataText')}
        </p>
      </section>

      <section>
        <h2>{t('dataDeletion.whatIsDeleted')}</h2>

        <div className="space-y-4 my-8">
          <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
              OK
            </div>
            <div className="flex-1">
              <strong className="text-slate-900">{t('dataDeletion.personalData')}</strong>
              <p className="text-sm text-gray-600 mt-1">{t('dataDeletion.personalDataExamples')}</p>
            </div>
            <span className="text-xs font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">{t('dataDeletion.immediate')}</span>
          </div>

          <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
              !
            </div>
            <div className="flex-1">
              <strong className="text-slate-900">{t('dataDeletion.userContent')}</strong>
              <p className="text-sm text-gray-600 mt-1">{t('dataDeletion.userContentExamples')}</p>
            </div>
            <span className="text-xs font-medium bg-amber-100 text-amber-800 px-3 py-1 rounded-full">{t('dataDeletion.after7days')}</span>
          </div>

          <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              i
            </div>
            <div className="flex-1">
              <strong className="text-slate-900">{t('dataDeletion.analyticsData')}</strong>
              <p className="text-sm text-gray-600 mt-1">{t('dataDeletion.analyticsExamples')}</p>
            </div>
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{t('dataDeletion.after30days')}</span>
          </div>

          <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-xl">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
              X
            </div>
            <div className="flex-1">
              <strong className="text-slate-900">{t('dataDeletion.financialData')}</strong>
              <p className="text-sm text-gray-600 mt-1">{t('dataDeletion.financialExamples')}</p>
            </div>
            <span className="text-xs font-medium bg-red-100 text-red-800 px-3 py-1 rounded-full">{t('dataDeletion.notDeleted')}</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 italic mt-4">
          *{t('dataDeletion.financialNote')}
        </p>
      </section>

      <section>
        <h2>{t('dataDeletion.howToRequest')}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-2xl"></div>
            <div className="pt-8 p-6 bg-white border border-gray-200 rounded-2xl">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 text-xl mb-4">
                1
              </div>
              <h4 className="font-bold text-slate-900 mb-2">{t('dataDeletion.accountSettings')}</h4>
              <p className="text-sm text-gray-600">
                {t('dataDeletion.accountSettingsDesc')}
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-2xl"></div>
            <div className="pt-8 p-6 bg-white border border-gray-200 rounded-2xl">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-xl mb-4">
                2
              </div>
              <h4 className="font-bold text-slate-900 mb-2">{t('dataDeletion.onlineForm')}</h4>
              <p className="text-sm text-gray-600">
                {t('dataDeletion.onlineFormDesc')}
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-violet-500 rounded-t-2xl"></div>
            <div className="pt-8 p-6 bg-white border border-gray-200 rounded-2xl">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 text-xl mb-4">
                3
              </div>
              <h4 className="font-bold text-slate-900 mb-2">{t('dataDeletion.directEmail')}</h4>
              <p className="text-sm text-gray-600">
                {t('dataDeletion.directEmailDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('dataDeletion.processTitle')}</h2>

        <div className="relative my-12">
          <div className="absolute left-4 md:left-1/2 md:transform md:-translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 via-amber-500 to-green-500"></div>
          <div className="space-y-12">
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold z-10">{t('dataDeletion.day0')}</div>
              <div className="flex-1 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm md:ml-8">
                <h4 className="font-bold text-slate-900 mb-2">{t('dataDeletion.requestReceived')}</h4>
                <p className="text-sm text-gray-600">{t('dataDeletion.requestReceivedDesc')}</p>
              </div>
            </div>

            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold z-10">{t('dataDeletion.days1to7')}</div>
              <div className="flex-1 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm md:mr-8 md:text-right">
                <h4 className="font-bold text-slate-900 mb-2">{t('dataDeletion.analysisBackup')}</h4>
                <p className="text-sm text-gray-600">{t('dataDeletion.analysisBackupDesc')}</p>
              </div>
            </div>

            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold z-10">{t('dataDeletion.days8to30')}</div>
              <div className="flex-1 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm md:ml-8">
                <h4 className="font-bold text-slate-900 mb-2">{t('dataDeletion.completeDeletion')}</h4>
                <p className="text-sm text-gray-600">{t('dataDeletion.completeDeletionDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('dataDeletion.importantConsiderations')}</h2>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 my-8">
          <h4 className="font-bold text-slate-900 mb-4">
            {t('dataDeletion.importantInfo')}
          </h4>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">•</span>
              <span>{t('dataDeletion.irreversible')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">•</span>
              <span>{t('dataDeletion.publicRecipes')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">•</span>
              <span>{t('dataDeletion.subscriptions')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">•</span>
              <span>{t('dataDeletion.exportOption')}</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex flex-col items-center text-center gap-6">
          <div>
            <h3 className="!mt-0">{t('dataDeletion.readyToProceed')}</h3>
          </div>

          <button
            onClick={() => {
              const subject = encodeURIComponent('Pedido de eliminação de conta');
              const body = encodeURIComponent(
                'Olá,\n\n' +
                'Gostaria de solicitar a eliminação da minha conta e de todos os meus dados pessoais associados.\n\n' +
                'Por favor, confirmem o processamento deste pedido.\n\n' +
                'Atenciosamente.'
              );
              window.location.href = `mailto:centaurosa@gmail.com?subject=${subject}&body=${body}`;
              toast.success('Pedido de eliminação enviado! Verifique o seu cliente de email.', {
                duration: 6000,
              });
            }}
            className="px-8 py-4 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg"
          >
            {t('dataDeletion.requestDeletionButton')}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6 text-center">
          {t('dataDeletion.assistance')} <a href="mailto:centaurosa@gmail.com" className="text-orange-600 hover:underline">centaurosa@gmail.com</a>
        </p>
      </section>

    </LegalLayout>
  );
};

export default DataDeletion;