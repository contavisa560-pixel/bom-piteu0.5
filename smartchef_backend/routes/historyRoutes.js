// routes/historyRoutes.js
// ─────────────────────────────────────────────────────────────
// Histórico baseado em RecipeSession (não existe ChatSession)
// ─────────────────────────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const { authenticate } = require("../middleware/security/jwtAuth");
const ctrl = require("../controllers/historyController");

router.use(authenticate);

// GET  /api/history/sessions          → lista de sessões do user
router.get("/sessions",                 ctrl.getUserHistory);

// GET  /api/history/statistics        → contagens resumidas
router.get("/statistics",               ctrl.getStatistics);

// GET  /api/history/sessions/:id      → detalhes de uma sessão
router.get("/sessions/:sessionId",      ctrl.getSessionDetail);

// DELETE /api/history/sessions/:id    → apagar sessão
router.delete("/sessions/:sessionId",   ctrl.deleteSession);

// POST /api/history/save  – NOP para compatibilidade com ChatBot.jsx
router.post("/save",                    ctrl.saveSession);

module.exports = router;