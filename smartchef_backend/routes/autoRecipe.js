const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const {
  generateOptions,
  selectRecipe,
  generateStep,
} = require("../controllers/autoRecipeController");

const { authenticate } = require("../middleware/security/jwtAuth");
const { checkLimitsMiddleware } = require("../middleware/limitMiddleware");

// 🔐 Protege todas as rotas de IA
router.use(authenticate);
router.use(checkLimitsMiddleware("AI_AUTO_RECIPE"));

/**
 * 1️⃣ Envia imagem e recebe 3 opções
 * POST /api/auto-recipe/options
 */
router.post("/options", upload.single("image"), generateOptions);

/**
 * 2️⃣ Escolhe receita
 * POST /api/auto-recipe/select
 */
router.post("/select", selectRecipe);

/**
 * 3️⃣ Gera passo + imagem
 * POST /api/auto-recipe/step
 */
router.post("/step", generateStep);

module.exports = router;
