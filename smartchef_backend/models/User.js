const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ==================== AUTENTICAÇÃO ====================
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },

    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
      minlength: 6
    },

    provider: {
      type: String,
      enum: ["local", "google", "facebook", "tiktok", "instagram"],
      default: "local",
    },

    avatar: {
      type: String,
      default: ""
    },

    needsPassword: {
      type: Boolean,
      default: false
    },

    // ==================== GAMIFICAÇÃO ====================
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 100
    },

    points: {
      type: Number,
      default: 0,
      min: 0
    },

    favorites: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe"
      }],
      default: []
    },

    // ==================== PREMIUM ====================
    isPremium: {
      type: Boolean,
      default: false
    },

    premiumExpiresAt: {
      type: Date,
      default: null
    },

    // ==================== LIMITES DE USO ====================
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

    lastReset: {
      type: Date,
      default: Date.now
    },
    usageCycle: {
      used: { type: Number, default: 0 },
      imagesUsed: { type: Number, default: 0 },
      startDate: { type: Date, default: null },
      limitReachedAt: { type: Date, default: null }
    },

    // ==================== DADOS PESSOAIS BÁSICOS ====================
    birthDate: {
      type: Date,
      default: null
    },

    gender: {
      type: String,
      enum: ["Masculino", "Feminino", "Outro", "Prefiro não dizer"],
      default: null
    },

    phone: String,

    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      default: null
    },

    bio: {
      type: String,
      maxlength: 500,
      default: ""
    },
    role: {
      type: String,
      enum: ["user", "moderator", "admin", "superadmin"],
      default: "user"
    },

    isBanned: {
      type: Boolean,
      default: false
    },

    bannedReason: {
      type: String,
      default: null
    },

    bannedAt: {
      type: Date,
      default: null
    },

    country: {
      type: String,
      default: "Angola"
    },

    language: {
      type: String,
      default: "pt"
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // ==================== SEGURANÇA DE LOGIN ====================
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockedUntil: {
      type: Date,
      default: null
    },

    emailVerificationToken: {
      type: String,
    },

    emailVerificationExpires: {
      type: Date,
    },

    passwordResetToken: {
      type: String,
    },

    passwordResetExpires: {
      type: Date,
    },

    // ==================== SETTINGS EMBUTIDOS ====================
    settings: {
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

      // Idioma e Formatação
      dateFormat: {
        type: String,
        enum: ["dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd"],
        default: "dd/MM/yyyy"
      },

      region: {
        type: String,
        default: "pt-AO"
      },

      // Notificações
      alertLogin: {
        type: Boolean,
        default: true
      },

      alertSecurity: {
        type: Boolean,
        default: true
      },

      notifyRecipes: {
        type: Boolean,
        default: true
      },

      newsletter: {
        type: Boolean,
        default: true
      },

      // Experiência Culinária
      experience: {
        level: {
          type: String,
          enum: ["Iniciante", "Intermediário", "Avançado", "Profissional", "Chef"],
          default: "Iniciante"
        },
        years: {
          type: Number,
          min: 0,
          max: 50,
          default: 0
        },
        techniques: [
          {
            name: String,
            difficulty: String
          }
        ],
        equipment: [String],
        certifications: [
          {
            id: { type: String, required: true },
            name: { type: String, required: true },
            url: { type: String, required: true },
            uploadedAt: { type: Date, default: Date.now },
            type: { type: String },
            size: { type: Number }
          }
        ]
      },

      // Segurança
      security: {
        twoFactorAuth: {
          type: Boolean,
          default: false
        },

        twoFactorSecret: {
          type: String,
          select: false
        },
        twoFactorTempSecret: {
          type: String,
          select: false
        },
        twoFactorBackupCodes: {
          type: [String],
          select: false
        },
        twoFactorRecoveryEmail: {
          type: String
        },
        recoveryEmail: String,
        lastPasswordChange: Date,
        sessions: [
          {
            id: String,
            device: String,
            ip: String,
            createdAt: Date,
            current: Boolean
          }
        ]
      }
    }
  },
  {
    timestamps: true
  }
);

// ==================== ÍNDICES ====================
userSchema.index({ email: 1 });
userSchema.index({ provider: 1 });
userSchema.index({ isPremium: 1, premiumExpiresAt: 1 });

// ==================== MÉTODOS DE INSTÂNCIA ====================

userSchema.methods.isActivePremium = function () {
  if (!this.isPremium) return false;
  if (!this.premiumExpiresAt) return true;
  return new Date() < this.premiumExpiresAt;
};

userSchema.methods.hasReachedLimit = function (type) {
  const typeMap = {
    'text': { usage: this.usage.dailyTextRequests, limit: this.limits.textLimit },
    'image': { usage: this.usage.dailyImageGenerations, limit: this.limits.imageLimit },
    'analysis': { usage: this.usage.dailyImageAnalysis, limit: this.limits.analysisLimit }
  };

  const config = typeMap[type];
  if (!config) return false;
  if (this.isActivePremium()) return false;

  return config.usage >= config.limit;
};

userSchema.methods.incrementUsage = async function (type) {
  const typeMap = {
    'text': 'dailyTextRequests',
    'image': 'dailyImageGenerations',
    'analysis': 'dailyImageAnalysis'
  };

  const field = typeMap[type];
  if (!field) return;

  this.usage[field] += 1;
  await this.save();
};

userSchema.methods.resetDailyLimits = async function () {
  this.usage.dailyTextRequests = 0;
  this.usage.dailyImageGenerations = 0;
  this.usage.dailyImageAnalysis = 0;
  this.lastReset = new Date();
  await this.save();
};

// ==================== MÉTODOS ESTÁTICOS ====================

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActivePremium = function () {
  return this.find({
    isPremium: true,
    $or: [
      { premiumExpiresAt: null },
      { premiumExpiresAt: { $gt: new Date() } }
    ]
  });
};

module.exports = mongoose.model("User", userSchema);
