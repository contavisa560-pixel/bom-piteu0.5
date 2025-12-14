require("dotenv").config();
const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const limitService = require("../services/limitService");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/analyze", async (req, res) => {
  try {
    const { imageUrl, userId } = req.body;
    if (!imageUrl) return res.status(400).json({ error: "missing_image_url" });

    // ✅ Checa limite de Vision
    const canUse = await limitService.checkLimits(userId, "vision");
    if (!canUse.allowed) return res.status(403).json({ error: "limit_reached", message: canUse.message });

    const response = await openai.images.analyze({
      model: "gpt-vision-1",
      image: imageUrl
    });

    // ✅ Incrementa limite
    await limitService.increment(userId, "vision");

    res.json({ analysis: response });
  } catch (err) {
    console.error("VISION ERROR:", err);
    res.status(500).json({ error: "Erro ao analisar imagem", details: err.message || String(err) });
  }
});

module.exports = router;
