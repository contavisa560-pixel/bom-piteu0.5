const express = require('express');
const router = express.Router();
const History = require('../models/History');
const RecipeSession = require('../models/RecipeSession');
const auth = require('../middleware/auth');

// POST /api/ratings - Guardar avaliação no History
router.post('/', auth, async (req, res) => {
  try {
    const { sessionId, rating, recipeTitle, feedback } = req.body;
    const userId = req.user._id;

    if (!sessionId || !rating || !recipeTitle) {
      return res.status(400).json({ 
        error: "Campos obrigatórios: sessionId, rating, recipeTitle" 
      });
    }

    // Buscar a sessão para obter mais detalhes
    const session = await RecipeSession.findById(sessionId);

    // Verificar se já existe um History para esta sessão
    let historyEntry = await History.findOne({ 
      user: userId,
      'response.sessionId': sessionId,
      type: 'recipe'
    });

    if (historyEntry) {
      // Atualizar o existente
      historyEntry.response = {
        ...historyEntry.response,
        metadata: {
          ...historyEntry.response?.metadata,
          rating,
          feedback,
          ratedAt: new Date()
        }
      };
      await historyEntry.save();

      return res.json({ 
        success: true, 
        message: "Avaliação atualizada",
        data: historyEntry 
      });
    }

    // Criar nova entrada no History
    const newHistory = new History({
      user: userId,
      type: 'recipe',
      prompt: `Avaliação da receita: ${recipeTitle}`,
      response: {
        sessionId,
        recipeTitle,
        rating,
        feedback,
        recipeData: session?.selectedRecipe || null,
        metadata: {
          ratedAt: new Date(),
          cookingTime: session?.selectedRecipe?.time,
          difficulty: session?.selectedRecipe?.difficulty
        }
      }
    });

    await newHistory.save();

    res.status(201).json({ 
      success: true, 
      message: "Avaliação guardada com sucesso",
      data: newHistory 
    });

  } catch (err) {
    console.error("❌ Erro ao guardar rating:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ratings/user - Estatísticas do usuário
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Buscar todas as avaliações do usuário no History
    const ratings = await History.find({
      user: userId,
      'response.metadata.rating': { $exists: true }
    });

    // Calcular estatísticas
    const stats = {
      total: ratings.length,
      ratings: ratings.map(r => ({
        recipeTitle: r.response.recipeTitle,
        rating: r.response.metadata.rating,
        feedback: r.response.metadata.feedback,
        date: r.createdAt
      }))
    };

    if (ratings.length > 0) {
      const sum = ratings.reduce((acc, r) => acc + r.response.metadata.rating, 0);
      stats.average = (sum / ratings.length).toFixed(1);
      
      // Contagem por estrela
      stats.breakdown = {
        5: ratings.filter(r => r.response.metadata.rating === 5).length,
        4: ratings.filter(r => r.response.metadata.rating === 4).length,
        3: ratings.filter(r => r.response.metadata.rating === 3).length,
        2: ratings.filter(r => r.response.metadata.rating === 2).length,
        1: ratings.filter(r => r.response.metadata.rating === 1).length
      };
    }

    res.json({
      success: true,
      stats
    });

  } catch (err) {
    console.error("❌ Erro ao buscar stats:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ratings/session/:sessionId
router.get('/session/:sessionId', auth, async (req, res) => {
  try {
    const historyEntry = await History.findOne({
      user: req.user._id,
      'response.sessionId': req.params.sessionId,
      'response.metadata.rating': { $exists: true }
    });

    res.json({
      success: true,
      data: historyEntry ? {
        rating: historyEntry.response.metadata.rating,
        feedback: historyEntry.response.metadata.feedback,
        date: historyEntry.createdAt
      } : null
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;