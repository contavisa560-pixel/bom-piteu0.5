const express = require("express");
const router = express.Router();
const { readUsers, writeUsers } = require("../db");

router.post("/save", (req, res) => {
  const { userId, recipe } = req.body;

  const users = readUsers();
  const user = users.find(u => u.id === userId);

  if (!user) return res.status(404).json({ error: "User not found" });

  if (!user.savedRecipes) user.savedRecipes = [];

  user.savedRecipes.push({
    ...recipe,
    savedAt: new Date()
  });

  writeUsers(users);

  res.json({ success: true });
});

module.exports = router;
