const OpenAI = require("openai");

/**
 * Clientes separados por função
 */
const openaiText = new OpenAI({
  apiKey: process.env.OPENAI_TEXT_KEY,
});

const openaiImage = new OpenAI({
  apiKey: process.env.OPENAI_IMAGE_KEY,
});

const openaiVision = new OpenAI({
  apiKey: process.env.OPENAI_VISION_KEY,
});

/**
 * Prompt único e central do SmartChef
 */
const BASE_PROMPT = `
Tu és um assistente culinário inteligente.

Tarefa:
1. Analisa cuidadosamente os ingredientes fornecidos (texto, imagem ou áudio).
2. Assume que o utilizador quer cozinhar apenas ou principalmente com esses ingredientes.
3. Sugere exatamente 3 receitas possíveis.

Regras para as 3 receitas:
- Simples
- Práticas
- Adequadas para cozinhar em casa
- Não inventes ingredientes complexos
- Mostra apenas:
  • Nome da receita
  • Descrição curta (1 linha)

No final pergunta exatamente:
"Qual receita queres preparar? Responde com 1, 2 ou 3."

---

Quando o utilizador escolher a receita:

Gera uma receita completa e organizada com:
1. Nome da receita
2. Tempo estimado
3. Lista de ingredientes
4. Passos numerados e claros (máximo 6)

Não comeces o passo a passo ainda.
No final pergunta:
"Queres começar a preparar agora? Responde: sim ou vamos."

---

Quando o utilizador disser "sim" ou "vamos":

Gera o próximo passo da receita.
Descreve o passo de forma clara e prática.
Inclui uma descrição visual curta do passo.
`;

/**
 * 🔤 TEXTO (com ou sem imagem)
 */
async function callOpenAIText(userPrompt, imageBase64 = null) {
  const messages = [
    { role: "system", content: BASE_PROMPT },
  ];

  if (imageBase64) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: userPrompt },
        {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`  // ✅ OBJETO
          },
        },
      ],
    });
  } else {
    messages.push({ role: "user", content: userPrompt });
  }

  const response = await openaiVision.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.6,
  });

  return parseAIResponse(response.choices[0].message.content);
}

/**
 * 🍽️ IMAGEM (prato final ou passo)
 */
async function callOpenAIImage(prompt) {
  const response = await openaiImage.images.generate({
    model: "dall-e-3",
    prompt: `
Imagem realista de culinária.
${prompt}
Sem texto, sem marcas, sem pessoas.
Fotografia profissional, luz natural.
`,
    size: "1024x1024",
  });

  return response.data[0];
}

/**
 * 🔎 Parser simples
 */
function parseAIResponse(text) {
  return {
    raw: text,
    options: extractOptions(text),
    recipe: text,
  };
}

function extractOptions(text) {
  const lines = text.split("\n").filter(Boolean);

  return lines
    .filter((l) => /^\d+[\).\s]/.test(l))
    .slice(0, 3)
    .map((l) => {
      const [title, desc] = l.replace(/^\d+[\).\s]/, "").split("–");
      return {
        title: title.trim(),
        description: desc ? desc.trim() : "",
      };
    });
}

module.exports = {
  callOpenAIText,
  callOpenAIImage,
};
