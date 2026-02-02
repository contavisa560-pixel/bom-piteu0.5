const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const Observacao = require("../models/Observacao");
const ai = require("../utils/openaiWrapper"); // Seu wrapper central

const upload = multer({ dest: "uploads/" });
const { iniciarCozinhaGuiada } = require("../services/assistenteService");
// Criar nova observação (Upload de imagem + OCR opcional)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    let recipeData = null;

    // Se o usuário quer extrair os dados da imagem via IA
    if (req.body.extractRecipe === "true" && req.file) {
      const imageData = fs.readFileSync(req.file.path, { encoding: 'base64' });
      
      const aiResponse = await ai.chat.completions.create({
        model: "gpt-4o", // Modelo necessário para visão
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Extraia o título, ingredientes e passos desta receita em JSON." },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageData}` } }
            ]
          }
        ],
        response_format: { type: "json_object" }
      });
      recipeData = JSON.parse(aiResponse.choices[0].message.content);
    }

    const novaObs = new Observacao({
      userId: req.body.userId,
      imageUrl: req.file ? req.file.path : "",
      imageType: req.body.imageType,
      tags: req.body.tags ? req.body.tags.split(",") : [],
      recipeData: recipeData
    });

    await novaObs.save();
    res.status(201).json(novaObs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/:id/enviar-assistente", async (req, res) => {
  try {
    const obs = await Observacao.findById(req.params.id);
    if (!obs || !obs.recipeData) {
      return res.status(400).json({ error: "Esta imagem ainda não tem dados de receita extraídos." });
    }

    const fluxo = await iniciarCozinhaGuiada(obs);
    res.json(fluxo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Listar com filtros 
router.get("/", async (req, res) => {
  try {
    const { tags, type } = req.query;
    let query = {};
    if (tags) query.tags = { $in: tags.split(",") };
    if (type) query.imageType = type;

    const lista = await Observacao.find(query).sort({ createdAt: -1 });
    res.json(lista);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;