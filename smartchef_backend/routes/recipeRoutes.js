const express = require("express");
const router = express.Router();
const recipeService = require("../services/recipeService");

const authMiddleware = require("../middleware/auth");

const authenticate = typeof authMiddleware === 'function' 
  ? authMiddleware 
  : (authMiddleware.authenticate || authMiddleware.protect);

// Iniciar sessão ao gerar/abrir uma receita
router.post("/start", authenticate, async (req, res) => {
  try {
    const session = await recipeService.startSession(req.user.id, req.body.recipe);
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar progresso (quando o utilizador clica em "Próximo")
router.patch("/progress/:id", authenticate, async (req, res) => {
  try {
    const session = await recipeService.updateProgress(req.params.id, req.body.stepIndex);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recuperar sessão ativa (caso o utilizador dê refresh na página)
router.get("/active", authenticate, async (req, res) => {
  try {
    const session = await recipeService.getActiveSession(req.user.id);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;