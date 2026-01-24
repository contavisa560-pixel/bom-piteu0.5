const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { upload } = require("../middleware/validateUploads");

// TEXTO
router.post("/text", chatController.handleChat);

// IMAGEM
router.post(
  "/image",
  upload([".jpg", ".jpeg", ".png"]).single("image"),
  chatController.handleImageChat
);

module.exports = router;
