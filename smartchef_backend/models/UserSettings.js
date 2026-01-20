// models/UserSettings.js
const mongoose = require("mongoose");

/**
 *  USER SETTINGS MODEL - Configurações de Aplicação
 * 
 * RESPONSABILIDADE:
 * - Tema (claro/escuro)
 * - Idioma da interface
 * - Notificações
 * - Privacidade
 * - Dispositivos conectados
 * 
 * RELAÇÃO: 1-para-1 com User
 */

const UserSettingsSchema = new mongoose.Schema(
  {
    // ==================== RELAÇÃO COM USUÁRIO ====================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // ==================== APARÊNCIA ====================
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "light"
    },
    
    compactMode: {
      type: Boolean,
      default: false
    },
    
    animations: {
      type: Boolean,
      default: true
    },

    // ==================== IDIOMA & REGIÃO ====================
    language: {
      type: String,
      enum: ["pt", "en", "es", "fr"],
      default: "pt"
    },
    
    region: {
      type: String,
      default: "pt-AO" // Angola
    },
    
    dateFormat: {
      type: String,
      enum: ["dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd"],
      default: "dd/MM/yyyy"
    },

    // ==================== NOTIFICAÇÕES ====================
    notifications: {
      email: {
        enabled: { type: Boolean, default: true },
        recipes: { type: Boolean, default: true },
        tips: { type: Boolean, default: true },
        promotions: { type: Boolean, default: false }
      },
      push: {
        enabled: { type: Boolean, default: true },
        recipeReady: { type: Boolean, default: true },
        dailyTips: { type: Boolean, default: false }
      },
      inApp: {
        sound: { type: Boolean, default: true },
        vibration: { type: Boolean, default: true }
      }
    },

    // ==================== ALERTAS DE SEGURANÇA ====================
    security: {
      alertLogin: {
        type: Boolean,
        default: true
      },
      alertPasswordChange: {
        type: Boolean,
        default: true
      },
      twoFactorEnabled: {
        type: Boolean,
        default: false
      },
      recoveryEmail: String
    },

    // ==================== DISPOSITIVOS CONECTADOS ====================
    devices: [
      {
        id: {
          type: String,
          required: true
        },
        name: String,
        userAgent: String,
        ip: String,
        lastAccess: {
          type: Date,
          default: Date.now
        },
        current: {
          type: Boolean,
          default: false
        }
      }
    ],

    // ==================== PRIVACIDADE ====================
    privacy: {
      profilePublic: {
        type: Boolean,
        default: false
      },
      showFavorites: {
        type: Boolean,
        default: true
      },
      showLevel: {
        type: Boolean,
        default: true
      },
      allowAnalytics: {
        type: Boolean,
        default: true
      }
    },

    // ==================== BACKUP ====================
    backup: {
      lastBackup: Date,
      autoBackup: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        default: "weekly"
      }
    },

    // ==================== BLOQUEIO AUTOMÁTICO ====================
    autoLock: {
      type: Number, // minutos
      min: 0,
      max: 60,
      default: 10
    },
  },
  { 
    timestamps: true 
  }
);

// ==================== ÍNDICES ====================
UserSettingsSchema.index({ userId: 1 });

// ==================== MÉTODOS DE INSTÂNCIA ====================

/**
 * Adiciona ou atualiza dispositivo
 */
UserSettingsSchema.methods.registerDevice = function(deviceInfo) {
  const existing = this.devices.find(d => d.id === deviceInfo.id);
  
  if (existing) {
    existing.lastAccess = new Date();
    existing.ip = deviceInfo.ip;
  } else {
    this.devices.push({
      id: deviceInfo.id,
      name: deviceInfo.name,
      userAgent: deviceInfo.userAgent,
      ip: deviceInfo.ip,
      current: deviceInfo.current || false
    });
  }
  
  return this.save();
};

/**
 * Remove dispositivo por ID
 */
UserSettingsSchema.methods.removeDevice = function(deviceId) {
  this.devices = this.devices.filter(d => d.id !== deviceId);
  return this.save();
};

/**
 * Marca dispositivo atual
 */
UserSettingsSchema.methods.setCurrentDevice = function(deviceId) {
  this.devices.forEach(d => {
    d.current = (d.id === deviceId);
  });
  return this.save();
};

/**
 * Retorna configurações para o frontend
 */
UserSettingsSchema.methods.toClientFormat = function() {
  return {
    theme: this.theme,
    language: this.language,
    compactMode: this.compactMode,
    animations: this.animations,
    dateFormat: this.dateFormat,
    notifications: this.notifications,
    privacy: this.privacy
  };
};

module.exports = mongoose.model("UserSettings", UserSettingsSchema);