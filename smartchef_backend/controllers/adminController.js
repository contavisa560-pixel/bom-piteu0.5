const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const Notification = require("../models/Notification");
const Profile = require("../models/Profile");
const Saude = require("../models/Saude");
const Alerta = require("../models/Alerta");
const IpLookupService = require('../services/ipLookupService');
const AdminNotificationService = require('../services/adminNotificationService');
const { clearCache } = require('../services/systemSettingsService');

// ==================== MÉTRICAS ====================
exports.getGlobalMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ isPremium: true });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const adminUsers = await User.countDocuments({
      role: { $in: ["admin", "superadmin", "moderator"] }
    });

    // Utilizadores activos hoje — quem teve actividade no usageCycle iniciado hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeToday = await User.countDocuments({
      $or: [
        { "usageCycle.startDate": { $gte: today } },
        { lastReset: { $gte: today } }
      ]
    });

    const usageData = await User.aggregate([{
      $group: {
        _id: null,
        totalText: { $sum: { $add: [{ $ifNull: ["$usageCycle.used", 0] }, { $ifNull: ["$usage.dailyTextRequests", 0] }] } },
        totalImages: { $sum: { $add: [{ $ifNull: ["$usageCycle.imagesUsed", 0] }, { $ifNull: ["$usage.dailyImageGenerations", 0] }] } },
        totalAnalysis: { $sum: { $add: [{ $ifNull: ["$usageCycle.visionUsed", 0] }, { $ifNull: ["$usage.dailyImageAnalysis", 0] }] } }
      }
    }]);

    const usage = usageData[0] || { totalText: 0, totalImages: 0, totalAnalysis: 0 };

    // Custo estimado: texto ~$0.002/req, imagem ~$0.04/req, visão ~$0.01/req
    const estimatedCost = (
      (usage.totalText * 0.002) +
      (usage.totalImages * 0.04) +
      (usage.totalAnalysis * 0.01)
    ).toFixed(2);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: weekAgo } });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          premium: premiumUsers,
          free: totalUsers - premiumUsers,
          banned: bannedUsers,
          admins: adminUsers,
          activeToday,
          newThisWeek: newUsersThisWeek
        },
        dailyUsage: usage,
        estimatedCostUSD: estimatedCost
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao gerar métricas: " + err.message });
  }
};

// ==================== LISTAR UTILIZADORES ====================
exports.listUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      role = "",
      isPremium = "",
      isBanned = ""
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }
    if (role) filter.role = role;
    if (isPremium !== "") filter.isPremium = isPremium === "true";
    if (isBanned !== "") filter.isBanned = isBanned === "true";

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("name email role isPremium isBanned createdAt usage lastReset provider avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar utilizadores: " + err.message });
  }
};

// ==================== DETALHE DE UTILIZADOR ====================
exports.getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -settings.security.twoFactorSecret");

    if (!user) return res.status(404).json({ error: "Utilizador não encontrado" });

    const logs = await AuditLog.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: { user, recentLogs: logs } });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar utilizador: " + err.message });
  }
};

// ==================== EDITAR UTILIZADOR ====================
exports.updateUser = async (req, res) => {
  try {
    const allowed = ["isPremium", "premiumExpiresAt", "role",
      "limits.textLimit", "limits.imageLimit", "limits.analysisLimit"];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
      .select("name email role isPremium limits");

    if (!user) return res.status(404).json({ error: "Utilizador não encontrado" });

    await AuditLog.create({
      userId: req.user._id,
      action: `admin_update_user:${req.params.id}`,
      route: req.path,
      tokensUsed: 0
    });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar: " + err.message });
  }
};

