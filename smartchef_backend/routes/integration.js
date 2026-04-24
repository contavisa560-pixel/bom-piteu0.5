const express = require("express");
const router = express.Router();
const IntegrationService = require("../services/integrationService");

// 1. Receita infantil → Saúde
router.post("/infant-to-health", async (req, res) => {
    try {
        const { profileId, recipeId, childAte } = req.body;
        const result = await IntegrationService.infantRecipeToHealth(profileId, recipeId, childAte);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Screenshot → Adaptar para perfil
router.post("/screenshot-to-profile", async (req, res) => {
    try {
        const { observationId, targetProfileId } = req.body;
        const result = await IntegrationService.screenshotToProfile(observationId, targetProfileId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Gerar relatório médico
router.get("/medical-report/:userId", async (req, res) => {
    try {
        const result = await IntegrationService.generateMedicalReport(req.params.userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Verificar planejamento de menu
router.post("/check-meal-plan", async (req, res) => {
    try {
        const { profileId, plannedMeals } = req.body;
        const alerts = await IntegrationService.checkMealPlan(profileId, plannedMeals);
        res.json({ hasAlerts: alerts.length > 0, alerts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Sugerir receitas com vegetais (para alerta de menu)
router.get("/suggest-vegetables/:profileId", async (req, res) => {
    try {
        // Em produção: buscar receitas com vegetais do banco
        const suggestions = [
            { title: "Sopa de legumes", prepTime: "30min", difficulty: "fácil" },
            { title: "Salada colorida", prepTime: "15min", difficulty: "muito fácil" },
            { title: "Legumes grelhados", prepTime: "20min", difficulty: "fácil" }
        ];

        res.json({ suggestions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;