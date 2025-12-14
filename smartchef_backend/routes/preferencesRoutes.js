const express = require("express");
const router = express.Router();
const Preferences = require("../models/Preference");

// GET PREFERENCES
router.get("/:userId", async (req, res) => {
  try {
    const preferences = await Preferences.findOne({ userId: req.params.userId });
    return res.json({
      success: true,
      data: preferences || {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao buscar preferências",
      error
    });
  }
});

// UPDATE / CREATE PREFERENCES
router.post("/:userId", async (req, res) => {
  try {
    const updated = await Preferences.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true, upsert: true } // upsert cria se não existir
    );

    return res.json({
      success: true,
      message: "Preferências atualizadas!",
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao salvar preferências",
      error
    });
  }
});

module.exports = router;
