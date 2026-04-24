const { getSettings } = require('../services/systemSettingsService');

module.exports = async (req, res, next) => {
  try {
    // Rotas que NUNCA bloqueiam — mesmo em manutenção
    const alwaysAllowed = [
      '/api/admin',        // painel de admin
      '/api/auth/login',   // login (para admins entrarem)
      '/api/auth/me',      // verificar sessão
      '/api/2fa',          // autenticação 2FA
      '/api/settings/public', // configurações públicas
      '/api/health',       // health check
    ];

    const isAlwaysAllowed = alwaysAllowed.some(path => req.path.startsWith(path));
    if (isAlwaysAllowed) return next();

    const settings = await getSettings();
    if (!settings?.maintenanceMode) return next();

    // Em manutenção — verificar se é admin
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const User = require('../models/User');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('role');
        if (user?.role === 'admin') return next(); // admins passam sempre
      } catch (e) {
        // token inválido — continua para bloquear
      }
    }

    return res.status(503).json({
      error: 'Sistema em manutenção. Tente mais tarde.',
      maintenance: true
    });

  } catch (err) {
    // Se o middleware falhar, não bloqueia o site
    next();
  }
};