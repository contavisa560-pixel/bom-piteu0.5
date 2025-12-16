const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const Message = require("../models/Message");
const AuditLog = require("../models/AuditLog");
const { checkLimitsMiddleware } = require("../middleware/limitMiddleware");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/text", checkLimitsMiddleware("text"), async (req, res) => {
  const { userId, message } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
      max_tokens: 600,
    });

    const reply = completion.choices?.[0]?.message?.content || "";

    // Salva histórico
    await Message.create({ user: userId, content: message, response: reply });

    // Incrementa tokens usados
    await require("../services/limitService").increment(userId, "text");

    // Auditoria
    await AuditLog.create({
      userId,
      action: "chat_text",
      route: "/chat/text",
      tokensUsed: 1, // ou calcular tokens reais
    });

    res.json({ reply });
  } catch (err) {
    await AuditLog.create({
      userId,
      action: "chat_text",
      route: "/chat/text",
      error: err.message,
    });
    console.error(err);
    res.status(500).json({ error: "chat_failed", details: err.message });
  }
});

module.exports = router;
