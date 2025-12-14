require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
const querystring = require("querystring");
const cron = require("node-cron");

const connectDB = require("./db");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const openaiChatRoutes = require("./routes/openaiChat");
const imageRoutes = require("./routes/imageRoutes");
const visionRoutes = require("./routes/visionRoutes");
const limitService = require("./services/limitService");

const app = express();

/* ===================== DATABASE ===================== */
connectDB();

/* ===================== MIDDLEWARES ===================== */
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));
app.use(passport.initialize());

/* ===================== ROUTES ===================== */
app.use("/api/auth", authRoutes);
app.use("/api/chat", openaiChatRoutes);
app.use("/api/image", imageRoutes);
app.use("/api/vision", visionRoutes);

app.get("/api/health", (req, res) => res.json({ status: "OK" }));

const JWT_SECRET = process.env.JWT_SECRET;

/* ===================== GOOGLE OAUTH ===================== */
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
        needsPassword: true
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/api/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    if (req.user.needsPassword) return res.redirect(`${process.env.CLIENT_URL}/set-password?userId=${req.user._id}`);
    const token = jwt.sign({ id: req.user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`${process.env.CLIENT_URL}/?token=${token}`);
  }
);

/* ===================== FACEBOOK OAUTH ===================== */
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: `${process.env.SERVER_URL}/api/auth/facebook/callback`,
  profileFields: ['id', 'displayName', 'email', 'photos']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value || `fb_${profile.id}@facebook.com`;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email,
        provider: "facebook",
        avatar: profile.photos?.[0]?.value || "",
        needsPassword: true
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

app.get("/api/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
app.get("/api/auth/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req, res) => {
    if (req.user.needsPassword) return res.redirect(`${process.env.CLIENT_URL}/set-password?userId=${req.user._id}`);
    const token = jwt.sign({ id: req.user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`${process.env.CLIENT_URL}/?token=${token}`);
  }
);

/* ===================== TIKTOK OAUTH ===================== */
app.get("/api/auth/tiktok", (req, res) => {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = encodeURIComponent(`${process.env.SERVER_URL}/api/auth/tiktok/callback`);
  const scope = "user.info.basic";
  const state = "state123";
  const url = `https://www.tiktok.com/auth/authorize?client_key=${clientKey}&response_type=code&scope=${scope}&redirect_uri=${redirectUri}&state=${state}`;
  res.redirect(url);
});

app.get("/api/auth/tiktok/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect(`${process.env.CLIENT_URL}/?error=NoCode`);
  try {
    const tokenRes = await axios.post(
      "https://open-api.tiktok.com/oauth/access_token/",
      querystring.stringify({
        client_key: process.env.TIKTOK_CLIENT_KEY,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      })
    );
    const data = tokenRes.data.data;
    let user = await User.findOne({ email: `tiktok_${data.user_unique_id}@tiktok.com` });
    if (!user) {
      user = await User.create({
        name: data.display_name || "TikTok User",
        email: `tiktok_${data.user_unique_id}@tiktok.com`,
        provider: "tiktok",
        avatar: data.avatar_url || "",
        needsPassword: true
      });
    }
    if (user.needsPassword) return res.redirect(`${process.env.CLIENT_URL}/set-password?userId=${user._id}`);
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`${process.env.CLIENT_URL}/?token=${token}`);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.redirect(`${process.env.CLIENT_URL}/?error=TikTokLoginFailed`);
  }
});

/* ===================== INSTAGRAM OAUTH ===================== */
const INSTAGRAM_REDIRECT_URL = `${process.env.SERVER_URL}/api/auth/instagram/callback`;

app.get("/api/auth/instagram", (req, res) => {
  const url =
    "https://www.facebook.com/v19.0/dialog/oauth?" +
    querystring.stringify({
      client_id: process.env.INSTAGRAM_CLIENT_ID,
      redirect_uri: INSTAGRAM_REDIRECT_URL,
      scope: "instagram_basic, public_profile",
      response_type: "code",
    });
  res.redirect(url);
});

app.get("/api/auth/instagram/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const tokenRes = await axios.post(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      null,
      {
        params: {
          client_id: process.env.INSTAGRAM_CLIENT_ID,
          client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
          redirect_uri: INSTAGRAM_REDIRECT_URL,
          code,
        },
      }
    );
    const accessToken = tokenRes.data.access_token;
    const userRes = await axios.get("https://graph.facebook.com/me", {
      params: { access_token: accessToken, fields: "id,name" },
    });
    const instaUser = userRes.data;
    let user = await User.findOne({ email: `instagram_${instaUser.id}@instagram.com` });
    if (!user) {
      user = await User.create({
        name: instaUser.name,
        email: `instagram_${instaUser.id}@instagram.com`,
        provider: "instagram",
        avatar: `https://graph.facebook.com/${instaUser.id}/picture?type=large`,
        needsPassword: true
      });
    }
    if (user.needsPassword) return res.redirect(`${process.env.CLIENT_URL}/set-password?userId=${user._id}`);
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`${process.env.CLIENT_URL}/?token=${token}`);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.redirect(`${process.env.CLIENT_URL}/?error=InstagramLoginFailed`);
  }
});

/* ===================== AVATAR UPLOAD ===================== */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${req.user._id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

app.post("/api/users/avatar", upload.single("avatar"), async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ error: "User not found" });
  user.avatar = `${process.env.SERVER_URL}/uploads/${req.file.filename}`;
  await user.save();
  res.json({ success: true, avatar: user.avatar });
});

/* ===================== CRON JOBS PARA LIMITES ===================== */
cron.schedule("0 0 * * *", async () => {
  const users = await User.find();
  for (const u of users) {
    u.usedDaily = { text: 0, gen: 0, vision: 0 };
    u.lastReset = new Date();
    await u.save();
  }
  console.log("✅ Limites diários resetados");
});

cron.schedule("0 0 * * 0", async () => {
  const users = await User.find();
  for (const u of users) {
    u.usedWeekly = { text: 0, gen: 0, vision: 0 };
    await u.save();
  }
  console.log("✅ Limites semanais resetados");
});

/* ===================== SERVER ===================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Backend rodando em http://localhost:${PORT}`));

module.exports = app;
