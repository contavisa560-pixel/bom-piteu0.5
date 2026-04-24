const express = require("express");
const router = express.Router();
const openai = require("../services/openai");

router.post("/", async (req, res) => {
  try {
    const { step } = req.body;

    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "És um chef profissional e professor de culinária. Explica bem, claro e com detalhes."
        },
        {
          role: "user",
          content: `Explica esta técnica culinária como um chef profissional: ${step}`
        }
      ]
    });

    res.json({ explanation: result.choices[0].message.content });
  } catch {
    res.status(500).json({ error: "Erro ao ensinar culinária" });
  }
});

module.exports = router;
