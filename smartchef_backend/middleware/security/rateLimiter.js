const rateLimit = require("express-rate-limit");
const { getSettings } = require("../../services/systemSettingsService");

let dynamicApiLimiter = null;
let lastUpdate = 0;
const UPDATE_INTERVAL = 60 * 1000; // 1 minuto

async function getApiLimiter() {
  const now = Date.now();
  if (dynamicApiLimiter && (now - lastUpdate) < UPDATE_INTERVAL) {
    return dynamicApiLimiter;
  }

  const settings = await getSettings();
  const maxRequests = settings.rateLimit?.maxRequests || 100;
  const windowMs = settings.rateLimit?.windowMs || 15 * 60 * 1000;

  dynamicApiLimiter = rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Muitas requisições. Por favor, tente novamente mais tarde.",
    },
  });
  lastUpdate = now;
  return dynamicApiLimiter;
}

/**
 * Limite de Autenticação (Proteção contra Brute Force)
 *  (10 tentativas/15min)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Muitas tentativas de acesso. Tente novamente após 15 minutos.",
  },
});

/**
 * Limite de IA (Proteção de Custo/Carteira)
 *  Rotas que geram receitas, analisam fotos ou usam o ChatBot.
 *  (1500 requisições/hora)
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 1500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Limite de uso da IA atingido para esta hora. Descanse um pouco e volte já!",
  },
});

module.exports = { 
  getApiLimiter,
  authLimiter, 
  aiLimiter 
};