// ==================== BANIR / DESBANIR ====================
exports.banUser = async (req, res) => {
  try {
    const { reason = "Violação dos termos de uso" } = req.body;

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: "Utilizador não encontrado" });
    if (target.role === "admin") {
      return res.status(403).json({ error: "Não é possível banir um administrador." });
    }

    target.isBanned = true;
    target.bannedReason = reason;
    target.bannedAt = new Date();
    await target.save();
    await AdminNotificationService.create({
      title: 'Utilizador banido',
      message: `${target.email} foi banido por ${req.user.email}. Motivo: ${reason}`,
      type: 'warning',
      createdBy: req.user._id
    });
    await AuditLog.create({
      userId: req.user._id,
      action: `admin_ban_user:${req.params.id}`,
      route: req.path,
      tokensUsed: 0
    });

    res.json({ success: true, message: `Utilizador ${target.email} banido.` });
  } catch (err) {
    res.status(500).json({ error: "Erro ao banir: " + err.message });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: false, bannedReason: null, bannedAt: null },
      { new: true }
    ).select("name email isBanned");

    if (!user) return res.status(404).json({ error: "Utilizador não encontrado" });

    res.json({ success: true, message: `Utilizador ${user.email} desbanido.`, data: user });
  } catch (err) {
    res.status(500).json({ error: "Erro ao desbanir: " + err.message });
  }
};

// ==================== PROMOVER A ADMIN ====================
exports.makeAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "admin" },
      { new: true }
    ).select("name email role");

    if (!user) return res.status(404).json({ error: "Utilizador não encontrado" });

    // Notificar
    const ip = req.ip || req.connection.remoteAddress || 'IP desconhecido';
    const ipDetails = await IpLookupService.getIpDetails(ip);
    await AdminNotificationService.notifyRoleChange(user, req.user, ip, ipDetails);

    res.json({ success: true, message: `${user.name} agora é administrador.`, data: user });
  } catch (err) {
    res.status(500).json({ error: "Erro ao promover: " + err.message });
  }
};

// ==================== LOGS ====================
exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const logs = await AuditLog.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await AuditLog.countDocuments();

    res.json({
      success: true,
      data: logs,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar logs: " + err.message });
  }
};

// ==================== NOVAS MÉTRICAS E GRÁFICOS ====================

// GET /admin/usage-timeline?days=30
exports.getUsageTimeline = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Usa o AuditLog para timeline real de actividade
    // e o usageCycle para os totais actuais por utilizador
    const timeline = await AuditLog.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalText: { $sum: 1 },           // cada log = 1 operação
          totalImages: { $sum: 0 },
          totalAnalysis: { $sum: 0 },
          activeUsers: { $addToSet: "$userId" }
        }
      },
      {
        $project: {
          date: "$_id",
          totalText: 1,
          totalImages: 1,
          totalAnalysis: 1,
          activeUsersCount: { $size: "$activeUsers" }
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Se não houver logs suficientes, complementa com dados do usageCycle
    // agrupando utilizadores por data de início do ciclo
    if (timeline.length === 0) {
      const cycleTimeline = await User.aggregate([
        {
          $match: {
            "usageCycle.startDate": { $gte: startDate, $ne: null }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$usageCycle.startDate" } },
            totalText: { $sum: "$usageCycle.used" },
            totalImages: { $sum: "$usageCycle.imagesUsed" },
            totalAnalysis: { $sum: "$usageCycle.visionUsed" },
            activeUsers: { $addToSet: "$_id" }
          }
        },
        {
          $project: {
            date: "$_id",
            totalText: 1,
            totalImages: 1,
            totalAnalysis: 1,
            activeUsersCount: { $size: "$activeUsers" }
          }
        },
        { $sort: { date: 1 } }
      ]);

      return res.json({ success: true, data: cycleTimeline });
    }

    res.json({ success: true, data: timeline });
  } catch (err) {
    res.status(500).json({ error: "Erro ao gerar timeline: " + err.message });
  }
};

// GET /admin/top-users?limit=10
exports.getTopUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Ordena pelo usageCycle — fonte de verdade actual
    const topText = await User.find({})
      .sort({ "usageCycle.used": -1 })
      .limit(limit)
      .select("name email usageCycle.used usage.dailyTextRequests");

    const topImages = await User.find({})
      .sort({ "usageCycle.imagesUsed": -1 })
      .limit(limit)
      .select("name email usageCycle.imagesUsed usage.dailyImageGenerations");

    const topAnalysis = await User.find({})
      .sort({ "usageCycle.visionUsed": -1 })
      .limit(limit)
      .select("name email usageCycle.visionUsed usage.dailyImageAnalysis");

    res.json({
      success: true,
      data: { topText, topImages, topAnalysis }
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar top users: " + err.message });
  }
};

