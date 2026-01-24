// routes/settingsRoutes.js
const express = require("express");
const router = express.Router();
const UserSettings = require("../models/UserSettings");
const { authenticate } = require("../middleware/security/jwtAuth");

/**
 * TODAS AS ROTAS EXIGEM AUTENTICAÇÃO
 * Gerencia configurações de app (tema, idioma, notificações)
 */

// ==================== GET - Buscar Configurações ====================
/**
 * GET /api/settings
 * Retorna configurações do usuário autenticado
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log("📥 GET Settings:", { userId });
    
    let settings = await UserSettings.findOne({ userId });
    
    // Se não existir, cria configurações padrão
    if (!settings) {
      console.log("⚠️ Settings não encontrados, criando padrão");
      
      settings = await UserSettings.create({
        userId,
        theme: "light",
        language: "pt",
        compactMode: false,
        animations: true,
        notifications: {
          email: {
            enabled: true,
            recipes: true,
            tips: true,
            promotions: false
          },
          push: {
            enabled: true,
            recipeReady: true,
            dailyTips: false
          },
          inApp: {
            sound: true,
            vibration: true
          }
        },
        security: {
          alertLogin: true,
          alertPasswordChange: true,
          twoFactorEnabled: false
        },
        privacy: {
          profilePublic: false,
          showFavorites: true,
          showLevel: true,
          allowAnalytics: true
        }
      });
    }
    
    console.log("✅ Settings encontrados");
    
    res.json({
      success: true,
      data: settings.toClientFormat() // Retorna apenas campos relevantes
    });
    
  } catch (error) {
    console.error("❌ Erro ao buscar settings:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar configurações",
      error: error.message
    });
  }
});

// ==================== POST/PUT - Atualizar Configurações ====================
/**
 * POST /api/settings
 * Atualiza configurações (upsert)
 */
router.post("/", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;
    
    console.log("📤 POST Settings:", { userId, updates: Object.keys(updates) });
    
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { ...updates, userId },
      { 
        new: true,
        upsert: true,
        runValidators: true
      }
    );
    
    console.log("✅ Settings salvos");
    
    res.json({
      success: true,
      message: "Configurações atualizadas!",
      data: settings.toClientFormat()
    });
    
  } catch (error) {
    console.error("❌ Erro ao salvar settings:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Erro de validação",
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Erro ao salvar configurações",
      error: error.message
    });
  }
});

// ==================== PATCH - Atualização de Campo Específico ====================
/**
 * PATCH /api/settings/:field
 * Atualiza um campo específico (ex: theme, language)
 */
router.patch("/:field", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { field } = req.params;
    const { value } = req.body;
    
    console.log("🔧 PATCH Settings field:", { userId, field, value });
    
    // Validações específicas
    const allowedFields = [
      'theme', 'language', 'compactMode', 'animations', 
      'dateFormat', 'region', 'autoLock'
    ];
    
    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        success: false,
        message: `Campo '${field}' não pode ser atualizado diretamente`
      });
    }
    
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: { [field]: value } },
      { 
        new: true,
        upsert: true,
        runValidators: true
      }
    );
    
    console.log(`✅ Campo '${field}' atualizado`);
    
    res.json({
      success: true,
      message: `${field} atualizado!`,
      data: settings.toClientFormat()
    });
    
  } catch (error) {
    console.error("❌ Erro no PATCH:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar campo",
      error: error.message
    });
  }
});

// ==================== PUT - Notificações ====================
/**
 * PUT /api/settings/notifications
 * Atualiza configurações de notificações
 */
router.put("/notifications", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = req.body;
    
    console.log("🔔 PUT Notifications:", { userId });
    
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: { notifications } },
      { 
        new: true,
        upsert: true
      }
    );
    
    console.log("✅ Notificações atualizadas");
    
    res.json({
      success: true,
      message: "Notificações atualizadas!",
      data: settings.notifications
    });
    
  } catch (error) {
    console.error("❌ Erro ao atualizar notificações:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar notificações",
      error: error.message
    });
  }
});

// ==================== POST - Registrar Dispositivo ====================
/**
 * POST /api/settings/devices
 * Registra novo dispositivo conectado
 */
router.post("/devices", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, userAgent, ip, current } = req.body;
    
    console.log("📱 POST Device:", { userId, name });
    
    let settings = await UserSettings.findOne({ userId });
    
    if (!settings) {
      settings = await UserSettings.create({ userId });
    }
    
    const deviceInfo = {
      id: `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name || userAgent || "Dispositivo desconhecido",
      userAgent: userAgent || req.headers['user-agent'],
      ip: ip || req.ip,
      current: current || false
    };
    
    await settings.registerDevice(deviceInfo);
    
    console.log("✅ Dispositivo registrado");
    
    res.json({
      success: true,
      message: "Dispositivo registrado!",
      device: deviceInfo
    });
    
  } catch (error) {
    console.error("❌ Erro ao registrar dispositivo:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao registrar dispositivo",
      error: error.message
    });
  }
});

// ==================== DELETE - Remover Dispositivo ====================
/**
 * DELETE /api/settings/devices/:deviceId
 * Remove dispositivo conectado
 */
router.delete("/devices/:deviceId", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { deviceId } = req.params;
    
    console.log("🗑️ DELETE Device:", { userId, deviceId });
    
    const settings = await UserSettings.findOne({ userId });
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Configurações não encontradas"
      });
    }
    
    await settings.removeDevice(deviceId);
    
    console.log("✅ Dispositivo removido");
    
    res.json({
      success: true,
      message: "Dispositivo removido com sucesso"
    });
    
  } catch (error) {
    console.error("❌ Erro ao remover dispositivo:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao remover dispositivo",
      error: error.message
    });
  }
});

// ==================== POST - Backup ====================
/**
 * POST /api/settings/backup
 * Cria backup das configurações
 */
router.post("/backup", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log("💾 POST Backup:", { userId });
    
    const settings = await UserSettings.findOne({ userId });
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Nenhuma configuração para fazer backup"
      });
    }
    
    settings.backup.lastBackup = new Date();
    await settings.save();
    
    const backupData = {
      timestamp: new Date(),
      settings: settings.toObject()
    };
    
    console.log("✅ Backup criado");
    
    res.json({
      success: true,
      message: "Backup criado com sucesso!",
      data: backupData
    });
    
  } catch (error) {
    console.error("❌ Erro ao criar backup:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao criar backup",
      error: error.message
    });
  }
});

module.exports = router;