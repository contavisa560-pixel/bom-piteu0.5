
require("dotenv").config();
require("./cronJobsAdvanced"); 
const { connectDB } = require("./db");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const autoRecipeRoutes = require("./routes/autoRecipe");
const testAutoRecipeMock = require("./routes/testAutoRecipeMock");

// Importação de Estratégias Passport (Movidas para um config separado para não poluir aqui)
require("./config/passport")(passport); 

// Importação de Rotas
const chatRoutes = require("./routes/chatRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const auth = require("./routes/auth");
 // Criamos este para limpar o server
const imageRoutes = require("./routes/imageRoutes");
const visionRoutes = require("./routes/visionRoutes");
const historyRoutes = require("./routes/historyRoutes");
const admin = require("./routes/admin");

const { apiLimiter, authLimiter, aiLimiter } = require("./middleware/security/rateLimiter");

const app = express();
connectDB();

// ===================== MIDDLEWARES =====================
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true })); 
app.use(passport.initialize());

// --- Rate Limits ---
app.use("/test-mock", testAutoRecipeMock);
app.use("/api/", apiLimiter); 
app.use("/api/auto-recipe", aiLimiter, autoRecipeRoutes);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/chat", aiLimiter);
app.use("/api/vision", aiLimiter);
app.use("/api/image", aiLimiter);

// ===================== ROTAS DEFINITIVAS =====================
app.use("/api/auth", auth);   // Email/Senha/Me/Avatar
 // Google/Facebook/Insta/TikTok
app.use("/api/image", imageRoutes);
app.use("/api/vision", visionRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/admin", admin);
app.use("/api/recipes", recipeRoutes);
app.use("/api/chat", chatRoutes);

// Health Check
app.get("/api/health", (req, res) => res.json({ status: "OK", timestamp: new Date() }));

// Tratamento de Erros Global
app.use((err, req, res, next) => {
  console.error(`[ERROR]: ${err.message}`);
  res.status(500).json({ error: "Erro interno no servidor Bom Piteu." });
});
// No server.js, após as importações:
console.log("Chat routes loaded from:", require.resolve("./routes/chat"));
console.log("ChatRoutes loaded from:", require.resolve("./routes/chatRoutes"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Bom Piteu Backend rodando em http://localhost:${PORT}`));

module.exports = app;