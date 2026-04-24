/**
 * MIDDLEWARE: hasPermission
 * Verifica se o utilizador tem permissão para aceder a um recurso
 * 
 * Hierarquia de roles:
 * - superadmin → acesso total a tudo
 * - admin → gestão operacional (utilizadores, subscrições, suporte, stats)
 * - moderator → apenas suporte e visualização básica
 * 
 * Uso: router.get("/rota", authenticate, hasPermission("admin"), controller)
 */

// Define quais roles têm acesso a cada recurso
const PERMISSIONS = {
  // Métricas e dashboard
  "metrics":              ["admin", "superadmin"],
  "stats":                ["admin", "superadmin"],
  "health":               ["admin", "superadmin"],

  // Utilizadores
  "users.list":           ["admin", "superadmin"],
  "users.detail":         ["admin", "superadmin"],
  "users.update":         ["admin", "superadmin"],
  "users.ban":            ["admin", "superadmin"],
  "users.make-admin":     ["superadmin"],           // só superadmin pode criar admins
  "users.bulk-ban":       ["admin", "superadmin"],

  // Subscrições
  "subscriptions.list":   ["admin", "superadmin"],
  "subscriptions.manage": ["admin", "superadmin"],
  "subscriptions.history":["admin", "superadmin"],

  // Logs
  "logs":                 ["superadmin"],           // só superadmin vê logs completos

  // Notificações
  "notifications":        ["admin", "superadmin"],
  "notifications.send":   ["admin", "superadmin"],

  // Suporte
  "support":              ["moderator", "admin", "superadmin"],

  // Configurações do sistema
  "settings.read":        ["superadmin"],
  "settings.write":       ["superadmin"],

  // Gestão de admins (ver equipa)
  "team":                 ["superadmin"],
};

/**
 * Verifica se um role tem permissão para um recurso
 */
function roleHasPermission(role, resource) {
  const allowed = PERMISSIONS[resource];
  if (!allowed) return false;
  return allowed.includes(role);
}

/**
 * Middleware factory — uso: hasPermission("users.list")
 */
const hasPermission = (resource) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  const role = req.user.role;

  // Superadmin tem acesso a tudo
  if (role === "superadmin") return next();

  // Admins e moderadores verificam permissões
  if (!["admin", "moderator", "superadmin"].includes(role)) {
    return res.status(403).json({ error: "Acesso negado." });
  }

  if (!roleHasPermission(role, resource)) {
    console.warn(
      `[PERMISSÃO NEGADA] ${role} ${req.user.email} tentou aceder a "${resource}"`
    );
    return res.status(403).json({
      error: `O teu nível de acesso (${role}) não permite aceder a esta funcionalidade.`
    });
  }

  next();
};

/**
 * Middleware básico — só verifica se é admin/moderator/superadmin
 */
const isAdminOrAbove = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Não autenticado" });

  const validRoles = ["admin", "moderator", "superadmin"];
  if (!validRoles.includes(req.user.role)) {
    return res.status(403).json({ error: "Acesso restrito a administradores." });
  }

  if (req.user.isBanned) {
    return res.status(403).json({ error: "Conta suspensa." });
  }

  next();
};

module.exports = { hasPermission, isAdminOrAbove, PERMISSIONS, roleHasPermission };