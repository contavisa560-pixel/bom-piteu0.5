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
          // Cria novo usuário se não existir
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

module.exports = { handleTikTokOAuth, handleInstagramOAuth };