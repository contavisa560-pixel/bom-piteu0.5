const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;

/* ===================== REGISTER ===================== */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) return res.status(400).json({ error: "Todos os campos são obrigatórios" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Usuário já existe" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: passwordHash, provider: "local" });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
});

/* ===================== LOGIN ===================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "Email e senha são obrigatórios" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

    if (user.needsPassword) return res.status(400).json({ error: "Usuário OAuth precisa definir senha primeiro" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Senha incorreta" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
});

/* ===================== SET PASSWORD ===================== */
router.post("/set-password", async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) return res.status(400).json({ error: "ID do usuário e senha são obrigatórios" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    if (!user.needsPassword) return res.status(400).json({ error: "Senha já foi definida" });

    const passwordHash = await bcrypt.hash(password, 10);
    user.password = passwordHash;
    user.needsPassword = false;
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao definir senha" });
  }
});

module.exports = router;
