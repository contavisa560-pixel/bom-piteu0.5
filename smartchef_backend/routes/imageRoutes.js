require("dotenv").config();
const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const limitService = require("../services/limitService");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/generate", async (req, res) => {
  try {
    const { prompt, userId } = req.body;
    if (!prompt) return res.status(400).json({ error: "missing_prompt" });

    // ✅ Checa limite de geração de imagens
    const canUse = await limitService.checkLimits(userId, "image_gen");
    if (!canUse.allowed) return res.status(403).json({ error: "limit_reached", message: canUse.message });

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024"
    });

    const imageUrl = response.data[0].url;

    // ✅ Incrementa limite
    await limitService.increment(userId, "image_gen");

    res.json({ imageUrl });
  } catch (err) {
    console.error("IMAGE ERROR:", err);
    res.status(500).json({ error: "Erro ao gerar imagem", details: err.message || String(err) });
  }
});

module.exports = router;
