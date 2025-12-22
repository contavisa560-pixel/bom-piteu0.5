const rateLimit = require("express-rate-limit");

/**
 * 1️⃣ Limite Global (Proteção do Servidor)
 * Evita ataques de negação de serviço (DoS) em rotas comuns.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo de 100 requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Muitas requisições. Por favor, tente novamente mais tarde.",
  },
});

/**
 * 2️⃣ Limite de Autenticação (Proteção contra Brute Force)
 * Aplicar em: /api/auth/login e /api/auth/register
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Apenas 10 tentativas de login/registo
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Muitas tentativas de acesso. Tente novamente após 15 minutos.",
  },
});

/**
 * 3️⃣ Limite de IA (Proteção de Custo/Carteira)
 * Aplicar em: Rotas que geram receitas, analisam fotos ou usam o ChatBot.
 * Este é o ponto mais crítico para manter o custo sob controlo.
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 15, // Máximo de 15 interações pesadas com IA por hora por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Limite de uso da IA atingido para esta hora. Descanse um pouco e volte já!",
  },
});

module.exports = { 
  apiLimiter, 
  authLimiter, 
  aiLimiter 
};