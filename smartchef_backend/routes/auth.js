const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { handleTikTokOAuth, handleInstagramOAuth } = require("../auth/oauth");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// -------------------- Google --------------------
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: process.env.CLIENT_URL, session: false }),
  (req, res) => {
    try {
      // 1. Gera o Token JWT
      const token = jwt.sign({ id: req.user._id || req.user.id }, JWT_SECRET, { expiresIn: "7d" });

      // 2. Prepara os dados simplificados do utilizador para o React
      const userData = {
        id: req.user._id || req.user.id,
        name: req.user.displayName || req.user.name || "Utilizador",
        email: req.user.emails?.[0]?.value || req.user.email,
        picture: req.user.photos?.[0]?.value || req.user.picture
      };

      // 3. Codifica o objeto user para a URL
      const userParam = encodeURIComponent(JSON.stringify(userData));

      // 4. Redireciona para o Dashboard do React
      res.redirect(`${process.env.CLIENT_URL}/?token=${token}&user=${userParam}`);
    } catch (err) {
      console.error("Erro no login Google:", err);
      res.redirect(`${process.env.CLIENT_URL}/?error=auth_failed`);
    }
  }
);

// -------------------- TikTok --------------------
router.get("/tiktok/callback", async (req, res) => {
  try {
    const user = await handleTikTokOAuth(req.query.code);
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    const userParam = encodeURIComponent(JSON.stringify(user));
    res.redirect(`${process.env.CLIENT_URL}/?token=${token}&user=${userParam}`);
  } catch (err) {
    console.error("Erro no login TikTok:", err);
    res.redirect(`${process.env.CLIENT_URL}/?error=TikTokLoginFailed`);
  }
});

// -------------------- Instagram --------------------
router.get("/instagram/callback", async (req, res) => {
  try {
    const user = await handleInstagramOAuth(req.query.code);
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    const userParam = encodeURIComponent(JSON.stringify(user));
    res.redirect(`${process.env.CLIENT_URL}/?token=${token}&user=${userParam}`);
  } catch (err) {
    console.error("Erro no login Instagram:", err);
    res.redirect(`${process.env.CLIENT_URL}/?error=InstagramLoginFailed`);
  }
});

module.exports = router;