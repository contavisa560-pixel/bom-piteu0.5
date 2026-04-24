const express = require("express");
const passport = require("passport");
const multer = require("multer");
const crypto = require("crypto");
const User = require("../models/User");
const authService = require("../services/authService");
const { uploadToCloudflare } = require("../services/storageService");
const { authenticate } = require("../middleware/security/jwtAuth");
const NotificationService = require('../services/notificationService');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require("../services/emailService");
const SystemSetting = require("../models/SystemSetting");
const { getSettings } = require('../services/systemSettingsService');
const AdminNotificationService = require('../services/adminNotificationService');
const IpLookupService = require('../services/ipLookupService');
const { detectDevice } = require('../services/deviceDetector');
const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const generateToken = () => crypto.randomBytes(32).toString("hex");

// ── LOGIN ─────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ error: "Credenciais inválidas" });
    if (user.needsPassword) {
      return res.status(403).json({ error: "Utilizador precisa definir senha (login via rede social)" });
    }

    // ========== VERIFICAR BLOQUEIO POR TENTATIVAS ==========
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      const remaining = Math.ceil((user.lockedUntil - new Date()) / 1000 / 60);
      return res.status(403).json({
        error: `Conta bloqueada devido a múltiplas tentativas. Tente novamente em ${remaining} minutos.`
      });
    }

    const isMatch = await authService.comparePassword(password, user.password);
    if (!isMatch) {
      // Tentativa falhada – incrementar contador
      const sysSettings = await getSettings();
      const maxAttempts = sysSettings.maxLoginAttempts || 5;
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= maxAttempts) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min
        user.loginAttempts = 0; // reset para não acumular após bloqueio
        await user.save();

        // Notificar admin com detalhes
        const ip = req.ip || req.connection.remoteAddress || 'IP desconhecido';
        const ipDetails = await IpLookupService.getIpDetails(ip);
        const device = detectDevice(req.headers['user-agent'] || '');
        await AdminNotificationService.notifySuspiciousLogin(user, ip, ipDetails, device, maxAttempts);

        return res.status(403).json({
          error: `Conta bloqueada devido a múltiplas tentativas. Tente novamente em 15 minutos.`
        });
      }
      await user.save();
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Login bem-sucedido: resetar contadores
    user.loginAttempts = 0;
    user.lockedUntil = null;
    await user.save();

    if (user.isBanned) {
      return res.status(403).json({
        error: "A sua conta foi banida. Contacte o suporte para mais informações.",
        isBanned: true
      });
    }
    
    // ========== VERIFICAR SE EMAIL PRECISA SER VERIFICADO ==========
    const sysSettings = await getSettings();
    if (user.provider === "local" && sysSettings.requireEmailVerification && user.isEmailVerified === false) {
      return res.status(403).json({
        error: "Email não verificado. Verifique a sua caixa de entrada.",
        requiresVerification: true,
        email: user.email,
      });
    }

    // ========== VERIFICAR FORÇAR TROCA DE SENHA ==========
    if (sysSettings.forcePasswordChangeDays > 0) {
      const lastChange = user.settings?.security?.lastPasswordChange;
      if (!lastChange) {
        return res.status(403).json({
          error: "É necessário alterar a sua palavra-passe.",
          requiresPasswordChange: true,
          userId: user._id,
        });
      } else {
        const daysSinceLastChange = (Date.now() - new Date(lastChange)) / (1000 * 60 * 60 * 24);
        if (daysSinceLastChange > sysSettings.forcePasswordChangeDays) {
          return res.status(403).json({
            error: "A sua palavra-passe expirou. Por favor, altere-a.",
            requiresPasswordChange: true,
            userId: user._id,
          });
        }
      }
    }

    if (user.settings?.security?.twoFactorAuth) {
      return res.json({
        success: true,
        requires2FA: true,
        userId: user._id,
        message: "2FA necessário"
      });
    }

    await NotificationService.createLoginAlert(
      user._id,
      req.headers['user-agent'] || 'Dispositivo desconhecido',
      req.ip || 'IP desconhecido',
      req.headers['x-forwarded-for'] || req.socket.remoteAddress
    );

    const token = await authService.generateTokenWithSession(user._id, req);

    res.json({
      success: true,
      token,
      user: authService.formatUser(user)
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// ── REGISTER ──────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Dados incompletos" });

    // ========== VERIFICAÇÕES DAS CONFIGURAÇÕES DO SISTEMA ==========
    const settings = await SystemSetting.findOne(); // Busca as configurações (cria uma se não existir)

    // 5.2 - Bloquear registos se a opção estiver desactivada
    if (settings && !settings.allowNewRegistrations) {
      return res.status(403).json({
        error: "Novos registos estão temporariamente desactivados. Tente mais tarde."
      });
    }

    // Verificar se o email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: "E-mail já cadastrado" });

    // 5.3 - Aplicar limites padrão (caso existam nas configurações)
    const defaultLimits = settings?.defaultLimits || { textLimit: 7, imageLimit: 2, analysisLimit: 3 };

    const verificationToken = generateToken();

    const sysSettings = await getSettings();

    // Aplicar trial se configurado
    let isPremium = false;
    let premiumExpiresAt = null;
    if (sysSettings.trialDays > 0) {
      isPremium = true;
      premiumExpiresAt = new Date();
      premiumExpiresAt.setDate(premiumExpiresAt.getDate() + sysSettings.trialDays);
    }

    const newUser = await User.create({
      name,
      email,
      password: await authService.hashPassword(password),
      provider: "local",
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      limits: defaultLimits, // Aplica os limites globais
      isPremium,           // ← trial automático
      premiumExpiresAt,     // ← expiração do trial
    });

    await AdminNotificationService.notifyNewUser(newUser);

    // Envia email de verificação (não bloqueia se falhar)
    sendVerificationEmail(newUser, verificationToken).catch(err =>
      console.warn("⚠️ Email de verificação falhou:", err.message)
    );

    res.status(201).json({
      success: true,
      requiresVerification: true,
      message: "Conta criada! Verifique o seu email para activar a conta.",
      user: authService.formatUser(newUser)
    });
  } catch (err) {
    console.error("Erro no register:", err);
    res.status(500).json({ error: "Erro ao criar conta" });
  }
});

