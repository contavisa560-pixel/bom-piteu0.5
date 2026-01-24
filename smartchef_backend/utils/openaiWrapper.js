const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// MODELOS
const TEXT_MODEL = process.env.AI_MODEL || "gpt-4o-mini";

module.exports = {
  chat: {
    completions: {
      create: async (obj) =>
        await client.chat.completions.create({
          model: obj.model || TEXT_MODEL,
          ...obj
        }),
    },
  },
  images: {
    generate: async (obj) =>
      await client.images.generate({
        model: "dall-e-3",
        ...obj
      }),
  }
};