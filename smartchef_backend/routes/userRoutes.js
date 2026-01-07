const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const auth = require("../middleware/auth"); 

// Middleware de debug
router.use("/:id/settings", (req, res, next) => {
  console.log("=== DEBUG SETTINGS UPDATE ===");
  console.log("User ID (params):", req.params.id);
  console.log("User ID (auth):", req.user?.id);
  console.log("Body:", JSON.stringify(req.body, null, 2));
  next();
});

// ADICIONE AUTENTICAÇÃO e VERIFICAÇÃO DE DONO
router.put("/:id/settings", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const newSettings = req.body;

    console.log("1. ID da URL:", id);
    console.log("2. ID do usuário logado:", req.user.id);
    console.log("3. New settings:", newSettings);

    // VERIFICAR SE É O PRÓPRIO USUÁRIO
    if (id !== req.user.id) {
      console.log("❌ Tentativa de alterar usuário errado");
      return res.status(403).json({ error: "Não autorizado a alterar este usuário." });
    }

    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido." });
    }

    // Verificar body
    if (!newSettings || Object.keys(newSettings).length === 0) {
      return res.status(400).json({ error: "Definições vazias." });
    }

    // BUSCAR E ATUALIZAR ATÔMICAMENTE
    const updatedUser = await User.findOneAndUpdate(
      { _id: id }, // Garante que só atualiza se existir
      { $set: { settings: newSettings } },
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    console.log("✅ Settings salvos:", updatedUser.settings);

    //  RETORNAR TOKEN ATUALIZADO para frontend atualizar localStorage
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    res.status(200).json({ 
      message: "Definições salvas!",
      settings: updatedUser.settings,
      userId: updatedUser._id,
      token: token // Frontend precisa atualizar o token no localStorage
    });

  } catch (error) {
    console.error("❌ ERRO:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: "Validação falhou", details: error.message });
    }
    
    res.status(500).json({ error: "Erro no servidor" });
  }
});

module.exports = router;