const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ActiveToken = require("../models/ActiveToken");
const { getSettings } = require('./systemSettingsService');
const { detectDevice } = require("../utils/deviceDetector");

const JWT_SECRET = process.env.JWT_SECRET;

const authService = {
  // ==================== FUNÇÕES EXISTENTES ====================

  //  Geração Centralizada de Token
  generateToken: async function (userId) {
    const settings = await getSettings();
    const timeoutMinutes = settings.sessionTimeoutMinutes || 120;
    const expiresIn = timeoutMinutes * 60; // segundos
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn });
  },

  //  Segurança: Hash e Comparação
  hashPassword: async (password) => {
    return await bcrypt.hash(password, 10);
  },

  comparePassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  //  Formato Único de Usuário para o Frontend
  formatUser: (user) => ({
    id: user._id || user.id,
    name: user.name || user.displayName || "Utilizador",
    email: user.email || (user.emails && user.emails[0]?.value),
    avatar: user.avatar || (user.photos && user.photos[0]?.value) || "",
    role: user.role || "user",
    plan: user.isPremium ? "Premium" : "Free",
    isPremium: user.isPremium || false,
    premiumExpiresAt: user.premiumExpiresAt || null,
    needsPassword: user.needsPassword || false,
    provider: user.provider || "local",
    level: user.level || 1,
    points: user.points || 0,
  }),

  //  Helper para Redirecionamento OAuth
  generateAuthRedirect: async function (user) {
    const token = await authService.generateToken(user._id || user.id);
    const userData = authService.formatUser(user);
    const userParam = encodeURIComponent(JSON.stringify(userData));
    return `${process.env.CLIENT_URL}/?token=${token}&user=${userParam}`;
  },

  //  Gerar token e registrar sessão

  generateTokenWithSession: async function (userId, req) {
    const token = await this.generateToken(userId);

    // Detectar informações do dispositivo 
    let deviceInfo = {
      device: "Desktop",
      browser: "Chrome",
      os: "Windows"
    };

    try {
      const userAgent = req.headers["user-agent"] || "";
      if (userAgent.includes("Mobile")) deviceInfo.device = "Mobile";
      if (userAgent.includes("Firefox")) deviceInfo.browser = "Firefox";
      if (userAgent.includes("Safari")) deviceInfo.browser = "Safari";
      if (userAgent.includes("Android")) deviceInfo.os = "Android";
      if (userAgent.includes("iPhone") || userAgent.includes("iPad")) deviceInfo.os = "iOS";
      if (userAgent.includes("Mac")) deviceInfo.os = "macOS";
      if (userAgent.includes("Linux")) deviceInfo.os = "Linux";
    } catch (error) {
      console.log(" Erro ao detectar dispositivo:", error.message);
    }

    try {
      // Criar registro de token ativo
      await ActiveToken.create({
        userId,
        token,
        device: deviceInfo.device,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        ip: req.ip || req.connection.remoteAddress || "127.0.0.1",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
      });

      // Tentar limpar tokens expirados 
      setTimeout(async () => {
        try {
          await ActiveToken.cleanExpiredTokens();
        } catch (cleanError) {
          // Ignorar erro de limpeza
        }
      }, 1000);

      return token;
    } catch (error) {
      console.error("❌ Erro ao criar token de sessão:", error);
      // Se falhar, ainda retorna o token JWT 
      return token;
    }
  },

  //  Verificar token com validação de sessão
  verifyTokenWithSession: async function (token, req) {
    try {
      // Verificar assinatura JWT
      const decoded = jwt.verify(token, JWT_SECRET);

      // Verificar se o token está na lista de ativos
      const activeToken = await ActiveToken.findOne({
        token,
        isActive: true,
        expiresAt: { $gt: new Date() }
      });

      if (!activeToken) {
        throw new Error("Token inválido ou sessão expirada");
      }

      // Atualizar último uso
      activeToken.lastUsed = new Date();
      await activeToken.save();

      return decoded;
    } catch (error) {
      throw error;
    }
  },

  //  Obter sessões ativas do usuário
  getActiveSessions: async function (userId) {
    const sessions = await ActiveToken.find({
      userId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).sort({ lastUsed: -1 });

    return sessions.map(session => ({
      id: session._id,
      token: session.token.substring(0, 10) + "...",
      device: session.device,
      browser: session.browser,
      os: session.os,
      ip: session.ip,
      location: session.location,
      createdAt: session.createdAt,
      lastUsed: session.lastUsed,
      current: false // Será definido no frontend
    }));
  },

  //  Revogar uma sessão específica
  revokeSession: async function (userId, sessionId) {
    const session = await ActiveToken.findOne({
      _id: sessionId,
      userId,
      isActive: true
    });

    if (!session) {
      throw new Error("Sessão não encontrada");
    }

    session.isActive = false;
    await session.save();

    return true;
  },

  //  Revogar todas as outras sessões
  revokeOtherSessions: async function (userId, currentToken) {
    await ActiveToken.updateMany(
      {
        userId,
        token: { $ne: currentToken },
        isActive: true
      },
      {
        $set: { isActive: false }
      }
    );

    return true;
  },

  //  Verificar token simples 
  verifyToken: function (token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw error;
    }
  }
};

module.exports = authService;