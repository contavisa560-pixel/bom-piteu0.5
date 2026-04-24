// routes/admin.js — versão com permissões por role
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate } = require("../middleware/security/jwtAuth");
const { isAdminOrAbove, hasPermission } = require("../middleware/security/hasPermission");

// Todos precisam estar autenticados e ser pelo menos moderador
router.use(authenticate, isAdminOrAbove);

// ── Métricas & Dashboard ──────────────────────────────────────────────────────
router.get("/metrics", hasPermission("metrics"), adminController.getGlobalMetrics);
router.get("/usage-timeline", hasPermission("stats"), adminController.getUsageTimeline);
router.get("/top-users", hasPermission("stats"), adminController.getTopUsers);
router.get("/health-summary", hasPermission("health"), adminController.getHealthSummary);
router.get("/advanced-stats", hasPermission("stats"), adminController.getAdvancedStats);

// ── Cache de Imagens ──────────────────────────────────────────────────────────
router.get("/image-cache", hasPermission("stats"), adminController.getImageCacheStats);
router.delete("/image-cache/:id", hasPermission("stats"), adminController.deleteImageCache);
router.delete("/image-cache", hasPermission("stats"), adminController.clearImageCache);

// ── Utilizadores ──────────────────────────────────────────────────────────────
router.get("/users", hasPermission("users.list"), adminController.listUsers);
router.get("/users/:id", hasPermission("users.detail"), adminController.getUserDetail);
router.put("/users/:id", hasPermission("users.update"), adminController.updateUser);
router.post("/users/:id/ban", hasPermission("users.ban"), adminController.banUser);
router.post("/users/:id/unban", hasPermission("users.ban"), adminController.unbanUser);
router.post("/users/:id/make-admin", hasPermission("users.make-admin"), adminController.makeAdmin);
router.post("/bulk-ban", hasPermission("users.bulk-ban"), adminController.bulkBanUsers);

// ── Subscrições ───────────────────────────────────────────────────────────────
router.get("/subscriptions", hasPermission("subscriptions.list"), adminController.listSubscriptions);
router.post("/users/:id/activate-premium", hasPermission("subscriptions.manage"), adminController.activatePremium);
router.post("/users/:id/cancel-premium", hasPermission("subscriptions.manage"), adminController.cancelPremium);
router.get("/subscriptions/history", hasPermission("subscriptions.history"), adminController.subscriptionHistory);

// ── Logs ─────────────────────────────────────────────────────────────────────
router.get("/logs", hasPermission("logs"), adminController.getAuditLogs);

// ── Notificações ──────────────────────────────────────────────────────────────
router.get("/notifications", hasPermission("notifications"), adminController.getAdminNotifications);
router.put("/notifications/:id/read", hasPermission("notifications"), adminController.markAdminNotificationRead);
router.patch("/notifications/:id/read", hasPermission("notifications"), adminController.markAdminNotificationRead);
router.delete("/notifications/:id", hasPermission("notifications"), adminController.deleteAdminNotification);
router.post("/send-notification", hasPermission("notifications.send"), adminController.sendBulkNotification);

// ── Configurações do Sistema ──────────────────────────────────────────────────
router.get("/system-settings", hasPermission("settings.read"), adminController.getSystemSettings);
router.put("/system-settings", hasPermission("settings.write"), adminController.updateSystemSettings);

// ── Gestão de Equipa ──────────────────────────────────────────────────────────
router.get("/team", hasPermission("team"), adminController.getTeam);
router.put("/team/:id/role", hasPermission("team"), adminController.updateTeamMemberRole);
router.delete("/team/:id", hasPermission("team"), adminController.removeTeamMember);

module.exports = router;