const express = require("express");
const router = express.Router();
const multer = require("multer");
const ctrl = require("../controllers/specialRecipeController");
const { authenticate } = require("../middleware/security/jwtAuth");
const { isAdminOrAbove } = require("../middleware/security/hasPermission");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) cb(null, true);
        else cb(new Error("Apenas imagens"), false);
    }
});

// Público
router.get("/public", ctrl.listPublic);

// Admin
router.use(authenticate, isAdminOrAbove);
router.get("/", ctrl.listAdmin);
router.post("/", upload.single("imagem"), ctrl.create);
router.put("/:id", upload.single("imagem"), ctrl.update);
router.delete("/:id", ctrl.remove);
router.patch("/:id/toggle", ctrl.toggleActive);
router.post("/bulk-import", ctrl.bulkImport);

module.exports = router;