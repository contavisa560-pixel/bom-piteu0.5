const express = require("express");
const router = express.Router();
const multer = require("multer");
const ctrl = require("../controllers/internationalRecipeController");
const { authenticate } = require("../middleware/security/jwtAuth");
const { isAdminOrAbove } = require("../middleware/security/hasPermission");

// multer em memória (para passar buffer ao Cloudflare)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Apenas imagens são permitidas"), false);
  }
});

// ── Rota pública (frontend usa isto) ─────────────────────────────────────────
router.get("/public", ctrl.listPublic);
router.get("/daily-suggestions", ctrl.dailySuggestions);

// ── Rotas admin (protegidas) ──────────────────────────────────────────────────
router.use(authenticate, isAdminOrAbove);

router.get("/",                    ctrl.listAdmin);
router.post("/",        upload.single("imagem"), ctrl.create);
router.put("/:id",      upload.single("imagem"), ctrl.update);
router.delete("/:id",              ctrl.remove);
router.patch("/:id/toggle",        ctrl.toggleActive);
router.post("/bulk-import",        ctrl.bulkImport);

module.exports = router;