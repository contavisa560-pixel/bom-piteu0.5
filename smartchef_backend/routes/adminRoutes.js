const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate } = require("../middleware/security/jwtAuth");

// Rota de métricas protegida por Token
router.get("/metrics", authenticate, adminController.getGlobalMetrics);

module.exports = router;