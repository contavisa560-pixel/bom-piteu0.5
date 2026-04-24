const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController"); // ajusta o caminho se necessário

// Iniciar sessão de receita
router.post("/session/start", recipeController.startSession);

// Enviar texto para passo atual
router.post("/session/message/text", recipeController.sendText);

// Enviar imagem (URL ou dataURL) para análise do passo atual
router.post("/session/message/image", recipeController.sendImage);

// Avançar passo (ex.: /session/advance)
router.post("/session/advance", recipeController.advanceStep);

module.exports = router;