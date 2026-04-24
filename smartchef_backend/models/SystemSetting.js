const mongoose = require('mongoose');

const SystemSettingSchema = new mongoose.Schema({
  // ========== GERAL ==========
  siteTitle: { type: String, default: 'Bom Piteu' },
  siteTagline: { type: String, default: 'A tua cozinha inteligente' },
  logoUrl: { type: String, default: '' },
  faviconUrl: { type: String, default: '' },
  supportEmail: { type: String, default: 'suporte@bompiteu.com' },
  maintenanceMode: { type: Boolean, default: false },
  allowNewRegistrations: { type: Boolean, default: true },
  defaultLanguage: { type: String, default: 'pt' },

  // ========== IA ==========
  openaiApiKey: { type: String, default: '' },          // ainda não usado
  openaiModel: { type: String, default: 'gpt-3.5-turbo' },
  aiTemperature: { type: Number, default: 0.7 },
  aiMaxTokens: { type: Number, default: 500 },
  aiFeatures: {
    chat: { type: Boolean, default: true },
    imageGeneration: { type: Boolean, default: true },
    imageAnalysis: { type: Boolean, default: true }
  },

  // ========== UTILIZADORES ==========
  defaultLimits: {
    textLimit: { type: Number, default: 7 },
    imageLimit: { type: Number, default: 2 },
    analysisLimit: { type: Number, default: 3 }
  },
  maxLoginAttempts: { type: Number, default: 5 },
  sessionTimeoutMinutes: { type: Number, default: 120 },
  allowUserDeletion: { type: Boolean, default: true },
  requireEmailVerification: { type: Boolean, default: true },

  // ========== SUBSCRIÇÕES ==========
  premiumPrices: {
    monthly: { type: Number, default: 9.90 },
    yearly: { type: Number, default: 89.90 },
    lifetime: { type: Number, default: 199.90 }
  },
  trialDays: { type: Number, default: 7 },
  freeLimits: {
    textLimit: { type: Number, default: 7 },
    imageLimit: { type: Number, default: 2 },
    analysisLimit: { type: Number, default: 3 }
  },
  subscriptionsEnabled: { type: Boolean, default: true },

  // ========== SEGURANÇA ==========
  rateLimit: {
    windowMs: { type: Number, default: 15 * 60 * 1000 },
    maxRequests: { type: Number, default: 100 }
  },

  require2FAForAdmins: { type: Boolean, default: false },      // ← NOVO
  forcePasswordChangeDays: { type: Number, default: 0 },       // ← NOVO
  // ========== E-MAIL ==========
  smtp: {
    host: { type: String, default: '' },
    port: { type: Number, default: 587 },
    secure: { type: Boolean, default: false },
    user: { type: String, default: '' },
    pass: { type: String, default: '' }
  },
  emailTemplates: {
    welcome: { type: String, default: '' },
    passwordReset: { type: String, default: '' },
    subscriptionConfirmation: { type: String, default: '' }
  },
  enableNotifications: { type: Boolean, default: true },

  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SystemSetting', SystemSettingSchema);