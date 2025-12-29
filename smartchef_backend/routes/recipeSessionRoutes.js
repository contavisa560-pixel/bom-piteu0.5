const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/security/jwtAuth");
const RecipeSession = require("../models/RecipeSession");
const { startCooking } = require("../controllers/recipeSessionController");

const {
  startSession,
  sendStepMessage,
  advanceStep
} = require("../controllers/recipeSessionController");

// Iniciar sessão
router.post("/start", authenticate, startSession);

// Enviar mensagem do passo
router.post("/message/text", authenticate, sendStepMessage);

// Avançar para o próximo passo
router.post("/step/advance", authenticate, advanceStep);

// 🔹 Botão iniciar cozinha
router.post("/startCooking", authenticate, startCooking);

module.exports = router;
