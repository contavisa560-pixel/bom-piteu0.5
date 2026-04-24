const express = require("express");
const router = express.Router();
const Alerta = require("../models/Alerta");
const NutritionAnalyzer = require("../services/nutritionAnalyzer");
const Saude = require("../models/Saude");

// 1. Verificar receita em tempo real (chamado durante cozinha)
router.post("/check-recipe", async (req, res) => {
  try {
    const { userId, recipeData, profileId } = req.body;
    
    // Obter limites do usuário
    const saude = await Saude.findOne({ userId });
    const userLimits = saude?.limits || { sugar: 25, salt: 5, calories: 2000 };
    
    // Analisar receita
    const alerts = await NutritionAnalyzer.analyzeRecipe(recipeData, userLimits);
    
    // Salvar alertas se houver
    if (alerts.length > 0) {
      const alerta = new Alerta({
        userId,
        profileId,
        recipeData,
        ...alerts[0], // Pega o alerta principal
        recipeData: {
          title: recipeData.title,
          ingredients: recipeData.ingredients,
          totalSugar: NutritionAnalyzer.estimateNutrition(recipeData.ingredients).sugar,
          totalSalt: NutritionAnalyzer.estimateNutrition(recipeData.ingredients).salt
        }
      });
      
      await alerta.save();
    }
    
    res.json({ hasAlerts: alerts.length > 0, alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Obter alertas ativos do usuário
router.get("/user/:userId", async (req, res) => {
  try {
    const alertas = await Alerta.find({ 
      userId: req.params.userId,
      active: true,
      dismissed: false
    }).sort({ triggeredAt: -1 });
    
    res.json(alertas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Ação: Ignorar alerta
router.post("/:id/ignore", async (req, res) => {
  try {
    const alerta = await Alerta.findById(req.params.id);
    if (!alerta) return res.status(404).json({ error: "Alerta não encontrado" });
    
    alerta.dismissed = true;
    await alerta.save();
    
    res.json({ message: "Alerta ignorado", alerta });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Ação: Sugerir alternativa
router.post("/:id/suggest-alternative", async (req, res) => {
  try {
    const alerta = await Alerta.findById(req.params.id);
    if (!alerta) return res.status(404).json({ error: "Alerta não encontrado" });
    
    const alternative = await NutritionAnalyzer.generateAlternative(alerta.recipeData);
    
    // Marcar alerta como resolvido
    alerta.dismissed = true;
    await alerta.save();
    
    res.json({ 
      message: "Alternativa sugerida", 
      alternative,
      originalAlert: alerta 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Ação: Ajustar limites (redireciona para saúde)
router.post("/:id/adjust-limits", async (req, res) => {
  try {
    const alerta = await Alerta.findById(req.params.id);
    if (!alerta) return res.status(404).json({ error: "Alerta não encontrado" });
    
    // Retorna informação para frontend redirecionar
    res.json({
      action: "redirect",
      endpoint: `/api/saude/${alerta.userId}/limits`,
      alertType: alerta.type,
      suggestedAdjustment: alerta.currentValue * 0.8 // Sugere 20% a mais
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Alertas para perfis infantil/sênior
router.get("/profile/:profileId", async (req, res) => {
  try {
    const alertas = await Alerta.find({
      profileId: req.params.profileId,
      active: true
    }).populate("recipeId");
    
    res.json(alertas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;