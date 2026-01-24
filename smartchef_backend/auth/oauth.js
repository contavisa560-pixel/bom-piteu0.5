const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const axios = require("axios");
const querystring = require("querystring");
const User = require("../models/User");

// -------------------- Google OAuth --------------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        
        if (!user) {
          // Criar novo usuário se não existir
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            provider: "google",
            picture: profile.photos[0].value,
            // Importante: Definir uma senha aleatória ou marcar como verificado 
            // para evitar redirecionamentos indesejados para 'set-password'
            isVerified: true 
          });
          await user.save();
        }
        
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// -------------------- TikTok OAuth --------------------
async function handleTikTokOAuth(code) {
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
  if (!data) throw new Error("TikTok login failed");

  // Usamos o email ou um ID único consistente
  let user = await User.findOne({ email: data.email || `tiktok_${data.user_unique_id}@tiktok.com` });
  
  if (!user) {
    user = new User({
      name: data.display_name || "TikTok User",
      email: data.email || `tiktok_${data.user_unique_id}@tiktok.com`,
      provider: "tiktok",
      picture: data.avatar_url || "",
      isVerified: true
    });
    await user.save();
  }

  return user;
}

// -------------------- Instagram OAuth --------------------
async function handleInstagramOAuth(code) {
  const redirectUri = `${process.env.SERVER_URL}/api/auth/instagram/callback`;
  const tokenRes = await axios.post(
    "https://graph.facebook.com/v19.0/oauth/access_token",
    null,
    {
      params: {
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
        redirect_uri: redirectUri,
        code,
      },
    }
  );

  const accessToken = tokenRes.data.access_token;
  const userRes = await axios.get("https://graph.facebook.com/me", {
    params: { access_token: accessToken, fields: "id,name" },
  });

  const instaUser = userRes.data;
  let user = await User.findOne({ email: `insta_${instaUser.id}@instagram.com` });

  if (!user) {
    user = new User({
      name: instaUser.name,
      email: `insta_${instaUser.id}@instagram.com`,
      provider: "instagram",
      picture: `https://graph.facebook.com/${instaUser.id}/picture?type=large`,
      isVerified: true
    });
    await user.save();
  }

  return user;
}

module.exports = { handleTikTokOAuth, handleInstagramOAuth };