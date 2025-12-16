const rateLimit = require("express-rate-limit");

// Limite global para todas as rotas API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo de 100 requisições por IP a cada 15 minutos
  standardHeaders: true, // retorna informações de limite nos headers `RateLimit-*`
  legacyHeaders: false, // desativa headers antigos `X-RateLimit-*`
  message: {
    error: "Too many requests, please try again later.",
  },
});

// Limite específico para rotas sensíveis (login, registro, etc.)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo de 10 requisições por IP nesse período
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts. Try again later.",
  },
});

module.exports = { apiLimiter, authLimiter };
