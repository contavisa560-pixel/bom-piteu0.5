const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const User = require("../models/User");
const { uploadToCloudflare } = require("../services/storageService");
const { authenticate } = require("../middleware/security/jwtAuth");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Configuração do Multer para memória (Essencial para Cloudflare R2)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});

// --------------------
// LOGIN COM EMAIL/SENHA
// --------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    if (user.provider && !user.password) {
      return res.status(403).json({ error: `Este e-mail está associado ao login via ${user.provider}` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.isPremium ? "Premium" : "Free"
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// --------------------
// CADASTRO TRADICIONAL
// --------------------
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Usuário já existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      provider: "local"
    });

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar: "",
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// --------------------
// ATUALIZAR AVATAR (Ponto 3: Integração Cloudflare)
// --------------------
router.post("/update-avatar", authenticate, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhuma imagem enviada." });
    }

    // 1. Envia para o Cloudflare R2
    const imageUrl = await uploadToCloudflare(req.file.buffer, req.file.originalname, "avatars");

    // 2. Guarda apenas a URL no MongoDB
    await User.findByIdAndUpdate(req.user.id, { avatar: imageUrl });

    res.json({ 
      success: true, 
      message: "Avatar atualizado com sucesso!",
      url: imageUrl 
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ error: "Erro ao processar upload da imagem." });
  }
});

module.exports = router;