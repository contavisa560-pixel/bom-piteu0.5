const OpenAI = require("openai");

// Cliente principal (geralmente uma única chave resolve tudo)
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// MODELOS
const TEXT_MODEL = process.env.AI_MODEL || "gpt-4o-mini"; 
const VISION_MODEL = "gpt-4o"; // Necessário para ler as fotos das receitas

module.exports = {
  // Para chat e OCR (Visão)
  chat: {
    completions: {
      create: async (obj) =>
        await client.chat.completions.create({
          model: obj.model || TEXT_MODEL, // Permite sobrescrever o modelo se necessário
          ...obj
        }),
    },
  },

  // Para gerar imagens (DALL-E)
  images: {
    generate: async (obj) =>
      await client.images.generate({
        model: "dall-e-3", // Modelo correto para geração
        ...obj
      }),
  }
};