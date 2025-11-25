const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 🔥 MODELOS PERMITIDOS
const MODEL = process.env.AI_MODEL || "gpt-4o-mini";

module.exports = {
  chat: {
    completions: {
      create: async (obj) =>
        await client.chat.completions.create({
          model: MODEL,
          ...obj
        }),
    },
  },

  images: {
    generate: async (obj) =>
      await client.images.generate({
        model: "gpt-image-1",
        ...obj
      }),
  }
};
