const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const Message = require("../models/Message");
const AuditLog = require("../models/AuditLog");
const { checkLimitsMiddleware } = require("../middleware/limitMiddleware");
const recipeService = require("../services/recipeService");


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const { authenticate } = require("../middleware/security/jwtAuth");

router.post(
  "/text",
  authenticate,
  checkLimitsMiddleware("text"),
  async (req, res) => {

    const { message } = req.body;
    const userId = req.user._id;


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

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/image",
  authenticate,
  checkLimitsMiddleware("image"),
  upload.single("image"),
  async (req, res) => {
    const userId = req.user._id;
    const { prompt } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Imagem não enviada" });
    }

    try {
      // Converte imagem para base64
      const base64Image = req.file.buffer.toString("base64");

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt || "Analisa esta imagem" },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      });

      const reply = response.choices[0].message.content;

      await Message.create({ userId, role: "user", content: "[Imagem enviada]" });
      await Message.create({ userId, role: "assistant", content: reply });

      await require("../services/limitService").increment(userId, "image");

      await AuditLog.create({
        userId,
        action: "chat_image",
        route: "/chat/image",
        tokensUsed: 1,
      });

      res.json({ reply });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "image_failed", details: err.message });
    }
  }
);

router.post(
  "/generate-image",
  authenticate,
  checkLimitsMiddleware("image"),
  async (req, res) => {
    const { prompt } = req.body;
    const userId = req.user._id;

    try {
      const result = await openai.images.generate({
        prompt,
        size: "1024x1024",
      });

      const imageUrl = result.data[0].url;

      await Message.create({
        userId,
        role: "assistant",
        content: `<img src="${imageUrl}" />`
      });

      res.json({ imageUrl });

    } catch (err) {
      res.status(500).json({ error: "image_generation_failed" });
    }
  }
);



module.exports = router;