// ── VERIFICAR EMAIL ───────────────────────────────────────────────────────────
// POST /api/auth/verify-email
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) return res.status(400).json({ error: "Token em falta." });

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        error: "Link de verificação inválido ou expirado.",
        expired: true,
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Envia email de boas-vindas
    sendWelcomeEmail(user).catch(err =>
      console.warn("⚠️ Email de boas-vindas falhou:", err.message)
    );

    // Login automático após verificação
    const authToken = authService.generateToken(user._id);

    console.log(`✅ Email verificado: ${user.email}`);

    res.json({
      success: true,
      message: "Email verificado com sucesso!",
      token: authToken,
      user: authService.formatUser(user),
    });
  } catch (err) {
    console.error("❌ Erro ao verificar email:", err);
    res.status(500).json({ error: "Erro ao verificar email." });
  }
});

// ── REENVIAR VERIFICAÇÃO ──────────────────────────────────────────────────────
// POST /api/auth/resend-verification
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("📧 resend-verification chamado para:", email);

    const user = await User.findOne({ email });
    console.log("👤 Utilizador encontrado:", user ? "SIM" : "NÃO");
    console.log("✅ isEmailVerified:", user?.isEmailVerified);

    if (!user || user.isEmailVerified) {
      return res.json({ success: true, message: "Se o email existir..." });
    }

    user.emailVerificationToken = generateToken();
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();
    console.log("💾 Token guardado:", user.emailVerificationToken);

    console.log("📨 A tentar enviar email via emailService...");
    await sendVerificationEmail(user, user.emailVerificationToken);
    console.log("✅ Email enviado com sucesso!");

    res.json({ success: true, message: "Email reenviado." });
  } catch (err) {
    console.error("❌ ERRO COMPLETO resend-verification:", err);
    console.error("❌ Stack:", err.stack);
    res.status(500).json({ error: "Erro ao reenviar email.", details: err.message });
  }
});

