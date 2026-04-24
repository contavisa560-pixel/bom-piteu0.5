import LegalLayout from "./LegalLayout";
import {
  MessageCircle,
  Globe,
  Accessibility,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Star,
  PenLine
} from "lucide-react";
import { useTranslation } from 'react-i18next';

const CommunityGuidelines = () => {
  const { t } = useTranslation();

  return (
    <LegalLayout
      title={t('communityGuidelines.title')}
      description={t('communityGuidelines.description')}
    >
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-3xl p-8 mb-12">
        <h2 className="!mt-0 text-green-900 flex items-center gap-2">
          <Star className="w-6 h-6 text-green-600" />
          {t('communityGuidelines.philosophyTitle')}
        </h2>

        <p className="text-lg text-green-800">
          {t('communityGuidelines.philosophyText')}
        </p>
      </section>

      <section>
        <h2>{t('communityGuidelines.respectInclusionTitle')}</h2>
        <p>{t('communityGuidelines.respectInclusionIntro')}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 text-xl mb-4">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">{t('communityGuidelines.respectfulCommunication')}</h4>
            <p className="text-sm text-gray-600">{t('communityGuidelines.respectfulCommunicationDesc')}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-xl mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">{t('communityGuidelines.culturalRespect')}</h4>
            <p className="text-sm text-gray-600">{t('communityGuidelines.culturalRespectDesc')}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 text-xl mb-4">
              <Accessibility className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">{t('communityGuidelines.accessibility')}</h4>
            <p className="text-sm text-gray-600">{t('communityGuidelines.accessibilityDesc')}</p>
          </div>
        </div>
      </section>

      <section>
        <h2>{t('communityGuidelines.appropriateContentTitle')}</h2>
        <div className="overflow-hidden rounded-2xl border border-gray-200 my-8">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">{t('communityGuidelines.contentType')}</th>
                <th className="text-left p-4 font-semibold text-gray-700">{t('communityGuidelines.allowed')}</th>
                <th className="text-left p-4 font-semibold text-gray-700">{t('communityGuidelines.notAllowed')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50/50">
                <td className="p-4 font-medium">{t('communityGuidelines.photos')}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    {t('communityGuidelines.originalPhotos')}
                  </span>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-red-600">
                    <XCircle className="w-4 h-4" />
                    {t('communityGuidelines.copyrightedContent')}
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="p-4 font-medium">{t('communityGuidelines.comments')}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" /> {t('communityGuidelines.preparationTips')}
                  </span>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-red-600">
                    <XCircle className="w-4 h-4" /> {t('communityGuidelines.spam')}
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="p-4 font-medium">{t('communityGuidelines.recipes')}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" /> {t('communityGuidelines.adaptationsWithCredit')}
                  </span>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-red-600">
                    <XCircle className="w-4 h-4" /> {t('communityGuidelines.plagiarism')}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>{t('communityGuidelines.foodSafetyTitle')}</h2>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 my-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>

            <div>
              <h4 className="font-bold text-amber-900 mb-2">{t('communityGuidelines.importantWarning')}</h4>
              <p className="text-amber-800">{t('communityGuidelines.foodSafetyWarning')}</p>
            </div>
          </div>
        </div>

        <ul className="space-y-4 !pl-0">
          <li className="flex gap-4 items-start p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">1</div>
            <div>
              <strong className="text-slate-900">{t('communityGuidelines.allergens')}</strong>
              <p className="text-gray-600 mt-1 text-sm">{t('communityGuidelines.allergensDesc')}</p>
            </div>
          </li>
          <li className="flex gap-4 items-start p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">2</div>
            <div>
              <strong className="text-slate-900">{t('communityGuidelines.safeTemperatures')}</strong>
              <p className="text-gray-600 mt-1 text-sm">{t('communityGuidelines.safeTemperaturesDesc')}</p>
            </div>
          </li>
          <li className="flex gap-4 items-start p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">3</div>
            <div>
              <strong className="text-slate-900">{t('communityGuidelines.storage')}</strong>
              <p className="text-gray-600 mt-1 text-sm">{t('communityGuidelines.storageDesc')}</p>
            </div>
          </li>
        </ul>
      </section>

      <section>
        <h2>{t('communityGuidelines.moderationSystemTitle')}</h2>
        <p>{t('communityGuidelines.moderationSystemIntro')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
          <div className="border-l-4 border-orange-500 pl-6 py-2">
            <h4 className="font-bold text-slate-900 mb-2">{t('communityGuidelines.progressiveWarnings')}</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• {t('communityGuidelines.firstInfraction')}</li>
              <li>• {t('communityGuidelines.secondInfraction')}</li>
              <li>• {t('communityGuidelines.thirdInfraction')}</li>
              <li>• {t('communityGuidelines.severeInfractions')}</li>
            </ul>
          </div>

          <div className="border-l-4 border-blue-500 pl-6 py-2">
            <h4 className="font-bold text-slate-900 mb-2">{t('communityGuidelines.reports')}</h4>
            <p className="text-sm text-gray-600">{t('communityGuidelines.reportsDesc')}</p>
            <a href="#" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mt-3 font-medium">
              <Mail className="w-4 h-4" />
              {t('communityGuidelines.contactModeration')}
            </a>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 rounded-3xl p-8 mt-12">
        <h3 className="!mt-0 text-slate-900 flex items-center gap-2">
          <PenLine className="w-6 h-6 text-slate-700" />
          {t('communityGuidelines.communityCommitment')}
        </h3>
        <p className="text-gray-700">{t('communityGuidelines.commitmentText')}</p>
        <div className="flex items-center gap-4 mt-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white">B</div>
          <p className="text-sm text-gray-600">
            <strong>{t('communityGuidelines.bomPiteuTeam')}</strong> · {t('communityGuidelines.lastRevision', { date: 'December 2026' })}
          </p>
        </div>
      </section>
    </LegalLayout>
  );
};

export default CommunityGuidelines;