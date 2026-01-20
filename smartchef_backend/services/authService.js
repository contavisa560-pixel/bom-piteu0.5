const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ActiveToken = require("../models/ActiveToken");
const { detectDevice } = require("../utils/deviceDetector");

const JWT_SECRET = process.env.JWT_SECRET;

const authService = {
  // ==================== FUNÇÕES EXISTENTES ====================

  // 1. Geração Centralizada de Token
  generateToken: (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
  },

  // 2. Segurança: Hash e Comparação
  hashPassword: async (password) => {
    return await bcrypt.hash(password, 10);
  },

  comparePassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  // 3. Formato Único de Usuário para o Frontend
  formatUser: (user) => ({
    id: user._id || user.id,
    name: user.name || user.displayName || "Utilizador",
    email: user.email || (user.emails && user.emails[0]?.value),
    avatar: user.avatar || (user.photos && user.photos[0]?.value) || "",
    plan: user.isPremium ? "Premium" : "Free",
    needsPassword: user.needsPassword || false,
    provider: user.provider || "local"
  }),

  // 4. Helper para Redirecionamento OAuth
  generateAuthRedirect: (user) => {
    const token = authService.generateToken(user._id || user.id);
    const userData = authService.formatUser(user);
    const userParam = encodeURIComponent(JSON.stringify(userData));
    return `${process.env.CLIENT_URL}/?token=${token}&user=${userParam}`;
  },

  // ==================== 🔥 NOVAS FUNÇÕES DE SESSÃO ====================

  // 5. Gerar token e registrar sessão
  // No authService.js, substitua APENAS o método generateTokenWithSession:

  generateTokenWithSession: async function (userId, req) {
    const token = this.generateToken(userId);

    // Detectar informações do dispositivo (forma simplificada)
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
      console.log("⚠️ Erro ao detectar dispositivo:", error.message);
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

      // Tentar limpar tokens expirados (não crítico se falhar)
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
      // Se falhar, ainda retorna o token JWT (compatibilidade com versão anterior)
      return token;
    }
  },

  // 6. Verificar token com validação de sessão
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

  // 7. Obter sessões ativas do usuário
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

  // 8. Revogar uma sessão específica
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

  // 9. Revogar todas as outras sessões
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

  // 10. Verificar token simples (para middleware)
  verifyToken: function (token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw error;
    }
  }
};

module.exports = authService;