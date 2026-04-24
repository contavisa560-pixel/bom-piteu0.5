const { getSettings } = require('../../services/systemSettingsService');
const AdminNotificationService = require('../../services/adminNotificationService');
const IpLookupService = require('../../services/ipLookupService');
const { detectDevice } = require('../../services/deviceDetector');
/**
 * MIDDLEWARE: isAdmin
 * Deve ser usado SEMPRE depois do authenticate
 * Garante que só admins acedem às rotas protegidas
 */
const isAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  if (req.user.role !== "admin") {
    const ip = req.ip || req.connection.remoteAddress || 'IP desconhecido';
    const ipDetails = await IpLookupService.getIpDetails(ip);
    const device = detectDevice(req.headers['user-agent'] || '');
    await AdminNotificationService.notifyUnauthorizedAccess(
      req.user,
      ip,
      ipDetails,
      device,
      req.originalUrl
    );
    console.warn(
      `[ADMIN BLOQUEADO] User ${req.user._id} (${req.user.email}) tentou aceder ao painel admin`
    );
    return res.status(403).json({
      error: "Acesso negado. Área restrita a administradores."
    });
  }

  if (req.user.isBanned) {
    return res.status(403).json({ error: "Conta suspensa." });
  }

  // Verificar 2FA para admins se configurado
  const settings = await getSettings();
  if (settings.require2FAForAdmins) {
    const has2FA = req.user.settings?.security?.twoFactorAuth === true;
    if (!has2FA) {
      console.warn(
        `[ADMIN 2FA] User ${req.user._id} (${req.user.email}) tentou aceder sem 2FA activo`
      );
      return res.status(403).json({
        error: "Acesso negado. É necessário activar a autenticação de dois factores (2FA) para administradores."
      });
    }
  }

  next();
};

module.exports = { isAdmin };