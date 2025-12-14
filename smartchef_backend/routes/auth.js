const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { handleTikTokOAuth, handleInstagramOAuth } = require("../auth/oauth");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// -------------------- Google --------------------
router.get("/google", passport.authenticate("google", { scope: ["profile","email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: process.env.CLIENT_URL, session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`${process.env.CLIENT_URL}/?token=${token}`);
  }
);

// -------------------- TikTok --------------------
router.get("/tiktok/callback", async (req, res) => {
  try {
    const user = await handleTikTokOAuth(req.query.code);
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`${process.env.CLIENT_URL}/?token=${token}`);
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/?error=TikTokLoginFailed`);
  }
});

// -------------------- Instagram --------------------
router.get("/instagram/callback", async (req, res) => {
  try {
    const user = await handleInstagramOAuth(req.query.code);
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`${process.env.CLIENT_URL}/?token=${token}`);
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/?error=InstagramLoginFailed`);
  }
});

module.exports = router;
