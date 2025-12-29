import LegalLayout from "./LegalLayout";

const TermsOfUse = () => {
  return (
    <LegalLayout
      title="Termos de Uso"
      description="Ao utilizar o Bom Piteu, você concorda com as regras de convivência e uso da nossa inteligência culinária."
    >
      <section>
        <h2>1. Aceitação e Elegibilidade</h2>
        <p>
          Para utilizar o Bom Piteu, deve ter pelo menos 13 anos de idade (ou a idade mínima legal no seu país). Ao criar uma conta, afirma que todas as informações fornecidas são verdadeiras.
        </p>
      </section>

      <section>
        <h2>2. Propriedade Intelectual</h2>
        <p>
          Todo o conteúdo presente na plataforma — incluindo algoritmos de receitas, design, logótipos e textos — é propriedade exclusiva do <strong>Bom Piteu</strong>.
        </p>
        <div className="bg-gray-100 border-l-4 border-orange-500 p-6 rounded-r-2xl my-6">
          <p className="text-sm italic font-medium">
            "É proibida a reprodução, cópia ou extração de dados (scraping) das nossas receitas para fins comerciais sem autorização prévia."
          </p>
        </div>
      </section>

      <section>
        <h2>3. Conduta do Utilizador</h2>
        <p>Ao partilhar fotos ou comentários, compromete-se a:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Não publicar conteúdo ofensivo ou discriminatório.</li>
          <li>Não tentar burlar as medidas de segurança da plataforma.</li>
          <li>Respeitar os direitos de autor de outros cozinheiros da comunidade.</li>
        </ul>
      </section>

      <section>
        <h2>4. Limitação de Responsabilidade</h2>
        <p>
          O Bom Piteu esforça-se por fornecer informações precisas, mas não nos responsabilizamos por alergias ou resultados culinários que não correspondam à expectativa, sendo o uso das receitas de inteira responsabilidade do utilizador.
        </p>
      </section>
    </LegalLayout>
  );
};

export default TermsOfUse;