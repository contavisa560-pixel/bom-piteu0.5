const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { readUsers, writeUsers } = require("./db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// ==== REGISTO ====
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const users = readUsers();
  const exists = users.find(u => u.email === email);

  if (exists) return res.status(400).json({ error: "Email já registado." });

  const hashed = await bcrypt.hash(password, 10);

  const newUser = {
    id: "user_" + Date.now(),
    name,
    email,
    passwordHash: hashed,
    provider: "local",
    picture: "",
    level: 1,
    points: 0,
    favorites: [],
    isPremium: false
  };

  users.push(newUser);
  writeUsers(users);

  const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: "7d" });

  res.json({ user: newUser, token });
});

// ==== LOGIN ====
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const users = readUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: "Email não encontrado." });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(400).json({ error: "Senha incorreta." });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

  res.json({ user, token });
});

module.exports = router;
