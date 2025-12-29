const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MODEL = process.env.AI_MODEL || "gpt-4o-mini";

// 🔹 Detecta intenção do usuário

// services/openai.js
/**
 * detectUserIntent — Identifica a intenção do usuário
 * @param {string} text - Texto da mensagem do usuário
 * @returns {object} { isCooking: boolean, isQuestion: boolean }
 */
function detectUserIntent(text) {
  if (!text || typeof text !== "string") {
    return { isCooking: false, isQuestion: false };
  }

  const lowerText = text.toLowerCase();

  // Palavras genéricas de cozinha
  const cookingKeywords = [
    "cozinhar", "fazer", "preparar", "receita",
    "prato", "sobremesa", "bolo", "torta",
    "pizza", "massa", "sopa", "salada"
  ];

  // Ingredientes comuns
  const ingredientPattern =
    /\b(manga|banana|ovo|leite|farinha|arroz|carne|frango|tomate|queijo|peixe|batata)\b/i;

  // Nome de prato simples (2–5 palavras, sem interrogação)
  const looksLikeDishName =
    text.split(" ").length <= 5 && !text.trim().endsWith("?");

  const isCooking =
    cookingKeywords.some(k => lowerText.includes(k)) ||
    ingredientPattern.test(text) ||
    looksLikeDishName;

  const isQuestion = text.trim().endsWith("?");

  return { isCooking, isQuestion };
}

// 🔹 Gera receita real baseada nos ingredientes do usuário
async function askChefSmartExploration({ ingredientsText, userPreferences }) {
  const systemPrompt = `
Você é o Chef Smart do Bom Piteu, assistente culinário profissional.
O usuário forneceu os seguintes ingredientes: ${ingredientsText}.
Seu objetivo é criar **receitas reais e práticas** que podem ser feitas com esses ingredientes.

- Leve em conta o nível de experiência do usuário: ${userPreferences.experienceLevel || "iniciante"}.
- Sugira pelo menos 3 receitas possíveis.
- Para cada receita, inclua:
  • title: nome do prato
  • description: resumo do prato, tempo e passos principais
  • ingredients: ingredientes necessários, com substituições se possível
  • steps: passos básicos para começar

Formato JSON obrigatório:
{
  "mode": "AUTO_START | ASK_CHOICE",
  "recipe": { "title": "...", "description": "...", "ingredients": [...], "steps": [...] },
  "alternatives": [
    { "title": "...", "description": "...", "ingredients": [...], "steps": [...] },
    {...}
  ]
}
`;

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: ingredientsText }
    ],
    temperature: 0.5,
    max_tokens: 1000
  });

  const raw = completion.choices?.[0]?.message?.content;

  try {
    let clean = raw
      ?.replace(/```json/g, "")
      ?.replace(/```/g, "")
      ?.trim();

    try {
      return JSON.parse(clean);
    } catch (err) {
      console.error(" JSON inválido do OpenAI:");
      console.error(clean);

      return {
        mode: "ASK_CHOICE",
        recipe: null,
        alternatives: []
      };
    }

  } catch (err) {
    console.error("Erro parsing JSON askChefSmartExploration:", err);
    return {
      mode: "ASK_CHOICE",
      recipe: null,
      alternatives: []
    };
  }
}

// 🔹 Passo a passo do chef (mantém o que já funciona)
async function askChef({ message, step, recipe }) {
  const validationTypes = ["TEXT", "IMAGE", "TEXT+IMAGE"];
  const validationType = validationTypes[Math.floor(Math.random() * validationTypes.length)];

  const systemPrompt = `
Você é o Chef Smart do Bom Piteu, assistente culinário profissional.
O usuário está executando o passo: ${step.description} da receita: ${recipe}.
Avalie se o passo foi feito corretamente e forneça feedback profissional.
Responda **somente em JSON** com:
{
  "status": "VALID | ADJUST | INVALID",
  "feedback": "mensagem detalhada e profissional para o usuário",
  "validationType": "${validationType}"
}
`;

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "system", content: message }
    ],
    temperature: 0.2,
    max_tokens: 600
  });

  const raw = completion.choices?.[0]?.message?.content;

  try {
    const parsed = JSON.parse(raw);
    return {
      reply: parsed.feedback,
      valid: parsed.status === "VALID",
      status: parsed.status,
      validationType: parsed.validationType || "TEXT"
    };
  } catch (err) {
    return {
      reply: "Vamos focar corretamente neste passo antes de avançar.",
      valid: false,
      validationType: "TEXT"
    };
  }
}

// 🔹 Respostas gerais (mantém o que já funciona)
async function answerGeneralQuestion(message, userName) {
  const systemPrompt = `
Você é o Chef Smart do Bom Piteu, assistente de cozinha humano, experiente e natural.
Responda de forma humana, detalhada e profissional, incluindo dicas, histórias ou curiosidades de culinária.
Nunca saia do contexto de cozinha ou alimentação.
Usuário: ${userName}
Pergunta: ${message}
`;

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ],
    temperature: 0.7,
    max_tokens: 600
  });

  return completion.choices[0].message.content;
}
async function interpretExplorationInput({ userText, options }) {
  const systemPrompt = `
Você é um assistente que interpreta escolhas de receitas.

Receitas disponíveis:
${options.map((r, i) => `${i + 1}. ${r.title}`).join("\n")}

Interprete a mensagem do usuário e responda SOMENTE em JSON:

{
  "intent": "CHOOSE | MORE | NONE",
  "index": number | null
}

Regras:
- Se o usuário pedir mais opções → intent = MORE
- Se escolher uma receita por número ou nome → intent = CHOOSE e index correto
- Se não for claro → intent = NONE
`;

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userText }
    ],
    temperature: 0
  });

  try {
    return JSON.parse(completion.choices[0].message.content);
  } catch {
    return { intent: "NONE", index: null };
  }
}


module.exports = {
  askChef,
  askChefSmartExploration,
  detectUserIntent,
  answerGeneralQuestion,
  interpretExplorationInput,

  chat: {
    completions: {
      create: async (obj) => await client.chat.completions.create({ model: MODEL, ...obj })
    }
  },
  images: {
    generate: async (obj) => await client.images.generate({ model: "gpt-image-1", ...obj })
  }
};
