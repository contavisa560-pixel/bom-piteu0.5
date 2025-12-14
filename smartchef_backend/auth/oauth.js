const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const axios = require("axios");
const querystring = require("querystring");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;

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
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            provider: "google",
            picture: profile.photos[0].value,
          });
          await user.save();
        }
        done(null, user);
      } catch (err) {
        done(err, null);
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

  let user = await User.findOne({ _id: "tiktok_" + data.user_unique_id });
  if (!user) {
    user = new User({
      _id: "tiktok_" + data.user_unique_id,
      name: data.display_name || "TikTok User",
      provider: "tiktok",
      picture: data.avatar_url || "",
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
  let user = await User.findOne({ _id: "instagram_" + instaUser.id });
  if (!user) {
    user = new User({
      _id: "instagram_" + instaUser.id,
      name: instaUser.name,
      provider: "instagram",
      picture: `https://graph.facebook.com/${instaUser.id}/picture?type=large`,
    });
    await user.save();
  }

  return user;
}

module.exports = { handleTikTokOAuth, handleInstagramOAuth };
