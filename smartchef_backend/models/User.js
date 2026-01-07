const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
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
    },
    provider: {
      type: String,
      enum: ["local", "google", "facebook", "tiktok", "instagram"],
      default: "local",
    },
    avatar: { type: String, default: "" },
    needsPassword: { type: Boolean, default: false },

    // 🏆 Gamificação
    level: { type: Number, default: 1 },
    points: { type: Number, default: 0 },

    // 💎 Gestão Premium
    isPremium: { type: Boolean, default: false },
    premiumExpiresAt: { type: Date, default: null },

    // 📊 Limites de Uso
    usage: {
      dailyTextRequests: { type: Number, default: 0 },
      dailyImageGenerations: { type: Number, default: 0 },
      dailyImageAnalysis: { type: Number, default: 0 },
    },
    limits: {
      textLimit: { type: Number, default: 7 }, // Padrão FREE
      imageLimit: { type: Number, default: 2 },
      analysisLimit: { type: Number, default: 3 },
    },
    lastReset: { type: Date, default: Date.now },

    // 🥗 Preferências Alimentares
    preferences: {
      dietaryRestrictions: [{ type: String }], // ex: "Vegano", "Sem Glúten"
      allergies: [{ type: String }],           // ex: "Marisco", "Lactose"
      goals: { type: String, default: "Saudável" },
      experienceLevel: { 
        type: String, 
        enum: ["iniciante", "intermediário", "chef"], 
        default: "iniciante" 
      }
    },

    // 🔧 Configurações
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        theme: "light",
        language: "pt",
        notifications: true,
        privacy: "public"
      }
    },

    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
  },
  { timestamps: true }
);

// Indexação para busca rápida por email
userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);