// ── RECUPERAR PALAVRA-PASSE ───────────────────────────────────────────────────
// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("🔑 forgot-password chamado para:", email);

    const user = await User.findOne({ email });
    console.log("👤 Utilizador encontrado:", user ? "SIM" : "NÃO");
    console.log("📋 Provider:", user?.provider);

    if (!user) {
      return res.json({
        success: true,
        message: "Se o email estiver registado, receberá as instruções em breve.",
      });
    }

    if (user.provider !== "local") {
      console.log("⚠️ Conta OAuth:", user.provider);
      return res.json({
        success: true,
        isOAuth: true,
        provider: user.provider,
        message: `Esta conta usa login com ${user.provider}. Não precisa de palavra-passe.`,
      });
    }

    user.passwordResetToken = generateToken();
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    console.log("💾 Token de reset guardado");

    console.log("📨 A enviar email de reset...");
    await sendPasswordResetEmail(user, user.passwordResetToken);
    console.log("✅ Email de reset enviado para:", user.email);

    res.json({
      success: true,
      message: "Se o email estiver registado, receberá as instruções em breve.",
    });
  } catch (err) {
    console.error("❌ ERRO forgot-password:", err.message);
    console.error("❌ Stack:", err.stack);
    res.status(500).json({ error: "Erro ao processar pedido." });
  }
});
// ── VALIDAR TOKEN DE RESET ────────────────────────────────────────────────────
// GET /api/auth/reset-password/:token
router.get("/reset-password/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      passwordResetToken: req.params.token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ valid: false, error: "Link inválido ou expirado." });
    }

    res.json({ valid: true, email: user.email });
  } catch (err) {
    res.status(500).json({ error: "Erro ao validar token." });
  }
});

// ── REDEFINIR PALAVRA-PASSE ───────────────────────────────────────────────────
// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token e nova palavra-passe são obrigatórios." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "A palavra-passe deve ter pelo menos 6 caracteres." });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Link inválido ou expirado.", expired: true });
    }

    user.password = await authService.hashPassword(newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    if (!user.settings) user.settings = {};
    if (!user.settings.security) user.settings.security = {};
    user.settings.security.lastPasswordChange = new Date();

    await user.save();

    console.log(`✅ Palavra-passe redefinida: ${user.email}`);

    res.json({
      success: true,
      message: "Palavra-passe alterada com sucesso! Pode fazer login agora.",
    });
  } catch (err) {
    console.error("❌ Erro ao redefinir palavra-passe:", err);
    res.status(500).json({ error: "Erro ao redefinir palavra-passe." });
  }
});

// ── ME ────────────────────────────────────────────────────────────────────────
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user: authService.formatUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Sessão inválida" });
  }
});

// ── AVATAR ────────────────────────────────────────────────────────────────────
router.post("/update-avatar", authenticate, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Imagem não enviada" });
    const imageUrl = await uploadToCloudflare(req.file.buffer, req.file.originalname, "avatars");
    await User.findByIdAndUpdate(req.user.id, { avatar: imageUrl });
    res.json({ success: true, url: imageUrl });
  } catch (error) {
    res.status(500).json({ error: "Erro no upload" });
  }
});

// ── GOOGLE OAUTH ──────────────────────────────────────────────────────────────
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
  prompt: "select_account"
}));

router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  async (req, res) => {
    try {
      if (!req.user) throw new Error("Usuário não encontrado no callback do Google");
      const redirectUrl = await authService.generateAuthRedirect(req.user);
      console.log("Sucesso no login Google! Redirecionando...");
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("ERRO CRÍTICO NO GOOGLE CALLBACK:", error.message);
      res.status(500).json({ error: "Erro ao processar login social", detalhe: error.message });
    }
  }
);

// ── COMPLETE LOGIN (após 2FA) ─────────────────────────────────────────────────
router.post('/complete-login', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });
    const token = await authService.generateTokenWithSession(user._id, req);
    res.json({ success: true, token, user: authService.formatUser(user) });
  } catch (err) {
    console.error('Erro ao completar login:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

module.exports = router;