// routes/historyRoutes.js
const express = require("express");
const router = express.Router();
const History = require("../models/History");
const authMiddleware = require("../middleware/auth");

// Histórico geral
router.get("/", authMiddleware, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;

    const history = await History.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar histórico" });
  }
});

// Histórico por tipo
router.get("/:type", authMiddleware, async (req, res) => {
  try {
    const { type } = req.params;

    if (!["text", "image", "vision"].includes(type)) {
      return res.status(400).json({ error: "Tipo inválido" });
    }

    const history = await History.find({
      user: req.user.id,
      type
    }).sort({ createdAt: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar histórico" });
  }
});

module.exports = router;
