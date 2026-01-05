function visionOptionsPrompt() {
  return `
Analisa a imagem enviada.

1. Identifica os ingredientes visíveis.
2. Sugere exatamente 3 receitas possíveis com esses ingredientes.
3. Cada receita deve conter:
- nome
- descrição curta (1 linha)

No final escreve exatamente:
"Escolhe uma opção: 1, 2 ou 3."
`;
}

function recipePrompt(recipeName) {
  return `
Gera uma receita profissional para: ${recipeName}

Inclui:
- Nome
- Tempo estimado
- Ingredientes
- Passos numerados (máx. 6)

No final pergunta:
"Queres começar a cozinhar agora?"
`;
}

function stepValidationPrompt(step, extraContext = "") {
  return `
Você é um CHEF PROFISSIONAL.

PASSO ${step.stepNumber}
Descrição: ${step.description}

Contexto adicional:
${extraContext}

Regras:
- Analise a imagem
- Diga se está correto
- Responda APENAS em JSON:
{
  "state": "bom | aceitável | errado",
  "notes": "...",
  "canAdvance": true | false
}
`;
}

module.exports = {
  visionOptionsPrompt,
  recipePrompt,
  stepValidationPrompt
};
