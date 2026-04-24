import LegalLayout from "./LegalLayout";
import {
  CreditCard,
  Smartphone,
  Wallet,
  Repeat,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from 'react-i18next';

const PaymentsPolicy = () => {
  const { t } = useTranslation();

  return (
    <LegalLayout
      title={t('paymentsPolicy.title')}
      description={t('paymentsPolicy.description')}
    >
      <section className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100 rounded-3xl p-8 mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center text-white">
              <CreditCard className="w-8 h-8" />
            </div>
          </div>
          <div>
            <h2 className="!mt-0 text-purple-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-purple-600" />
              {t('paymentsPolicy.secureTransactions')}
            </h2>
            <p className="text-lg text-purple-800">
              {t('paymentsPolicy.secureTransactionsDesc')}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('paymentsPolicy.acceptedMethodsTitle')}</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
          {[
            { name: t('paymentsPolicy.methods.visa'), icon: CreditCard },
            { name: t('paymentsPolicy.methods.mastercard'), icon: CreditCard },
            { name: t('paymentsPolicy.methods.mbway'), icon: Smartphone },
            { name: t('paymentsPolicy.methods.paypal'), icon: Wallet },
            { name: t('paymentsPolicy.methods.applePay'), icon: Wallet },
            { name: t('paymentsPolicy.methods.googlePay'), icon: Wallet },
            { name: t('paymentsPolicy.methods.multibanco'), icon: CreditCard },
            { name: t('paymentsPolicy.methods.reference'), icon: Repeat },
          ].map((method, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col items-center justify-center hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 mb-2">
                <method.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-gray-800">{method.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>{t('paymentsPolicy.plansTitle')}</h2>

        <div className="overflow-x-auto my-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                <th className="p-4 text-left rounded-tl-2xl">{t('paymentsPolicy.table.plan')}</th>
                <th className="p-4 text-left">{t('paymentsPolicy.table.price')}</th>
                <th className="p-4 text-left">{t('paymentsPolicy.table.features')}</th>
                <th className="p-4 text-left rounded-tr-2xl">{t('paymentsPolicy.table.cancellation')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 hover:bg-gray-50/50">
                <td className="p-4 font-medium">{t('paymentsPolicy.plans.basic.name')}</td>
                <td className="p-4">{t('paymentsPolicy.plans.basic.price')}</td>
                <td className="p-4">
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {t('paymentsPolicy.plans.basic.feature1')}</li>
                    <li>• {t('paymentsPolicy.plans.basic.feature2')}</li>
                  </ul>
                </td>
                <td className="p-4">
                  <span className="text-green-600 font-medium">{t('paymentsPolicy.cancellation.immediate')}</span>
                </td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50/50">
                <td className="p-4 font-medium">{t('paymentsPolicy.plans.premium.name')}</td>
                <td className="p-4">{t('paymentsPolicy.plans.premium.price')}</td>
                <td className="p-4">
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {t('paymentsPolicy.plans.premium.feature1')}</li>
                    <li>• {t('paymentsPolicy.plans.premium.feature2')}</li>
                    <li>• {t('paymentsPolicy.plans.premium.feature3')}</li>
                  </ul>
                </td>
                <td className="p-4">
                  <span className="text-amber-600 font-medium">{t('paymentsPolicy.cancellation.24h')}</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="p-4 font-medium">{t('paymentsPolicy.plans.family.name')}</td>
                <td className="p-4">{t('paymentsPolicy.plans.family.price')}</td>
                <td className="p-4">
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• {t('paymentsPolicy.plans.family.feature1')}</li>
                    <li>• {t('paymentsPolicy.plans.family.feature2')}</li>
                    <li>• {t('paymentsPolicy.plans.family.feature3')}</li>
                  </ul>
                </td>
                <td className="p-4">
                  <span className="text-amber-600 font-medium">{t('paymentsPolicy.cancellation.48h')}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>{t('paymentsPolicy.refundsTitle')}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <div className="bg-gradient-to-b from-green-50 to-white border border-green-200 rounded-2xl p-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 text-xl mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">{t('paymentsPolicy.refunds.fullTitle')}</h4>
            <p className="text-sm text-gray-600">
              {t('paymentsPolicy.refunds.fullDesc')}
            </p>
          </div>

          <div className="bg-gradient-to-b from-amber-50 to-white border border-amber-200 rounded-2xl p-6">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 text-xl mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">{t('paymentsPolicy.refunds.partialTitle')}</h4>
            <p className="text-sm text-gray-600">
              {t('paymentsPolicy.refunds.partialDesc')}
            </p>
          </div>

          <div className="bg-gradient-to-b from-red-50 to-white border border-red-200 rounded-2xl p-6">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 text-xl mb-4">
              <XCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">{t('paymentsPolicy.refunds.nonRefundableTitle')}</h4>
            <p className="text-sm text-gray-600">
              {t('paymentsPolicy.refunds.nonRefundableDesc')}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('paymentsPolicy.securityTitle')}</h2>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 my-8">
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <Lock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-blue-900 mb-2">{t('paymentsPolicy.securityCertifications')}</h4>
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="bg-white px-3 py-1 rounded-lg text-xs font-medium border border-blue-200">PCI DSS Nível 1</span>
                <span className="bg-white px-3 py-1 rounded-lg text-xs font-medium border border-blue-200">SSL 256-bit</span>
                <span className="bg-white px-3 py-1 rounded-lg text-xs font-medium border border-blue-200">GDPR Compliant</span>
                <span className="bg-white px-3 py-1 rounded-lg text-xs font-medium border border-blue-200">ISO 27001</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 pt-8 border-t border-gray-200">
        <h3>{t('paymentsPolicy.contactsTitle')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-gray-50 p-5 rounded-2xl">
            <p className="font-medium text-gray-800 mb-2">{t('paymentsPolicy.financialSupport')}</p>
            <p className="text-sm text-gray-600">{t('paymentsPolicy.financialSupportDesc')}</p>
            <a href="mailto:billing@bompitieu.com" className="text-orange-600 hover:underline font-medium">centaurosa@gmail.com</a>
          </div>
          <div className="bg-gray-50 p-5 rounded-2xl">
            <p className="font-medium text-gray-800 mb-2">{t('paymentsPolicy.companyNIF')}</p>
            <p className="text-sm text-gray-600">{t('paymentsPolicy.companyNIFDesc')}</p>
            <p className="font-mono text-gray-800">500 281 546 6</p>
          </div>
        </div>
      </section>
    </LegalLayout>
  );
};

export default PaymentsPolicy;