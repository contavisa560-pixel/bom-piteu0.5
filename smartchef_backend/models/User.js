const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        // Apenas obrigatório para usuários locais (não OAuth)
        return this.provider === "local";
      },
    },
    provider: {
      type: String,
      enum: ["local", "google", "facebook", "tiktok", "instagram"],
      default: "local",
    },
    avatar: {
      type: String,
      default: "",
    },
    needsPassword: {
      type: Boolean,
      default: false, // true quando usuário OAuth precisa definir senha
    },
    level: {
      type: Number,
      default: 1,
    },
    points: {
      type: Number,
      default: 0,
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item", // Substitua "Item" pela coleção correspondente
      },
    ],
    isPremium: {
      type: Boolean,
      default: false,
    },
    // Limites de uso (para LimitService)
    usedDaily: {
      type: Number,
      default: 0,
    },
    usedWeekly: {
      type: Number,
      default: 0,
    },
    dailyLimit: {
      type: Number,
      default: 7, // valor padrão para FREE, pode ser ajustado no upgrade
    },
    weeklyLimit: {
      type: Number,
      default: 50, // valor padrão para FREE
    },
    lastReset: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adiciona createdAt e updatedAt automaticamente
  }
);

// Index para busca rápida por email
userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);
