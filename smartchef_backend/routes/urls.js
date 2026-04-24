const express = require("express");
const router = express.Router();
const WebScraper = require("../services/webScraper");
const Observacao = require("../models/Observacao");

// 1. Analisar URL e extrair receita
router.post("/analyze", async (req, res) => {
    try {
        const { url, userId, saveAutomatically = true } = req.body;

        if (!url) {
            return res.status(400).json({ error: "URL é obrigatória" });
        }

        // Extrair receita da URL
        const recipeData = await WebScraper.extractRecipeFromUrl(url);

        // Se usuário quer salvar automaticamente
        if (saveAutomatically && userId) {
            const observacao = new Observacao({
                userId,
                imageUrl: recipeData.image || "",
                imageType: "recipe",
                tags: ["imported", "url"],
                recipeData: {
                    title: recipeData.title,
                    ingredients: recipeData.ingredients,
                    steps: recipeData.steps
                },
                notes: [{
                    content: `Importado de: ${url}`,
                    type: "personal_comment"
                }]
            });

            await observacao.save();
            recipeData.savedAs = observacao._id;
        }

        res.json({
            success: true,
            recipe: recipeData,
            message: saveAutomatically ? "Receita salva automaticamente no histórico" : "Receita analisada com sucesso"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            suggestion: "Tente copiar e colar a receita manualmente"
        });
    }
});

// 2. Listar receitas importadas de URLs
router.get("/user/:userId", async (req, res) => {
    try {
        const receitas = await Observacao.find({
            userId: req.params.userId,
            tags: { $in: ["imported", "url"] }
        }).sort({ createdAt: -1 });

        res.json(receitas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Processar screenshot de link (Instagram, etc)
router.post("/process-screenshot", async (req, res) => {
    try {
        const { imageUrl, userId, tags } = req.body;

        // Aqui você processaria a imagem do screenshot
        // Por enquanto, retorna estrutura básica
        res.json({
            success: true,
            type: "screenshot",
            suggestedTags: ["instagram", "screenshot", "social"],
            action: "upload_observation", // Sugere upload para observações
            message: "Screenshot detectado. Deseja salvar como receita?"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;