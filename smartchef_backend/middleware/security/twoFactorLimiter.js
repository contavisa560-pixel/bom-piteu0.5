// smartchef_backend/middleware/security/twoFactorLimiter.js
const rateLimit = require('express-rate-limit');

// Limita tentativas de 2FA para prevenir brute force
const twoFactorLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	max: 5, // 5 tentativas por IP
	skipSuccessfulRequests: true, // Não contar tentativas bem-sucedidas
	standardHeaders: true, // Retorna info de rate limit nos headers `RateLimit-*`
	legacyHeaders: false, // Desabilita os headers `X-RateLimit-*`
	message: {
		error: 'Muitas tentativas de verificação 2FA. Tente novamente em 15 minutos.'
	}

	// O express-rate-limit por padrão já usa o IP (req.ip) de forma segura,
	// inclusive para IPv6, desde que o trust proxy esteja configurado corretamente.
});

module.exports = twoFactorLimiter;