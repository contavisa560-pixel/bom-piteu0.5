const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const Message = require("../models/Message");
const AuditLog = require("../models/AuditLog");
const { checkLimitsMiddleware } = require("../middleware/limitMiddleware");
const recipeService = require("../services/recipeService");
const { uploadToCloudflare } = require("../services/storageService");
const { analyzeFoodImage } = require("../services/visionService");


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const { authenticate } = require("../middleware/security/jwtAuth");

const { upload } = require("../middleware/uploadValidator");
const { handleImageChat } = require("../controllers/chatController");

router.post(
  "/text",
  authenticate,
  checkLimitsMiddleware("text"),
  async (req, res) => {

    const { message } = req.body;
    const userId = req.user._id;

    // Detectar se a mensagem do usuário é um pedido de geração de imagem
    const isImageRequest = /(desenhe|desenha|gera.*imagem|mostre.*imagem|ilustre|crie.*imagem)/i.test(message);

    if (isImageRequest) {
      try {
        // Gerar imagem usando OpenAI Images
        const result = await openai.images.generate({
          prompt: message,
          size: "1024x1024",
        });

        const imageUrl = result.data[0].url;

        // Salvar mensagem da IA com a imagem
        await Message.create({
          userId,
          role: "assistant",
          content: `<img src="${imageUrl}" />`,
        });

        // Retornar a resposta para o frontend
        return res.json({
          reply: `<img src="${imageUrl}" />`
        });
      } catch (err) {
        console.error("Erro ao gerar imagem:", err);
        return res.status(500).json({ error: "image_generation_failed" });
      }
    }

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

router.post(
  "/image-chat",
  authenticate,
  checkLimitsMiddleware("analysis"),
  upload.single("image"),
  handleImageChat
);


// Rota de teste sem autenticação
router.post("/image-chat-test", upload.single("image"), async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Imagem não enviada" });
    }

    // Upload para Cloudflare R2
    const imageUrl = await uploadToCloudflare(
      req.file.buffer,
      req.file.originalname,
      "test"
    );

    // Análise OpenAI Vision
    const analysis = await analyzeFoodImage(
      imageUrl,
      prompt || "Analise a imagem do prato"
    );

    res.json({
      imageUrl,
      reply: analysis.notes,
      canAdvance: analysis.canAdvance,
      state: analysis.state
    });

  } catch (err) {
    console.error("ERRO /image-chat-test:", err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
