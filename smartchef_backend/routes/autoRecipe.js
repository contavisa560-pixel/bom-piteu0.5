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
  handleDesejoPrato,
  perguntaPasso,
  chatLivre,
  getSessionStatus,
  iniciarPassoAPasso,
  gerarReceitaCompletaParaFavorito,
  criarSessaoDeReceita,
  documentOptions,
  identifyDish,
  iniciarReceitaDireta, 
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

/**
 * 4️⃣  Usuário quer fazer prato específico
 * POST /api/auto-recipe/desejo-prato
 */
router.post("/desejo-prato", handleDesejoPrato);

/**
 * 5️⃣ Usuário pergunta sobre passo específico durante passo a passo
 * POST /api/auto-recipe/pergunta-passo
 */
router.post("/pergunta-passo", perguntaPasso);

/**
 * 6️⃣ Chat livre inteligente
 * POST /api/auto-recipe/chat
 */
router.post("/chat", chatLivre);

/**
 * 7️ Obter status da sessão
 * GET /api/auto-recipe/session/:sessionId
 */
router.get("/session/:sessionId", getSessionStatus);

/**  Iniciar passo a passo para receitas criadas
  * POST / api / auto - recipe / iniciar - passo - a - passo
  */
router.post("/iniciar-passo-a-passo", iniciarPassoAPasso);

/**
 *  GERAR RECEITA COMPLETA PARA FAVORITO 
 * POST /api/auto-recipe/gerar-favorito
 */
router.post("/gerar-favorito", gerarReceitaCompletaParaFavorito);

/**
 * Cria uma sessão de receita a partir de dados fornecidos (usado pela alimentação infantil)
 * POST /api/auto-recipe/criar-sessao
 */
router.post("/criar-sessao", authenticate, checkLimitsMiddleware("AI_AUTO_RECIPE"), criarSessaoDeReceita);

/**
 * Analisa documento e gera opções de receita
 * POST /api/auto-recipe/document-options
 */
router.post("/document-options", upload.single("document"), documentOptions);

/**
 * Identifica prato na foto e gera receita completa
 * POST /api/auto-recipe/identify-dish
 */
router.post("/identify-dish", upload.single("image"), identifyDish);

router.post("/iniciar-receita-direta", iniciarReceitaDireta);

module.exports = router;
