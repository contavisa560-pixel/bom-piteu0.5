// routes/preferencesRoutes.js
const express = require("express");
const router = express.Router();
const Preference = require("../models/Preference");
const { authenticate } = require("../middleware/security/jwtAuth");

/**
 * TODAS AS ROTAS EXIGEM AUTENTICAÇÃO
 */

// ==================== GET - Buscar Preferências ====================
/**
 * GET /api/preferences
 * Retorna preferências do usuário autenticado
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log("📥 GET Preferences:", { userId });
    
    let preferences = await Preference.findOne({ userId });
    
    // Se não existir, retorna estrutura vazia
    if (!preferences) {
      console.log("⚠️ Preferências não encontradas, retornando vazio");
      return res.json({
        success: true,
        data: {
          diets: [],
          allergies: [],
          intolerances: [],
          goals: [],
          macros: { carb: 50, protein: 25, fat: 25 },
          calorieTarget: null,
          bloodType: null
        }
      });
    }
    
    console.log("✅ Preferências encontradas");
    
    res.json({
      success: true,
      data: preferences
    });
    
  } catch (error) {
    console.error("❌ Erro ao buscar preferências:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar preferências",
      error: error.message
    });
  }
});

// ==================== POST/PUT - Criar/Atualizar Preferências ====================
/**
 * POST /api/preferences
 * Cria ou atualiza preferências (upsert)
 */
router.post("/", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;
    
    console.log("📤 POST Preferences:", { userId, updates });
    
    // Validações básicas
    if (updates.macros) {
      const total = (updates.macros.carb || 0) + (updates.macros.protein || 0) + (updates.macros.fat || 0);
      if (total > 105 || total < 95) {
        console.warn("⚠️ Macros não somam 100%, será normalizado automaticamente");
      }
    }
    
    // UPSERT: cria se não existir, atualiza se existir
    const preferences = await Preference.findOneAndUpdate(
      { userId },
      { ...updates, userId }, // Garante que userId está sempre presente
      { 
        new: true,        // Retorna documento atualizado
        upsert: true,     // Cria se não existir
        runValidators: true // Executa validações do schema
      }
    );
    
    console.log("✅ Preferências salvas com sucesso");
    
    res.json({
      success: true,
      message: "Preferências atualizadas com sucesso!",
      data: preferences
    });
    
  } catch (error) {
    console.error("❌ Erro ao salvar preferências:", error);
    
    // Erros de validação
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Erro de validação",
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Erro ao salvar preferências",
      error: error.message
    });
  }
});

// ==================== PATCH - Atualização Parcial ====================
/**
 * PATCH /api/preferences
 * Atualiza apenas campos específicos
 */
router.patch("/", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;
    
    console.log("🔧 PATCH Preferences:", { userId, fields: Object.keys(updates) });
    
    const preferences = await Preference.findOneAndUpdate(
      { userId },
      { $set: updates },
      { 
        new: true,
        upsert: true,
        runValidators: true
      }
    );
    
    console.log("✅ Campos atualizados com sucesso");
    
    res.json({
      success: true,
      message: "Preferências atualizadas!",
      data: preferences
    });
    
  } catch (error) {
    console.error("❌ Erro no PATCH:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar",
      error: error.message
    });
  }
});

// ==================== DELETE - Resetar Preferências ====================
/**
 * DELETE /api/preferences
 * Remove todas as preferências (reset)
 */
router.delete("/", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log("🗑️ DELETE Preferences:", { userId });
    
    const result = await Preference.deleteOne({ userId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Nenhuma preferência encontrada para deletar"
      });
    }
    
    console.log("✅ Preferências deletadas");
    
    res.json({
      success: true,
      message: "Preferências resetadas com sucesso"
    });
    
  } catch (error) {
    console.error("❌ Erro ao deletar:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao deletar preferências",
      error: error.message
    });
  }
});

// ==================== GET - Restrições para IA ====================
/**
 * GET /api/preferences/for-ai
 * Retorna preferências formatadas para prompt da IA
 */
router.get("/for-ai", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const preferences = await Preference.findOne({ userId });
    
    if (!preferences) {
      return res.json({
        success: true,
        prompt: "Sem restrições alimentares específicas."
      });
    }
    
    const prompt = preferences.getRestrictionsForAI();
    
    res.json({
      success: true,
      prompt: prompt || "Sem restrições alimentares específicas."
    });
    
  } catch (error) {
    console.error("❌ Erro ao gerar prompt IA:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao gerar prompt",
      error: error.message
    });
  }
});

module.exports = router;