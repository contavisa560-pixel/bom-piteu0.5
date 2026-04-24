const mongoose = require("mongoose");
const User = require("../models/User");
const cron = require("node-cron");

// Tipos de uso suportados
const USAGE_TYPES = ["text", "image_gen", "vision"];

// ======================
// Cron Jobs para reset
// ======================

// Reset diário à meia-noite
cron.schedule("0 0 * * *", async () => {
  console.log("[LimitService] Reset diário iniciado...");
  try {
    const users = await User.find();
    for (const user of users) {
      user.usedDaily = 0;
      user.lastResetDaily = new Date();
      await user.save();
    }
    console.log("[LimitService] Reset diário concluído!");
  } catch (err) {
    console.error("[LimitService] Erro no reset diário:", err.message);
  }
});

// Reset semanal aos domingos à meia-noite
cron.schedule("0 0 * * 0", async () => {
  console.log("[LimitService] Reset semanal iniciado...");
  try {
    const users = await User.find();
    for (const user of users) {
      user.usedWeekly = 0;
      user.lastResetWeekly = new Date();
      await user.save();
    }
    console.log("[LimitService] Reset semanal concluído!");
  } catch (err) {
    console.error("[LimitService] Erro no reset semanal:", err.message);
  }
});

// ======================
// Funções do serviço
// ======================

// Verifica se usuário pode usar IA
async function checkLimits(userId, type = "text") {
  if (!USAGE_TYPES.includes(type)) type = "text";

  const user = await User.findById(userId);
  if (!user) return { allowed: false, message: "Usuário não encontrado" };

  if (user.usedDaily >= user.dailyLimit) {
    return { allowed: false, message: "Limite diário atingido" };
  }
  if (user.usedWeekly >= user.weeklyLimit) {
    return { allowed: false, message: "Limite semanal atingido" };
  }

  return { allowed: true };
}

// Incrementa consumo do usuário
async function increment(userId, type = "text") {
  if (!USAGE_TYPES.includes(type)) type = "text";

  const user = await User.findById(userId);
  if (!user) throw new Error("Usuário não encontrado");

  user.usedDaily += 1;
  user.usedWeekly += 1;

  // Log de consumo
  console.log(`[LimitService] ${user.name} (${user._id}) consumiu 1 ${type}. Diário: ${user.usedDaily}/${user.dailyLimit}, Semanal: ${user.usedWeekly}/${user.weeklyLimit}`);

  await user.save();
}

// Retorna status atual do usuário
async function getUserLimitStatus(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("Usuário não encontrado");

  return {
    daily: `${user.usedDaily}/${user.dailyLimit}`,
    weekly: `${user.usedWeekly}/${user.weeklyLimit}`,
  };
}

// Define limites baseados no plano
async function setUserLimits(userId, plan = "FREE") {
  const user = await User.findById(userId);
  if (!user) throw new Error("Usuário não encontrado");

  if (plan === "PREMIUM") {
    user.dailyLimit = 80;   // mensagens GPT-4o
    user.weeklyLimit = 500; // limite semanal
  } else {
    user.dailyLimit = 7;    // FREE
    user.weeklyLimit = 50;  // FREE
  }

  await user.save();
  return user;
}

// ======================
// Export
// ======================
module.exports = {
  checkLimits,
  increment,
  getUserLimitStatus,
  setUserLimits,
  USAGE_TYPES
};
