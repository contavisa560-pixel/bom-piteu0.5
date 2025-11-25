require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
const querystring = require("querystring");

const { readUsers, writeUsers } = require("./db");
const authRoutes = require("./auth");
const openaiChatRoute = require("./routes/openaiChat");

const app = express();

// -------------------------------
// CORS
// -------------------------------
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

// -------------------------------
// ROTAS PRINCIPAIS
// -------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/openai", openaiChatRoute);

// -------------------------------
// GOOGLE LOGIN
// -------------------------------
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      const users = readUsers();
      let user = users.find((u) => u.email === profile.emails[0].value);

      if (!user) {
        user = {
          id: "google_" + profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          provider: "google",
          picture: profile.photos[0].value,
          passwordHash: null,
          level: 1,
          points: 0,
          favorites: [],
          isPremium: false,
        };
        users.push(user);
        writeUsers(users);
      }

      return done(null, user);
    }
  )
);

const JWT_SECRET = process.env.JWT_SECRET;

// Iniciar login Google
app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })
);

// Callback Google
app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: process.env.CLIENT_URL, session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id }, JWT_SECRET, { expiresIn: "7d" });
    const userParam = encodeURIComponent(JSON.stringify(req.user));
    res.redirect(`${process.env.CLIENT_URL}/?token=${token}&user=${userParam}`);
  }
);

// -------------------------------
// TIKTOK LOGIN
// -------------------------------

// Iniciar login TikTok
app.get("/api/auth/tiktok", (req, res) => {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = encodeURIComponent(`${process.env.SERVER_URL}/api/auth/tiktok/callback`);
  const scope = "user.info.basic";
  const state = "state123"; // pode gerar aleatório se quiser

  const url = `https://www.tiktok.com/auth/authorize?client_key=${clientKey}&response_type=code&scope=${scope}&redirect_uri=${redirectUri}&state=${state}`;
  res.redirect(url);
});

// Callback TikTok
app.get("/api/auth/tiktok/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL}/?error=NoCode`);
  }

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
    const tiktokUser = data ? data : null;

    if (!tiktokUser) return res.redirect(`${process.env.CLIENT_URL}/?error=TikTokLoginFailed`);

    const users = readUsers();
    let user = users.find((u) => u.id === "tiktok_" + tiktokUser.user_unique_id);

    if (!user) {
      user = {
        id: "tiktok_" + tiktokUser.user_unique_id,
        name: tiktokUser.display_name || "TikTok User",
        email: tiktokUser.email || null,
        provider: "tiktok",
        picture: tiktokUser.avatar_url || "",
        passwordHash: null,
        level: 1,
        points: 0,
        favorites: [],
        isPremium: false,
      };
      users.push(user);
      writeUsers(users);
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    const userParam = encodeURIComponent(JSON.stringify(user));

    res.redirect(`${process.env.CLIENT_URL}/?token=${token}&user=${userParam}`);
  } catch (err) {
    console.error("Erro TikTok OAuth:", err.response?.data || err.message);
    res.redirect(`${process.env.CLIENT_URL}/?error=TikTokLoginFailed`);
  }
});

// ================================
// INSTAGRAM LOGIN (META OAUTH)
// ================================
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
    // Trocar código por access token
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

    // Buscar dados do utilizador
    const userRes = await axios.get("https://graph.facebook.com/me", {
      params: {
        access_token: accessToken,
        fields: "id,name",
      },
    });

    const instaUser = userRes.data;

    // Registo / login automático
    const users = readUsers();
    let user = users.find(u => u.id === "instagram_" + instaUser.id);

    if (!user) {
      user = {
        id: "instagram_" + instaUser.id,
        name: instaUser.name,
        email: null,
        provider: "instagram",
        picture: `https://graph.facebook.com/${instaUser.id}/picture?type=large`,
        passwordHash: null,
        level: 1,
        points: 0,
        favorites: [],
        isPremium: false,
      };
      users.push(user);
      writeUsers(users);
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    const userParam = encodeURIComponent(JSON.stringify(user));

    res.redirect(`${process.env.CLIENT_URL}/?token=${token}&user=${userParam}`);
  } catch (err) {
    console.error("Erro Instagram OAuth:", err.response?.data || err.message);
    return res.redirect(`${process.env.CLIENT_URL}/?error=InstagramLoginFailed`);
  }
});

// -------------------------------
// UPLOAD DE AVATAR
// -------------------------------
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const fileName = `${req.params.id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

app.post("/api/users/:id/avatar", upload.single("avatar"), (req, res) => {
  const users = readUsers();
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "user_not_found" });

  user.picture = `${process.env.SERVER_URL}/uploads/${req.file.filename}`;
  writeUsers(users);

  res.json({ imageUrl: user.picture });
});

// -------------------------------
// PUT /api/users/:id
// -------------------------------
app.put("/api/users/:id", (req, res) => {
  const users = readUsers();
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "user_not_found" });

  Object.assign(user, req.body);
  writeUsers(users);
  res.json({ success: true, user });
});

// -------------------------------
// START SERVER
// -------------------------------
app.listen(process.env.PORT, () => {
  console.log(`🔥 Backend a correr em http://localhost:${process.env.PORT}`);
});