// POST /admin/bulk-ban
exports.bulkBanUsers = async (req, res) => {
  try {
    const { userIds, reason = "Violação dos termos" } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "Lista de utilizadores inválida" });
    }

    // Proteger admins de serem banidos em massa
    const admins = await User.find({ _id: { $in: userIds }, role: "admin" }).select("_id");
    if (admins.length > 0) {
      return res.status(403).json({ error: "Não é possível banir administradores." });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      {
        isBanned: true,
        bannedReason: reason,
        bannedAt: new Date()
      }
    );

    await AuditLog.create({
      userId: req.user._id,
      action: `admin_bulk_ban:${userIds.length}_users`,
      route: req.path,
      tokensUsed: 0
    });

    res.json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: `${result.modifiedCount} utilizadores banidos.`
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao banir em massa: " + err.message });
  }
};

// POST /admin/send-notification
exports.sendBulkNotification = async (req, res) => {
  try {
    const { title, message, type = "system", segment = "all" } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: "Título e mensagem são obrigatórios" });
    }

    let query = {};
    if (segment === "premium") query.isPremium = true;
    if (segment === "free") query.isPremium = false;
    // "all" mantém vazio

    const users = await User.find(query).select("_id");
    if (users.length === 0) {
      return res.status(404).json({ error: "Nenhum utilizador encontrado para este segmento." });
    }

    const notifications = users.map(user => ({
      userId: user._id,
      type,
      title,
      message,
      data: { sentBy: req.user._id, segment }
    }));

    await Notification.insertMany(notifications);

    await AuditLog.create({
      userId: req.user._id,
      action: `admin_bulk_notification:${users.length}_users`,
      route: req.path,
      tokensUsed: 0
    });

    res.json({
      success: true,
      sent: users.length,
      message: `Notificação enviada para ${users.length} utilizadores.`
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao enviar notificações: " + err.message });
  }
};

