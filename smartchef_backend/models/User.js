const mongoose = require("mongoose");

/**
 * USER MODEL - Bom Piteu / SmartChef
 * * RESPONSABILIDADE:
 * - Autenticação e Gamificação
 * - Limites de IA (Free vs Premium)
 * - Canto de Saúde (Estatísticas Nutricionais)
 * - Configurações de Experiência e Segurança
 */

const userSchema = new mongoose.Schema(
  {
    // ==================== AUTENTICAÇÃO ====================
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: function () { return this.provider === "local"; },
      minlength: 6
    },
    provider: {
      type: String,
      enum: ["local", "google", "facebook", "tiktok", "instagram"],
      default: "local",
    },
    avatar: { type: String, default: "" },
    needsPassword: { type: Boolean, default: false },

    // ==================== GAMIFICAÇÃO ====================
    level: { type: Number, default: 1 },
    points: { type: Number, default: 0 },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],

    // ==================== PREMIUM & LIMITES ====================
    isPremium: { type: Boolean, default: false },
    premiumExpiresAt: { type: Date, default: null },
    
    usage: {
      dailyTextRequests: { type: Number, default: 0 },
      dailyImageGenerations: { type: Number, default: 0 },
      dailyImageAnalysis: { type: Number, default: 0 },
    },
    limits: {
      textLimit: { type: Number, default: 7 },
      imageLimit: { type: Number, default: 2 },
      analysisLimit: { type: Number, default: 3 },
    },
    lastReset: { type: Date, default: Date.now },

    // ==================== DADOS PESSOAIS ====================
    birthDate: { type: Date, default: null },
    gender: { 
      type: String, 
      enum: ["Masculino", "Feminino", "Outro", "Prefiro não dizer"], 
      default: "Prefiro não dizer" 
    },
    country: { type: String, default: "Angola" },
    language: { type: String, default: "pt" },

    // ==================== ✅ CANTO DE SAÚDE (INTEGRADO) ====================
    healthCorner: {
      alerts: {
        enableCalorieAlert: { type: Boolean, default: false },
        calorieLimit: { type: Number, default: 800 },
        enableFatAlert: { type: Boolean, default: false },
        fatLimit: { type: Number, default: 30 }
      },
      nutritionStats: {
        vegetables: { type: Number, default: 0 },
        fruits: { type: Number, default: 0 },
        tubers: { type: Number, default: 0 },
        legumes: { type: Number, default: 0 },
        vitamins: {
          vitaminA: { type: Number, default: 0 },
          vitaminC: { type: Number, default: 0 },
          fiber: { type: Number, default: 0 },
          protein: { type: Number, default: 0 }
        }
      }
    },

    // ==================== SETTINGS & EXPERIÊNCIA ====================
    settings: {
      theme: { type: String, enum: ["light", "dark", "system"], default: "light" },
      compactMode: { type: Boolean, default: false },
      experience: {
        level: { 
          type: String, 
          enum: ["Iniciante", "Intermediário", "Avançado", "Profissional", "Chef"], 
          default: "Iniciante" 
        },
        equipment: [String]
      },
      security: {
        twoFactorAuth: { type: Boolean, default: false },
        sessions: [{
          id: String,
          device: String,
          ip: String,
          createdAt: { type: Date, default: Date.now }
        }]
      }
    }
  },
  { timestamps: true }
);

// ==================== ÍNDICES ====================
userSchema.index({ email: 1 });
userSchema.index({ "healthCorner.nutritionStats.vegetables": -1 });

// ==================== MÉTODOS DE INSTÂNCIA ====================

// Verifica se o Premium está ativo
userSchema.methods.isActivePremium = function () {
  if (!this.isPremium) return false;
  if (!this.premiumExpiresAt) return true;
  return new Date() < this.premiumExpiresAt;
};

// Verifica limites de IA
userSchema.methods.hasReachedLimit = function (type) {
  if (this.isActivePremium()) return false;
  
  const mapping = {
    'text': { current: this.usage.dailyTextRequests, max: this.limits.textLimit },
    'image': { current: this.usage.dailyImageGenerations, max: this.limits.imageLimit },
    'analysis': { current: this.usage.dailyImageAnalysis, max: this.limits.analysisLimit }
  };

  const config = mapping[type];
  return config ? config.current >= config.max : false;
};

// Incrementa uso de IA
userSchema.methods.incrementUsage = async function (type) {
  const fields = {
    'text': 'dailyTextRequests',
    'image': 'dailyImageGenerations',
    'analysis': 'dailyImageAnalysis'
  };
  if (fields[type]) {
    this.usage[fields[type]] += 1;
    await this.save();
  }
};

// Atualiza estatísticas de saúde e ganha pontos
userSchema.methods.completeRecipeStats = async function (nutritionData) {
  // nutritionData espera: { vegetables: 1, fruits: 0, fiber: 1, points: 50 }
  if (nutritionData.vegetables) this.healthCorner.nutritionStats.vegetables += nutritionData.vegetables;
  if (nutritionData.fruits) this.healthCorner.nutritionStats.fruits += nutritionData.fruits;
  if (nutritionData.vitamins) {
    Object.keys(nutritionData.vitamins).forEach(vit => {
      this.healthCorner.nutritionStats.vitamins[vit] += 1;
    });
  }
  
  this.points += (nutritionData.points || 10);
  // Lógica simples de subir de nível a cada 1000 pontos
  this.level = Math.floor(this.points / 1000) + 1;
  
  await this.save();
};

module.exports = mongoose.model("User", userSchema);