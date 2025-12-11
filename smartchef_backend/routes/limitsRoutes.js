const express = require("express");
const router = express.Router();
const limitService = require("../services/limitService");

// CHECK LIMITS
router.get("/limits/:id/check", async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await limitService.checkUserLimit(userId);
    return res.json({
      success: true,
      data: result
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao checar limites",
      error
    });
  }
});

// OPTIONAL: RESET LIMITS (para testes)
router.post("/limits/:id/check", async (req, res) => {
  try {
    const 
    const reset = await limitService.resetifNeeded(user);
    return res.json({
      success: true,
      message: "Limites resetados!",
      data: reset
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erro ao resetar limites",
      error
    });
  }
});

module.exports = router;