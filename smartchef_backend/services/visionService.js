const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analisa imagem de comida usando OpenAI Vision
 * @param {string} imageUrl
 * @param {string} stepContext
 */
async function analyzeFoodImage(imageUrl, stepContext) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `
Você é um chef profissional extremamente rigoroso.

Analise a imagem enviada e responda APENAS em JSON, sem texto extra:

{
  "state": "bom | aceitável | errado",
  "notes": "descrição objetiva do que vê",
  "canAdvance": true | false
}

Contexto do passo atual:
${stepContext}
        `.trim(),
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Imagem do preparo atual da receita." },
          {
            type: "image_url",
            image_url: { url: imageUrl },
          },
        ],
      },
    ],
  });

  return JSON.parse(response.choices[0].message.content);
}

module.exports = { analyzeFoodImage };
