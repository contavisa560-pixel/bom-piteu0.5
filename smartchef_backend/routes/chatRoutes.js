const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const Message = require("../models/Message");
const AuditLog = require("../models/AuditLog");
const { checkLimitsMiddleware } = require("../middleware/limitMiddleware");
const recipeService = require("../services/recipeService");


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
    let cookingSession = null;

    // Heurística simples: se a resposta tiver "Ingredientes" e "Modo de preparo"
    if (
      reply.toLowerCase().includes("ingredientes") &&
      reply.toLowerCase().includes("modo")
    ) {
      try {
        // Transformar texto em estrutura simples
        const steps = reply
          .split("\n")
          .filter(l => l.trim().length > 0);

        const recipeData = {
          title: "Receita Gerada no Chat",
          steps,
        };

        cookingSession = await recipeService.startSession(userId, recipeData);
      } catch (err) {
        console.error("Erro ao iniciar sessão de cozinhar:", err.message);
      }
    }

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


    // Incrementa tokens usados
    await require("../services/limitService").increment(userId, "text");

    // Auditoria
    await AuditLog.create({
      userId,
      action: "chat_text",
      route: "/chat/text",
      tokensUsed: 1, // ou calcular tokens reais
    });

    res.json({
      reply,
      cookingSession
    });

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
