// routes/openaiChat.js
require("dotenv").config();
const express = require("express");
const router = express.Router();

const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/openai/chat
router.post("/chat", async (req, res) => {
  try {
    const { message, profile } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "missing_message" });
    }

    const systemPrompt = `Tu és o SmartChef IA — um assistente de cozinha profissional, amigável e rápido. 
Responde sempre de forma clara e útil. Adapta-te ao utilizador quando o perfil for fornecido.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 600,
      temperature: 0.7
    });

    const reply = completion.choices?.[0]?.message?.content || "Erro ao gerar resposta.";

    res.json({ reply });

  } catch (err) {
    console.error("🔥 GROQ ERROR:", err);
    res.status(500).json({
      error: "Erro GROQ",
      details: err.message || String(err)
    });
  }
});

module.exports = router;
