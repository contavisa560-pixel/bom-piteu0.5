
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const User = require("../models/User");
const Preference = require("../models/Preference");
const { authenticate } = require("../middleware/security/jwtAuth");
const authService = require("../services/authService");

// Configuração do Multer para upload de avatar
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ==================== GET - Buscar Usuário ====================
router.get("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ==================== PUT - Atualizar Usuário ====================
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Não permite atualizar senha por esta rota
    delete updates.password;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json({
      success: true,
      message: "Usuário atualizado com sucesso",
      user: updatedUser
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ==================== ✅ POST - Upload de Avatar ====================
router.post("/:id/avatar", authenticate, upload.single("avatar"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "Imagem não enviada" });
    }

    // Converter para base64 (ou fazer upload para Cloudflare)
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { avatar: base64Image },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json({
      success: true,
      imageUrl: base64Image,
      user: updatedUser
    });
  } catch (error) {
    console.error("Erro no upload de avatar:", error);
    res.status(500).json({ error: "Erro no upload" });
  }
});

// ==================== ✅ PUT - Alterar Senha ====================
router.put("/:id/password", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Senha atual e nova senha são obrigatórias"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "A nova senha deve ter pelo menos 6 caracteres"
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Verificar senha atual
    const isMatch = await authService.comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Senha atual incorreta" });
    }

    // Atualizar senha
    user.password = await authService.hashPassword(newPassword);

    // Atualizar data de última mudança de senha
    if (!user.settings) user.settings = {};
    if (!user.settings.security) user.settings.security = {};
    user.settings.security.lastPasswordChange = new Date();

    await user.save();

    res.json({
      success: true,
      message: "Senha alterada com sucesso"
    });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    res.status(500).json({ error: "Erro ao alterar senha" });
  }
});

// ==================== PATCH - Experiência Culinária COMPLETA ====================
// ==================== PATCH - Experiência Culinária COMPLETA ====================
router.patch("/:id/experience", authenticate, async (req, res) => {
  try {
    console.log("🔵 [DEBUG] Experiência - Recebendo requisição");
    console.log("🔵 [DEBUG] ID do usuário na URL:", req.params.id);
    console.log("🔵 [DEBUG] Usuário autenticado:", req.user._id);
    console.log("🔵 [DEBUG] Dados recebidos:", JSON.stringify(req.body, null, 2));

    const { id } = req.params;
    const userId = req.user._id.toString();
    const { level, years, techniques, equipment, certifications } = req.body;

    // 🔒 Segurança: só o próprio usuário
    if (id !== userId && id !== req.user.id) {
      console.log("🔴 [DEBUG] ERRO: Não autorizado");
      return res.status(403).json({
        success: false,
        error: "Não autorizado"
      });
    }

    console.log("🟢 [DEBUG] Autorização OK - Buscando usuário no MongoDB");

    // 🧠 Validações
    if (level && !["Iniciante", "Intermediário", "Avançado", "Profissional", "Chef"].includes(level)) {
      console.log("🔴 [DEBUG] Nível culinário inválido:", level);
      return res.status(400).json({
        success: false,
        error: "Nível culinário inválido"
      });
    }

    if (years !== undefined && (years < 0 || years > 50)) {
      console.log("🔴 [DEBUG] Anos de experiência inválidos:", years);
      return res.status(400).json({
        success: false,
        error: "Anos de experiência inválidos"
      });
    }

    // AGORA buscar o usuário
    const user = await User.findById(id);
    if (!user) {
      console.log("🔴 [DEBUG] Usuário não encontrado no MongoDB");
      return res.status(404).json({
        success: false,
        error: "Usuário não encontrado"
      });
    }

    console.log("🟢 [DEBUG] Usuário encontrado:", user.email);

    // 🛡️ Garantir estrutura
    if (!user.settings) {
      console.log("🟡 [DEBUG] Criando settings vazio");
      user.settings = {};
    }
    if (!user.settings.experience) {
      console.log("🟡 [DEBUG] Criando experience vazio");
      user.settings.experience = {};
    }

    // ✍️ Atualização COMPLETA
    console.log("🟢 [DEBUG] Atualizando dados...");
    // Converter certifications se for string
    let certificationsToSave = certifications;
    if (typeof certifications === 'string') {
      console.log("🟡 [DEBUG] Convertendo certifications de string para array");
      try {
        certificationsToSave = JSON.parse(certifications);
      } catch (err) {
        console.error("❌ [DEBUG] Erro ao converter certifications:", err);
        return res.status(400).json({
          success: false,
          error: "Formato de certificações inválido"
        });
      }
    }
    if (level !== undefined) {
      console.log("  ↪️ Level:", level);
      user.settings.experience.level = level;
    }
    if (years !== undefined) {
      console.log("  ↪️ Years:", years);
      user.settings.experience.years = years;
    }
    if (techniques !== undefined) {
      console.log("  ↪️ Techniques:", techniques.length, "itens");
      user.settings.experience.techniques = techniques;
    }
    if (equipment !== undefined) {
      console.log("  ↪️ Equipment:", equipment.length, "itens");
      user.settings.experience.equipment = equipment;
    }
    if (certifications !== undefined) {
      console.log("  ↪️ Certifications:", certifications.length, "itens");
      user.settings.experience.certifications = certifications;
    }

    console.log("🟢 [DEBUG] Salvando no MongoDB...");
    await user.save();
    console.log("✅ [DEBUG] Salvo com sucesso!");

    res.json({
      success: true,
      message: "Experiência culinária atualizada",
      experience: user.settings.experience
    });

  } catch (error) {
    console.error("❌ [DEBUG] Erro ao atualizar experiência:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao atualizar experiência culinária"
    });
  }
});

