const express = require('express');
const router = express.Router();
const Planeamento = require('../models/Planeamento');
const { authenticate } = require('../middleware/security/jwtAuth');

// ===== CRIAR PLANEAMENTO DE REFEIÇÃO =====
router.post('/', authenticate, async (req, res) => {
  try {
    const { recipeId, recipeTitle, date, mealType } = req.body;
    const userId = req.user.id || req.user._id;

    if (!recipeId || !date || !mealType) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const novoPlaneamento = new Planeamento({
      userId,
      recipeId,
      recipeTitle: recipeTitle || 'Receita',
      date: new Date(date),
      mealType
    });

    await novoPlaneamento.save();

    res.status(201).json({
      success: true,
      message: 'Refeição planeada com sucesso!',
      planeamento: novoPlaneamento
    });
  } catch (err) {
    console.error('❌ Erro ao criar planeamento:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== LISTAR PLANEAMENTOS DE UM UTILIZADOR =====
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const planeamentos = await Planeamento.find({ userId }).sort({ date: 1 });
    res.json(planeamentos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;