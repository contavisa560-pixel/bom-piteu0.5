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

const CommunityGuidelines = () => {
  return (
    <LegalLayout
      title="Diretrizes da Comunidade"
      description="Regras de convivência e partilha responsável na nossa comunidade gastronómica."
    >
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-3xl p-8 mb-12">
        <h2 className="!mt-0 text-green-900 flex items-center gap-2">
          <Star className="w-6 h-6 text-green-600" />
          Nossa Filosofia
        </h2>

        <p className="text-lg text-green-800">
          No Bom Piteu, acreditamos que a comida une pessoas. Criámos estas diretrizes para manter um ambiente acolhedor, respeitoso e inspirador para todos os amantes da gastronomia.
        </p>
      </section>

      <section>
        <h2>1. Respeito e Inclusão</h2>
        <p>
          A diversidade culinária é a nossa força. Esperamos que todos os membros da comunidade:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 text-xl mb-4">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Comunicação Respeitosa</h4>
            <p className="text-sm text-gray-600">
              Critique receitas, não pessoas. Feedback construtivo é sempre bem-vindo.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-xl mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Respeito Cultural</h4>
            <p className="text-sm text-gray-600">
              Valorize tradições culinárias de todas as culturas sem apropriação indevida.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 text-xl mb-4">
              <Accessibility className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Acessibilidade</h4>
            <p className="text-sm text-gray-600">
              Considere diferentes restrições alimentares e orçamentos ao partilhar receitas.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>2. Conteúdo Apropriado</h2>
        <div className="overflow-hidden rounded-2xl border border-gray-200 my-8">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Tipo de Conteúdo</th>
                <th className="text-left p-4 font-semibold text-gray-700">Permitido</th>
                <th className="text-left p-4 font-semibold text-gray-700">Não Permitido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50/50">
                <td className="p-4 font-medium">Fotografias</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Fotos originais de pratos
                  </span>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-red-600">
                    <XCircle className="w-4 h-4" />
                    Conteúdo com direitos de autor
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="p-4 font-medium">Comentários</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" /> Dicas de preparação
                  </span>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-red-600">
                    <XCircle className="w-4 h-4" /> Spam ou auto-promoção
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="p-4 font-medium">Receitas</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" /> Adaptações com crédito
                  </span>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-red-600">
                    <XCircle className="w-4 h-4" /> Plágio de outras fontes
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>3. Segurança Alimentar</h2>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 my-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>

            <div>
              <h4 className="font-bold text-amber-900 mb-2">Aviso Importante</h4>
              <p className="text-amber-800">
                As receitas partilhadas na comunidade não substituem aconselhamento médico profissional. Sempre consulte um profissional de saúde para alergias, intolerâncias ou condições médicas específicas.
              </p>
            </div>
          </div>
        </div>

        <ul className="space-y-4 !pl-0">
          <li className="flex gap-4 items-start p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">1</div>
            <div>
              <strong className="text-slate-900">Indique Alergénios</strong>
              <p className="text-gray-600 mt-1 text-sm">Mencione claramente a presença de ingredientes comuns como glúten, lactose, frutos secos, etc.</p>
            </div>
          </li>
          <li className="flex gap-4 items-start p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">2</div>
            <div>
              <strong className="text-slate-900">Temperaturas Seguras</strong>
              <p className="text-gray-600 mt-1 text-sm">Inclua temperaturas de cozedura adequadas para carnes e peixes para evitar intoxicações.</p>
            </div>
          </li>
          <li className="flex gap-4 items-start p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">3</div>
            <div>
              <strong className="text-slate-900">Conservação</strong>
              <p className="text-gray-600 mt-1 text-sm">Indique métodos e prazos de conservação para sobras.</p>
            </div>
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Sistema de Moderação</h2>
        <p>
          A nossa equipa de moderação trabalha 24/7 para garantir o cumprimento destas diretrizes:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
          <div className="border-l-4 border-orange-500 pl-6 py-2">
            <h4 className="font-bold text-slate-900 mb-2">Avisos Progressivos</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 1ª infração: Aviso por email</li>
              <li>• 2ª infração: Suspensão por 7 dias</li>
              <li>• 3ª infração: Suspensão por 30 dias</li>
              <li>• Infrações graves: Banimento imediato</li>
            </ul>
          </div>

          <div className="border-l-4 border-blue-500 pl-6 py-2">
            <h4 className="font-bold text-slate-900 mb-2">Denúncias</h4>
            <p className="text-sm text-gray-600">
              Use o botão "Reportar" em qualquer conteúdo para alertar os moderadores. Todas as denúncias são analisadas em 24h.
            </p>
            <a href="#" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mt-3 font-medium">
              <Mail className="w-4 h-4" />
              Contactar Moderação
            </a>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 rounded-3xl p-8 mt-12">
        <h3 className="!mt-0 text-slate-900 flex items-center gap-2">
          <PenLine className="w-6 h-6 text-slate-700" />
          Compromisso da Comunidade
        </h3>
        <p className="text-gray-700">
          Ao utilizar a plataforma Bom Piteu, comprometo-me a respeitar estas diretrizes e a contribuir para uma comunidade gastronómica positiva, segura e inspiradora para todos.
        </p>
        <div className="flex items-center gap-4 mt-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white">B</div>
          <p className="text-sm text-gray-600">
            <strong>Equipa Bom Piteu</strong> · Última revisão: Dezembro 2025
          </p>
        </div>
      </section>
    </LegalLayout>
  );
};

export default CommunityGuidelines;