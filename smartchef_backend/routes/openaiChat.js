require("dotenv").config();
const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const Message = require("../models/Message");
const limitService = require("../services/limitService");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Rota principal do chat
router.post("/", async (req, res) => {
  try {
    const { message, userId, profile } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: "missing_message" });

    // ✅ Checa limites de uso do usuário
    const canUse = await limitService.checkLimits(userId, "text");
    if (!canUse.allowed) return res.status(403).json({ error: "limit_reached", message: canUse.message });

    const systemPrompt = `
Tu és o SmartChef — assistente de cozinha inteligente, direto e amigável.
Adapta-te ao utilizador quando o perfil for fornecido.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 600,
      temperature: 0.7
    });

    const reply = completion.choices?.[0]?.message?.content || "Erro ao gerar resposta.";

    // Salva mensagem do usuário
    await Message.create({
      userId,
      role: "user",
      content: message
    });

    // Salva resposta da IA
    await Message.create({
      userId,
      role: "assistant",
      content: reply
    });


    // ✅ Incrementa limite do usuário
    await limitService.increment(userId, "text");

    res.json({ reply });

  } catch (err) {
    console.error("OPENAI ERROR:", err);
    res.status(500).json({ error: "Erro OpenAI", details: err.message || String(err) });
  }
});

module.exports = router;
