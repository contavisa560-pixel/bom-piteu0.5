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

const PaymentsPolicy = () => {
  return (
    <LegalLayout
      title="Política de Pagamentos"
      description="Transparência total sobre métodos de pagamento, segurança e reembolsos."
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
              Transações Seguras
            </h2>
            <p className="text-lg text-purple-800">
              Utilizamos encriptação de nível bancário e sistemas de pagamento certificados para garantir a segurança de todas as suas transações.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>1. Métodos de Pagamento Aceites</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
          {[
            { name: "Visa", icon: CreditCard },
            { name: "Mastercard", icon: CreditCard },
            { name: "MB Way", icon: Smartphone },
            { name: "PayPal", icon: Wallet },
            { name: "Apple Pay", icon: Wallet },
            { name: "Google Pay", icon: Wallet },
            { name: "Multibanco", icon: CreditCard },
            { name: "Referência", icon: Repeat },
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
        <h2>2. Planos e Subscrições</h2>

        <div className="overflow-x-auto my-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                <th className="p-4 text-left rounded-tl-2xl">Plano</th>
                <th className="p-4 text-left">Preço</th>
                <th className="p-4 text-left">Recursos</th>
                <th className="p-4 text-left rounded-tr-2xl">Cancelamento</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 hover:bg-gray-50/50">
                <td className="p-4 font-medium">Básico</td>
                <td className="p-4">Grátis</td>
                <td className="p-4">
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 7 receitas/semanana</li>
                    <li>• Lista de compras básica</li>
                  </ul>
                </td>
                <td className="p-4">
                  <span className="text-green-600 font-medium">Imediato</span>
                </td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50/50">
                <td className="p-4 font-medium">Premium</td>
                <td className="p-4">1.499 Kzs/mês</td>
                <td className="p-4">
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 50 Receitas/mês</li>
                    <li>• Planeador de refeições</li>
                    <li>• Nutricionista IA</li>
                  </ul>
                </td>
                <td className="p-4">
                  <span className="text-amber-600 font-medium">Até 24h antes</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="p-4 font-medium">Família</td>
                <td className="p-4">7.999 Kzs/mês</td>
                <td className="p-4">
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 6 perfis</li>
                    <li>• Controlo parental</li>
                    <li>• Receitas em batch</li>
                  </ul>
                </td>
                <td className="p-4">
                  <span className="text-amber-600 font-medium">Até 48h antes</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>3. Política de Reembolsos</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <div className="bg-gradient-to-b from-green-50 to-white border border-green-200 rounded-2xl p-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 text-xl mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Reembolsos Totais</h4>
            <p className="text-sm text-gray-600">
              Até 14 dias após a compra, se o serviço não foi utilizado.
            </p>
          </div>

          <div className="bg-gradient-to-b from-amber-50 to-white border border-amber-200 rounded-2xl p-6">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 text-xl mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Reembolsos Parciais</h4>
            <p className="text-sm text-gray-600">
              Proporcionais ao tempo restante da subscrição após cancelamento.
            </p>
          </div>

          <div className="bg-gradient-to-b from-red-50 to-white border border-red-200 rounded-2xl p-6">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 text-xl mb-4">
              <XCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Não Reembolsável</h4>
            <p className="text-sm text-gray-600">
              Pagamentos de subscrições anuais após 30 dias.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>4. Segurança e Conformidade</h2>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 my-8">
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <Lock className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-blue-900 mb-2">Certificações de Segurança</h4>
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
        <h3>Contactos Financeiros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-gray-50 p-5 rounded-2xl">
            <p className="font-medium text-gray-800 mb-2">Suporte Financeiro</p>
            <p className="text-sm text-gray-600">Para questões sobre faturas, reembolsos ou pagamentos:</p>
            <a href="mailto:billing@bompitieu.com" className="text-orange-600 hover:underline font-medium">centaurosa@gmail.com</a>
          </div>
          <div className="bg-gray-50 p-5 rounded-2xl">
            <p className="font-medium text-gray-800 mb-2">NIF Empresarial</p>
            <p className="text-sm text-gray-600">Para faturação empresarial:</p>
            <p className="font-mono text-gray-800">PT 123 456 789</p>
          </div>
        </div>
      </section>
    </LegalLayout>
  );
};

export default PaymentsPolicy;