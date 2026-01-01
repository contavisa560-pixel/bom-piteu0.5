const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate } = require("../middleware/security/jwtAuth");

// Apenas uma regra: Todas as rotas de admin precisam de autenticação
router.use(authenticate);

// Rota de métricas
router.get("/metrics", adminController.getGlobalMetrics);

module.exports = router;