// ====================  GET - Exportar Dados do Usuário ====================
router.get("/:id/export", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const preferences = await Preference.findOne({ userId: id });

    const exportData = {
      user: user.toObject(),
      preferences: preferences ? preferences.toObject() : {},
      exportDate: new Date().toISOString(),
      exportVersion: "1.0"
    };

    res.json(exportData);
  } catch (error) {
    console.error("Erro ao exportar dados:", error);
    res.status(500).json({ error: "Erro ao exportar dados" });
  }
});

// ==================== ✅ DELETE - Eliminar Conta ====================
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Deletar preferências associadas
    await Preference.deleteOne({ userId: id });

    // Deletar usuário
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json({
      success: true,
      message: "Conta eliminada com sucesso"
    });
  } catch (error) {
    console.error("Erro ao eliminar conta:", error);
    res.status(500).json({ error: "Erro ao eliminar conta" });
  }
});

// ==================== GET - Buscar Settings ====================
router.get("/:id/settings", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    if (id !== userId && id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Não autorizado"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "ID inválido"
      });
    }

    const user = await User.findById(id).select("settings email name");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Usuário não encontrado"
      });
    }

    res.json({
      success: true,
      settings: user.settings || {},
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error("❌ Erro ao buscar settings:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor"
    });
  }
});
// ==================== GET - Sessões Ativas ====================
router.get("/:id/sessions", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar autorização
    if (id !== req.user.id && id !== req.user._id.toString()) {
      return res.status(403).json({ error: "Não autorizado" });
    }

    const user = await User.findById(id).select("settings.security.sessions");

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Se não houver sessões, criar a atual
    let sessions = user.settings?.security?.sessions || [];

    if (sessions.length === 0) {
      const currentSession = {
        id: 'session_' + Date.now(),
        device: req.headers['user-agent']?.substring(0, 100) || 'Dispositivo desconhecido',
        ip: req.ip || req.connection.remoteAddress || '127.0.0.1',
        createdAt: new Date(),
        current: true,
        lastActive: new Date()
      };

      // Salvar no banco
      await User.findByIdAndUpdate(id, {
        $set: {
          'settings.security.sessions': [currentSession]
        }
      });

      sessions = [currentSession];
    }

    res.json({ sessions });

  } catch (error) {
    console.error("Erro ao buscar sessões:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ==================== PUT - Atualizar Settings ====================
router.put("/:id/settings", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const newSettings = req.body;
    const userId = req.user._id.toString();

    if (id !== userId && id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Não autorizado"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "ID inválido"
      });
    }

    if (!newSettings || typeof newSettings !== 'object') {
      return res.status(400).json({
        success: false,
        error: "Configurações inválidas"
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      { $set: { settings: newSettings } },
      {
        new: true,
        runValidators: true,
        select: "settings email name _id"
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "Usuário não encontrado"
      });
    }

    res.status(200).json({
      success: true,
      message: "Configurações salvas com sucesso!",
      settings: updatedUser.settings,
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name
      }
    });
  } catch (error) {
    console.error("❌ ERRO ao salvar settings:", error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: "Validação falhou",
        details: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: "Erro interno do servidor"
    });
  }
});

module.exports = router;