const express = require("express");
const passport = require("passport");
const multer = require("multer");
const User = require("../models/User");
const authService = require("../services/authService");
const { uploadToCloudflare } = require("../services/storageService");
const { authenticate } = require("../middleware/security/jwtAuth");

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ error: "Credenciais inválidas" });
    if (user.needsPassword) {
      return res.status(403).json({ error: "Utilizador precisa definir senha (login via rede social)" });
    }

    const isMatch = await authService.comparePassword(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Credenciais inválidas" });

    res.json({
      success: true,
      token: authService.generateToken(user._id),
      user: authService.formatUser(user)
    });
  } catch (err) {
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Dados incompletos" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: "E-mail já cadastrado" });

    const newUser = await User.create({
      name, email,
      password: await authService.hashPassword(password),
      provider: "local"
    });

    res.status(201).json({
      success: true,
      token: authService.generateToken(newUser._id),
      user: authService.formatUser(newUser)
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar conta" });
  }
});

// ME (Sessão estável)
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user: authService.formatUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Sessão inválida" });
  }
});

// AVATAR
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

// 1. Inicia a autenticação (O que tu estás a tentar aceder)
router.get("/google", passport.authenticate("google", { 
  scope: ["profile", "email"],
  prompt: "select_account" 
}));

// 2. Callback do Google (Para onde o Google redireciona após login)
router.get("/google/callback", 
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  async (req, res) => {
    try {
      // 1. Verificar se o usuário existe
      if (!req.user) {
        throw new Error("Usuário não encontrado no callback do Google");
      }

      // 2. Gerar Token e Formatar Usuário manualmente para evitar erros de contexto (this)
      const token = authService.generateToken(req.user._id);
      const userData = authService.formatUser(req.user);
      
      // 3. Criar a URL de redirecionamento exatamente como o seu App.js espera
      const userParam = encodeURIComponent(JSON.stringify(userData));
      const redirectUrl = `${process.env.CLIENT_URL}/?token=${token}&user=${userParam}`;

      console.log("Sucesso no login! Redirecionando...");
      res.redirect(redirectUrl);

    } catch (error) {
      // ESTE LOG É FUNDAMENTAL: Verifique o console do VS Code ao dar o erro 500
      console.error("ERRO CRÍTICO NO GOOGLE CALLBACK:", error.message);
      res.status(500).json({ error: "Erro ao processar login social", detalhe: error.message });
    }
  }
);
module.exports = router;