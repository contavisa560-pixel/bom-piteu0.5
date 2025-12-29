require("dotenv").config();
require("./cronJobsAdvanced"); // Ativa automação (Ponto 2)

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

const connectDB = require("./db");
const User = require("./models/User");
const { uploadToCloudflare } = require("./services/storageService");

// Importação de Rotas e Middlewares
const authRoutes = require("./routes/authRoutes");
const openaiChatRoutes = require("./routes/openaiChat");
const imageRoutes = require("./routes/imageRoutes");
const visionRoutes = require("./routes/visionRoutes");
const historyRoutes = require("./routes/historyRoutes");
const adminRoutes = require("./routes/adminRoutes");
const recipeSessionRoutes = require("./routes/recipeSessionRoutes");
const { apiLimiter, authLimiter, aiLimiter } = require("./middleware/security/rateLimiter");
const { authenticate } = require("./middleware/security/jwtAuth");

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;

// ===================== DATABASE =====================
connectDB();

// ===================== MIDDLEWARES =====================
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(passport.initialize());


// --- Aplicação de Rate Limits (Ponto 5) ---
app.use("/api/", apiLimiter);
app.use("/api/recipe/session", recipeSessionRoutes);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/chat", aiLimiter);   // Protege custos de IA
app.use("/api/vision", aiLimiter); // Protege custos de IA
app.use("/api/image", aiLimiter);  // Protege custos de IA

// ===================== MULTER (MEMÓRIA PARA CLOUDFLARE) =====================
const storage = multer.memoryStorage(); // Não salva no disco local (Ponto 3)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Máximo 5MB
});

// ===================== ESTRATÉGIAS OAUTH =====================
// --- Google ---
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email,
        provider: "google",
        avatar: profile.photos[0].value,
        needsPassword: false
      });
    }
    return done(null, user);
  } catch (err) { return done(err, null); }
}));

// --- Facebook ---
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: `${process.env.SERVER_URL}/api/auth/facebook/callback`,
  profileFields: ['id', 'displayName', 'emails', 'photos'],
  enableProof: true
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = (profile.emails && profile.emails.length > 0) ? profile.emails[0].value : `fb_${profile.id}@facebook.com`;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email,
        provider: "facebook",
        avatar: profile.photos?.[0]?.value || "",
        needsPassword: false
      });
    }
    return done(null, user);
  } catch (err) { return done(err, null); }
}));

// ===================== ROTAS DE AUTENTICAÇÃO =====================
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/api/auth/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
  const token = jwt.sign({ id: req.user._id }, JWT_SECRET, { expiresIn: "7d" });
  const userParam = encodeURIComponent(JSON.stringify({ id: req.user._id, name: req.user.name, avatar: req.user.avatar }));
  res.redirect(`${process.env.CLIENT_URL}/?token=${token}&user=${userParam}`);
});

app.get("/api/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
app.get("/api/auth/facebook/callback", passport.authenticate("facebook", { session: false }), (req, res) => {
  const token = jwt.sign({ id: req.user._id }, JWT_SECRET, { expiresIn: "7d" });
  const userParam = encodeURIComponent(JSON.stringify({ id: req.user._id, name: req.user.name, avatar: req.user.avatar }));
  res.redirect(`${process.env.CLIENT_URL}/?token=${token}&user=${userParam}`);
});

// ===================== ROTAS DE NEGÓCIO =====================
app.use("/api/auth", authRoutes);
app.use("/api/chat", openaiChatRoutes);
app.use("/api/image", imageRoutes);
app.use("/api/vision", visionRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/admin", adminRoutes); // Métricas Internas (Ponto 4)

// --- Upload de Avatar com Cloudflare (Ponto 3) ---
app.post("/api/users/avatar", authenticate, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Nenhuma imagem enviada." });

    // Sobe para o R2 e recebe a URL
    const imageUrl = await uploadToCloudflare(req.file.buffer, req.file.originalname, "avatars");

    await User.findByIdAndUpdate(req.user._id, { avatar: imageUrl });
    res.json({ success: true, avatar: imageUrl });
  } catch (err) {
    res.status(500).json({ error: "Falha no upload para nuvem" });
  }
});

// ===================== ERROR HANDLING & HEALTH =====================
app.get("/api/health", (req, res) => res.json({ status: "OK", timestamp: new Date() }));

app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()}: ${err.message}`);
  res.status(500).json({ error: "Erro interno no servidor Bom Piteu." });
});

// ===================== START SERVER =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Bom Piteu Backend rodando em http://localhost:${PORT}`));

module.exports = app;