const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo de tentativas
  message: "Muitas tentativas de login, tente novamente mais tarde."
});

module.exports = { loginLimiter };
