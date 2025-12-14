const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// ==== REGISTO ====
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar se email já existe
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "Email já registado." });
    }

    // Criptografar senha
    const hashed = await bcrypt.hash(password, 10);

    // Criar user
    const newUser = await User.create({
      name,
      email,
      passwordHash: hashed,
      avatar: "",
      level: 1,
      points: 0,
      favorites: [],
      isPremium: false
    });

    // Gerar token
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({ user: newUser, token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Erro no registo", details: error });
  }
});

// ==== LOGIN ====
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Email não encontrado." });

    // Verificar senha
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: "Senha incorreta." });

    // Gerar token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({ user, token });
  } catch (error) {
    return res.status(500).json({ error: "Erro no login", details: error });
  }
});

module.exports = router;