// GET /admin/health-summary
exports.getHealthSummary = async (req, res) => {
  try {
    const totalProfiles = await Profile.countDocuments();
    const totalSaude = await Saude.countDocuments();
    const activeAlerts = await Alerta.countDocuments({ active: true, dismissed: false });
    const usersWithAlerts = await Alerta.distinct("userId", { active: true, dismissed: false });
    const usersWithAlertsCount = usersWithAlerts.length;

    const avgVegetables = await Saude.aggregate([
      { $match: { "monthlyStats.vegetablesCount": { $exists: true } } },
      { $group: { _id: null, avgVeg: { $avg: "$monthlyStats.vegetablesCount" } } }
    ]);

    res.json({
      success: true,
      data: {
        totalProfiles,
        totalSaude,
        activeAlerts,
        usersWithAlerts: usersWithAlertsCount,
        avgVegetablesPerUser: avgVegetables[0]?.avgVeg || 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar resumo de saúde: " + err.message });
  }
};

// ==================== SUBSCRIÇÕES ====================

// Listar todos os utilizadores premium
exports.listSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = "" } = req.query;

    const filter = {};
    if (status === "active") {
      filter.isPremium = true;
      filter.$or = [
        { premiumExpiresAt: null },
        { premiumExpiresAt: { $gt: new Date() } }
      ];
    } else if (status === "expired") {
      filter.isPremium = true;
      filter.premiumExpiresAt = { $lt: new Date() };
    } else if (status === "free") {
      filter.isPremium = false;
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("name email isPremium premiumExpiresAt createdAt usage role")
      .sort({ premiumExpiresAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Activar premium manualmente
exports.activatePremium = async (req, res) => {
  try {
    const { months = 1, plan = "premium" } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Utilizador não encontrado" });

    // Se já tem premium activo, extende a partir da data actual
    const baseDate = (user.isPremium && user.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date())
      ? new Date(user.premiumExpiresAt)
      : new Date();

    const expiresAt = new Date(baseDate);
    expiresAt.setMonth(expiresAt.getMonth() + Number(months));

    await User.findByIdAndUpdate(req.params.id, {
      isPremium: true,
      premiumExpiresAt: expiresAt
    });

    await AuditLog.create({
      userId: req.user._id,
      action: `admin_activate_premium:${req.params.id}:${months}meses`,
      route: req.path,
      tokensUsed: 0
    });

    res.json({
      success: true,
      message: `Premium activado por ${months} mês(es) até ${expiresAt.toLocaleDateString("pt-PT")}`,
      data: { isPremium: true, premiumExpiresAt: expiresAt }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancelar premium
exports.cancelPremium = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Utilizador não encontrado" });

    await User.findByIdAndUpdate(req.params.id, {
      isPremium: false,
      premiumExpiresAt: new Date()
    });

    await AuditLog.create({
      userId: req.user._id,
      action: `admin_cancel_premium:${req.params.id}`,
      route: req.path,
      tokensUsed: 0
    });

    res.json({ success: true, message: `Premium cancelado para ${user.email}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Histórico de subscrições (via AuditLog)
exports.subscriptionHistory = async (req, res) => {
  try {
    const logs = await AuditLog.find({
      action: { $regex: /^admin_(activate|cancel)_premium/ }
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAdvancedStats = async (req, res) => {
  try {
    const User = require('../models/User');
    const AuditLog = require('../models/AuditLog');

    // Crescimento de utilizadores nos últimos 30 dias
    const userGrowth = [];
    const end = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(end.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const next = new Date(date);
      next.setDate(date.getDate() + 1);
      const total = await User.countDocuments({ createdAt: { $lt: next } });
      const newUsers = await User.countDocuments({ createdAt: { $gte: date, $lt: next } });
      userGrowth.push({
        date: date.toISOString().slice(0, 10),
        newUsers,
        totalUsers: total
      });
    }

    // Distribuição por plano
    const free = await User.countDocuments({ isPremium: false });
    const premium = await User.countDocuments({ isPremium: true });
    const planDistribution = [
      { name: 'Free', value: free },
      { name: 'Premium', value: premium }
    ];

    // Uso por feature nos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const usage = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);
    const usageByFeature = usage.map(u => ({ feature: u._id, count: u.count }));

    res.json({
      success: true,
      data: { userGrowth, planDistribution, usageByFeature }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAdminNotifications = async (req, res) => {
  try {
    const AdminNotification = require('../models/AdminNotification');
    const notifications = await AdminNotification.find()
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAdminNotificationRead = async (req, res) => {
  try {
    const AdminNotification = require('../models/AdminNotification');
    const notif = await AdminNotification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ error: 'Notificação não encontrada' });
    res.json({ success: true, data: notif });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAdminNotification = async (req, res) => {
  try {
    const AdminNotification = require('../models/AdminNotification');
    const notif = await AdminNotification.findByIdAndDelete(req.params.id);
    if (!notif) return res.status(404).json({ error: 'Notificação não encontrada' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSystemSettings = async (req, res) => {
  try {
    const SystemSetting = require('../models/SystemSetting');
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({});
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSystemSettings = async (req, res) => {
  try {
    const SystemSetting = require('../models/SystemSetting');
    const oldSettings = await SystemSetting.findOne();
    const settings = await SystemSetting.findOneAndUpdate(
      {},
      { $set: { ...req.body, updatedAt: new Date() } },
      { new: true, upsert: true }
    );
    clearCache();

    // Notificar mudanças sensíveis
    const sensitiveFields = ['require2FAForAdmins', 'requireEmailVerification', 'allowUserDeletion', 'maxLoginAttempts', 'sessionTimeoutMinutes', 'forcePasswordChangeDays'];
    for (const field of sensitiveFields) {
      if (req.body[field] !== undefined && oldSettings && oldSettings[field] !== req.body[field]) {
        const ip = req.ip || req.connection.remoteAddress || 'IP desconhecido';
        const ipDetails = await IpLookupService.getIpDetails(ip);
        await AdminNotificationService.notifySecuritySettingChange(
          req.user,
          field,
          oldSettings[field],
          req.body[field],
          ip,
          ipDetails
        );
      }
    }

    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Adiciona estas funções no final do adminController.js

// ==================== GESTÃO DE EQUIPA ====================

// GET /admin/team — lista todos os membros da equipa (admins, moderadores, superadmins)
exports.getTeam = async (req, res) => {
  try {
    const team = await User.find({
      role: { $in: ["admin", "moderator", "superadmin"] }
    })
      .select("name email role avatar provider createdAt lastReset isBanned")
      .sort({ role: 1, createdAt: -1 });

    res.json({ success: true, data: team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /admin/team/:id/role — altera o role de um membro da equipa
exports.updateTeamMemberRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ["user", "moderator", "admin", "superadmin"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Role inválido. Use: user, moderator, admin ou superadmin" });
    }

    // Protecção: não pode alterar o próprio role
    if (req.params.id === req.user._id.toString()) {
      return res.status(403).json({ error: "Não podes alterar o teu próprio role." });
    }

    // Protecção: não pode criar outro superadmin se não for superadmin
    if (role === "superadmin" && req.user.role !== "superadmin") {
      return res.status(403).json({ error: "Apenas um superadmin pode criar outro superadmin." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("name email role");

    if (!user) return res.status(404).json({ error: "Utilizador não encontrado" });

    await AuditLog.create({
      userId: req.user._id,
      action: `admin_update_role:${req.params.id}:${role}`,
      route: req.path,
      tokensUsed: 0
    });

    res.json({
      success: true,
      message: `Role de ${user.name} alterado para ${role}`,
      data: user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /admin/team/:id — remove um membro da equipa (volta a role "user")
exports.removeTeamMember = async (req, res) => {
  try {
    // Protecção: não pode remover a si próprio
    if (req.params.id === req.user._id.toString()) {
      return res.status(403).json({ error: "Não podes remover-te a ti próprio da equipa." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "user" },
      { new: true }
    ).select("name email role");

    if (!user) return res.status(404).json({ error: "Utilizador não encontrado" });

    await AuditLog.create({
      userId: req.user._id,
      action: `admin_remove_team:${req.params.id}`,
      route: req.path,
      tokensUsed: 0
    });

    res.json({
      success: true,
      message: `${user.name} foi removido da equipa e voltou a utilizador normal.`,
      data: user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ── Cache de Imagens ──────────────────────────────────────────────────────────
exports.getImageCacheStats = async (req, res) => {
  try {
    const ImageCache = require("../models/ImageCache");

    const [total, byType, topHits, recentSaved, totalHits] = await Promise.all([
      ImageCache.countDocuments(),
      ImageCache.aggregate([
        {
          $group: {
            _id: "$imageType",
            count: { $sum: 1 },
            totalHits: { $sum: "$hitCount" },
            avgHits: { $avg: "$hitCount" },
          },
        },
        { $sort: { count: -1 } },
      ]),
      ImageCache.find()
        .sort({ hitCount: -1 })
        .limit(10)
        .select("prompt imageType hitCount imageUrl lastUsedAt createdAt"),
      ImageCache.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("prompt imageType imageUrl createdAt hitCount"),
      ImageCache.aggregate([{ $group: { _id: null, total: { $sum: "$hitCount" } } }]),
    ]);

    const totalReusos = totalHits[0]?.total || 0;
    const estimatedSavingsUSD = (totalReusos * 0.04).toFixed(2); // ~$0.04 por imagem OpenAI

    res.json({
      success: true,
      data: {
        total,
        totalReusos,
        estimatedSavingsUSD,
        byType,
        topHits,
        recentSaved,
      },
    });
  } catch (err) {
    console.error("❌ getImageCacheStats:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteImageCache = async (req, res) => {
  try {
    const ImageCache = require("../models/ImageCache");
    const { id } = req.params;
    await ImageCache.findByIdAndDelete(id);
    res.json({ success: true, message: "Entrada de cache removida" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearImageCache = async (req, res) => {
  try {
    const ImageCache = require("../models/ImageCache");
    const result = await ImageCache.deleteMany({});
    res.json({ success: true, message: `${result.deletedCount} entradas removidas do cache` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};