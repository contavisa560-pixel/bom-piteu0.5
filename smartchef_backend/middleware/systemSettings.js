const SystemSetting = require('../models/SystemSetting');

// Middleware para verificar modo de manutenção
exports.checkMaintenance = async (req, res, next) => {
  // Ignorar rotas admin e estáticas
  if (req.path.startsWith('/api/admin') || req.path.startsWith('/static')) return next();

  const settings = await SystemSetting.findOne();
  if (settings?.maintenanceMode && (!req.user || req.user.role !== 'admin')) {
    return res.status(503).json({ error: 'Sistema em manutenção. Tente novamente mais tarde.' });
  }
  next();
};

// Middleware para verificar se novos registos são permitidos
exports.checkRegistration = async (req, res, next) => {
  const settings = await SystemSetting.findOne();
  if (!settings?.allowNewRegistrations) {
    return res.status(403).json({ error: 'Novos registos estão temporariamente desactivados.' });
  }
  next();
};