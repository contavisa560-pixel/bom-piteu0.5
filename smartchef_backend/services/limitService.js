const User = require("../models/User");
const cron = require("node-cron");

const USAGE_TYPES = ["text", "image_gen", "vision"];

// Limites por plano — fonte única de verdade
const PLAN_LIMITS = {
  free:    { text: 7,  image_gen: 3,  vision: 5  },
  premium: { text: 80, image_gen: 25, vision: 50 },
};

// ─── Reset diário à meia-noite ────────────────────────────────────────────────
// Apenas reseta os campos de uso diário (usage.*) — NÃO toca no usageCycle
// O usageCycle tem o seu próprio ciclo de 7 dias
cron.schedule("0 0 * * *", async () => {
  try {
    await User.updateMany({}, {
      $set: {
        "usage.dailyTextRequests":     0,
        "usage.dailyImageGenerations": 0,
        "usage.dailyImageAnalysis":    0,
        lastReset: new Date()
      }
    });
    console.log("[LimitService] Reset diário concluído.");
  } catch (err) {
    console.error("[LimitService] Erro no reset diário:", err.message);
  }
});

// ─── Verifica se o utilizador pode usar determinado tipo de IA ────────────────
async function checkLimits(userId, type = "text") {
  if (!USAGE_TYPES.includes(type)) type = "text";

  const user = await User.findById(userId);
  if (!user) return { allowed: false, message: "Utilizador não encontrado" };

  // Determina o plano activo
  const isPremium = user.isPremium &&
    (!user.premiumExpiresAt || new Date() < user.premiumExpiresAt);
  const plan   = isPremium ? "premium" : "free";
  const limits = PLAN_LIMITS[plan];

  // Mapeia tipo → campo do usageCycle
  const cycleFieldMap = {
    text:      "used",
    image_gen: "imagesUsed",
    vision:    "visionUsed",
  };

  const field   = cycleFieldMap[type];
  const current = user.usageCycle?.[field] || 0;
  const limit   = limits[type];

  // Se o ciclo está bloqueado (limite atingido e ainda não passaram 7 dias)
  if (user.usageCycle?.limitReachedAt) {
    const diffDays = (Date.now() - new Date(user.usageCycle.limitReachedAt)) / (1000 * 60 * 60 * 24);
    if (diffDays < 7) {
      return {
        allowed: false,
        message: `Limite atingido. Renovação em ${Math.ceil(7 - diffDays)} dias.`,
        limitReachedAt: user.usageCycle.limitReachedAt
      };
    }

    // Passaram 7 dias — reset automático do ciclo
    user.usageCycle = {
      used:           0,
      imagesUsed:     0,
      visionUsed:     0,
      startDate:      new Date(),
      limitReachedAt: null
    };
    user.markModified("usageCycle");
    await user.save();
    return { allowed: true, used: 0, limit, remaining: limit };
  }

  if (current >= limit) {
    return {
      allowed: false,
      message: `Limite de ${type} atingido (${current}/${limit})`,
      used: current,
      limit
    };
  }

  return { allowed: true, used: current, limit, remaining: limit - current };
}

// ─── Incrementa o uso e actualiza o usageCycle no MongoDB ────────────────────
async function increment(userId, type = "text") {
  if (!USAGE_TYPES.includes(type)) type = "text";

  const user = await User.findById(userId);
  if (!user) throw new Error("Utilizador não encontrado");

  const isPremium = user.isPremium &&
    (!user.premiumExpiresAt || new Date() < user.premiumExpiresAt);
  const plan   = isPremium ? "premium" : "free";
  const limits = PLAN_LIMITS[plan];

  const cycleFieldMap = {
    text:      "used",
    image_gen: "imagesUsed",
    vision:    "visionUsed",
  };

  const field = cycleFieldMap[type];

  // Garante que o ciclo existe com todos os campos
  if (!user.usageCycle || !user.usageCycle.startDate) {
    user.usageCycle = {
      used:           0,
      imagesUsed:     0,
      visionUsed:     0,
      startDate:      new Date(),
      limitReachedAt: null
    };
  }

  // Garante campo visionUsed em ciclos antigos que não tinham este campo
  if (user.usageCycle.visionUsed === undefined) {
    user.usageCycle.visionUsed = 0;
  }

  // Incrementa o campo correcto
  user.usageCycle[field] = (user.usageCycle[field] || 0) + 1;

  const newValue = user.usageCycle[field];
  const limit    = limits[type];

  // Se atingiu o limite agora pela primeira vez, regista o momento exacto
  if (newValue >= limit && !user.usageCycle.limitReachedAt) {
    user.usageCycle.limitReachedAt = new Date();
    console.log(`[LimitService] ⚠️ Limite de ${type} atingido para ${user.email}`);
  }

  user.markModified("usageCycle");
  await user.save();

  console.log(`[LimitService] ${user.email} — ${type}: ${newValue}/${limit}`);
}

// ─── Retorna estado actual de uso do utilizador ───────────────────────────────
async function getUserLimitStatus(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("Utilizador não encontrado");

  const isPremium = user.isPremium &&
    (!user.premiumExpiresAt || new Date() < user.premiumExpiresAt);
  const plan   = isPremium ? "premium" : "free";
  const limits = PLAN_LIMITS[plan];

  return {
    text:      { used: user.usageCycle?.used       || 0, limit: limits.text      },
    image_gen: { used: user.usageCycle?.imagesUsed || 0, limit: limits.image_gen },
    vision:    { used: user.usageCycle?.visionUsed || 0, limit: limits.vision    },
    limitReachedAt: user.usageCycle?.limitReachedAt || null,
  };
}

module.exports = { checkLimits, increment, getUserLimitStatus, USAGE_TYPES, PLAN_LIMITS };