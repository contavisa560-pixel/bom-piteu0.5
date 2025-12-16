// middleware/bruteForce.js
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
});

module.exports = loginLimiter;
