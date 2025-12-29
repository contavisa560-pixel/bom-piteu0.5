import LegalLayout from "./LegalLayout";

const CookiesPolicy = () => {
  return (
    <LegalLayout
      title="Política de Cookies"
      description="Entenda como usamos cookies para tornar a sua experiência no Bom Piteu mais rápida e personalizada."
    >
      <section>
        <h2>O que são cookies?</h2>
        <p>
          Cookies são pequenos ficheiros de texto enviados para o seu navegador pelos websites que visita. Eles ajudam o Bom Piteu a lembrar informações sobre a sua visita, como o seu idioma preferido e outras definições.
        </p>
      </section>

      <section className="bg-orange-50/50 border border-orange-100 rounded-3xl p-8 my-12">
        <h2 className="!mt-0">Categorias de Cookies que Utilizamos</h2>
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h4 className="font-bold text-slate-900 mb-1"> Cookies Essenciais</h4>
            <p className="text-sm text-gray-500">Obrigatórios para o funcionamento do login e segurança da sua conta. Sem eles, o site não funciona.</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h4 className="font-bold text-slate-900 mb-1"> Cookies de Análise</h4>
            <p className="text-sm text-gray-500">Ajudam-nos a entender quais receitas são as mais populares para podermos criar conteúdo melhor para si.</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h4 className="font-bold text-slate-900 mb-1"> Cookies de Personalização</h4>
            <p className="text-sm text-gray-500">Lembram-se das suas preferências alimentares (ex: se é vegetariano) para filtrar o conteúdo automaticamente.</p>
          </div>
        </div>
      </section>

      <section>
        <h2>Como gerir os seus cookies?</h2>
        <p>
          Pode alterar as suas preferências de cookies a qualquer momento através das definições do seu navegador. Note que a desativação de certos cookies pode afetar a funcionalidade da plataforma.
        </p>
      </section>
    </LegalLayout>
  );
};

export default CookiesPolicy;