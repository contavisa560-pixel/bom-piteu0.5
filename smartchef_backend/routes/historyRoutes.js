const express = require("express");
const router = express.Router();
const historyController = require("../controllers/historyController");
const { authenticate } = require("../middleware/security/jwtAuth");

// Rotas principais do histórico
router.get("/sessions", authenticate, historyController.getUserHistory);
router.get("/sessions/:sessionId", authenticate, historyController.getSessionDetail);
router.get("/sessions/:sessionId/images", authenticate, historyController.getSessionImages);
router.get("/sessions/:sessionId/export", authenticate, historyController.exportSession);
router.delete("/sessions/:sessionId", authenticate, historyController.deleteSession);
router.get("/statistics", authenticate, historyController.getStatistics);

// Rotas para salvar sessões
router.post("/save", authenticate, historyController.saveSession);
router.post("/quick-save", historyController.quickSave); // Sem autenticação para sendBeacon

module.exports = router;