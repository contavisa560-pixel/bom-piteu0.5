const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const Image = require("../models/Image");
const limitService = require("../services/limitService");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Gerar imagem
router.post("/", async (req, res) => {
  try {
    const { prompt, userId } = req.body;
    if (!prompt || !prompt.trim()) return res.status(400).json({ error: "missing_prompt" });

    // Checar limites
    const canUse = await limitService.checkUserLimit(userId, "gen");
    if (!canUse.status) return res.status(403).json({ error: "limit_reached", message: canUse.message });

    // Gerar imagem OpenAI
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      n: 1
    });

    const imageUrl = result.data[0].url;

    // Salvar no DB
    await Image.create({ user: userId, prompt, url: imageUrl, type: "gen" });

    // Incrementar uso
    await limitService.incrementUsage(userId, "gen");

    res.json({ url: imageUrl });
  } catch (err) {
    console.error("OPENAI IMAGE ERROR:", err);
    res.status(500).json({ error: "Erro OpenAI Image", details: err.message || String(err) });
  }
});

module.exports = router;
