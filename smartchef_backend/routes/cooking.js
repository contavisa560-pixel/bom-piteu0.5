const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/steps", async (req, res) => {
  try {
    const { recipeName, ingredients } = req.body;

    const prompt = `
Cria passos claros para cozinhar ${recipeName}.
Ingredientes: ${ingredients.join(", ")}.

1 passo por linha.
`;

    const r = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300
    });

    res.json({ steps: r.choices[0].message.content });

  } catch (err) {
    console.error("steps erro:", err);
    res.status(500).json({ error: "Erro cooking steps" });
  }
});

module.exports = router;
