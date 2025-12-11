const express = require("express");
const router = express.Router();
const Preferences = require("../models/Preferences");

// GET PREFERENCES
router.get("/:userId", async (req, res) => {
  try {
    const preferences = await Preferences.findOne({ userId: req.params.id });
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
      { userId: req.params.id },
      req.body,
      { new: true, upsert: true }
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