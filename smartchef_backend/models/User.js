const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
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

    // --- 🏆 Gamificação ---
    level: { type: Number, default: 1 },
    points: { type: Number, default: 0 },

    // --- 💎 Gestão Premium (Para o Job de Verificação Diária) ---
    isPremium: { type: Boolean, default: false },
    premiumExpiresAt: { type: Date, default: null }, // Essencial para o Ponto 2 do roteiro

    // --- 📊 Limites de Uso Detalhados (Para o Reset Diário Automático) ---
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

    // --- 🥗 Preferências (Ponto 1 do roteiro - Perfil Alimentar) ---
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

    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);