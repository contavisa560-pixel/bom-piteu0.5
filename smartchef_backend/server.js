
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

require("dotenv").config();
require("./cronJobsAdvanced");
const { connectDB, readUsers, writeUsers } = require("./db");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const autoRecipeRoutes = require("./routes/autoRecipe");
const translateRoutes = require('./routes/translate');
const { authenticate } = require("./middleware/auth");
const preferencesRoutes = require("./routes/preferencesRoutes");
const observacoesRoutes = require('./routes/observacoes');
const profilesRoutes = require('./routes/profiles');
const saudeRoutes = require("./routes/saude");
const alertasRoutes = require("./routes/alertas");
const urlsRoutes = require("./routes/urls");
const integrationRoutes = require("./routes/integration");
const notificationRoutes = require('./routes/notificationRoutes');
const ratingsRouter = require('./routes/ratings');
const supportChatRoutes = require('./routes/supportChat');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const SupportChat = require('./models/SupportChat');
const SupportMessage = require('./models/SupportMessage');
const { getApiLimiter, authLimiter, aiLimiter } = require("./middleware/security/rateLimiter");
// Importação de Estratégias Passport (Movidas para um config separado para não poluir aqui)
require("./config/passport")(passport);

// Importação de Rotas

const chatRoutes = require("./routes/chatRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const auth = require("./routes/auth");
const settingsRoutes = require("./routes/settingsRoutes");
// Criamos este para limpar o server
const imageRoutes = require("./routes/imageRoutes");
const visionRoutes = require("./routes/visionRoutes");
const historyRoutes = require("./routes/historyRoutes");
const admin = require("./routes/admin");
const sessionRoutes = require("./routes/sessionRoutes");
const twoFactorRoutes = require("./routes/twoFactorRoutes");
const userRoutes = require("./routes/userRoutes");
const planeamentoRoutes = require('./routes/planeamento');
const maintenanceMode = require('./middleware/maintenanceMode');
const app = express();
connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

// Middleware de autenticação do socket
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Autenticação necessária'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id; // ajuste conforme seu token
    next();
  } catch (err) {
    next(new Error('Token inválido'));
  }
});

io.on('connection', (socket) => {
  console.log('Socket conectado:', socket.userId);

  socket.on('joinChat', (chatId) => {
    socket.join(`support:${chatId}`);
    console.log(`Usuário ${socket.userId} entrou na sala support:${chatId}`);
  });

  socket.on('leaveChat', (chatId) => {
    socket.leave(`support:${chatId}`);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { chatId, content } = data;

      // Verifica se o chat pertence ao usuário e está ativo
      const chat = await SupportChat.findOne({ _id: chatId, userId: socket.userId, status: 'active' });
      if (!chat) {
        socket.emit('error', 'Chat não encontrado ou inativo');
        return;
      }

      const message = new SupportMessage({
        chatId,
        sender: 'user',
        content
      });
      await message.save();

      // Emitir para todos na sala (incluindo o próprio remetente)
      io.to(`support:${chatId}`).emit('newMessage', {
        id: message._id,
        sender: 'user',
        content,
        timestamp: message.timestamp
      });

    } catch (error) {
      console.error('Erro no sendMessage:', error);
      socket.emit('error', 'Erro ao enviar mensagem');
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket desconectado:', socket.userId);
  });

  // Admin join para todas as salas de suporte (será chamado pelo admin)
  socket.on('admin-join', () => {
    socket.join('admin-support');
    console.log(`Admin ${socket.userId} entrou na sala admin-support`);
  });

  // Admin enviar mensagem para um chat
  socket.on('admin-message', async (data) => {
    try {
      const { chatId, content } = data;
      // Verificar se o usuário é admin (pode ser feito no frontend pelo token, mas aqui confiamos no token já validado)
      const chat = await SupportChat.findById(chatId);
      if (!chat) {
        socket.emit('error', 'Chat não encontrado');
        return;
      }
      // Criar mensagem
      const message = new SupportMessage({
        chatId,
        sender: 'support',
        content,
        read: false
      });
      await message.save();
      // Emitir para a sala do chat (usuário) e para a sala admin
      io.to(`support:${chatId}`).emit('newMessage', {
        id: message._id,
        sender: 'support',
        content,
        timestamp: message.timestamp
      });
      io.to('admin-support').emit('newMessage', {
        chatId,
        message: {
          id: message._id,
          sender: 'support',
          content,
          timestamp: message.timestamp
        }
      });
    } catch (error) {
      console.error('Erro no admin-message:', error);
      socket.emit('error', 'Erro ao enviar mensagem');
    }
  });

  // Admin obter lista de chats ativos (pode ser via REST, mas também via socket)
  socket.on('admin-get-chats', async () => {
    try {
      const chats = await SupportChat.find({ status: 'active' })
        .populate('userId', 'name email')
        .sort({ updatedAt: -1 });
      socket.emit('admin-chats-list', chats);
    } catch (error) {
      console.error('Erro ao buscar chats:', error);
      socket.emit('error', 'Erro ao buscar chats');
    }
  });
});
// ===================== MIDDLEWARES =====================

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(maintenanceMode);
app.use(passport.initialize());
// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static('uploads'));
// --- Rate Limits ---
app.use('/api/support', supportChatRoutes);
app.use('/api/ratings', ratingsRouter);
app.use("/api/notifications", notificationRoutes);
app.use('/api/planeamento', planeamentoRoutes);
app.use('/api/observacoes', observacoesRoutes);
app.use('/api/profiles', profilesRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/users", userRoutes);
app.use('/api/translate', translateRoutes);
app.use("/api/", async (req, res, next) => {
  const limiter = await getApiLimiter();
  limiter(req, res, next);
});
app.use("/api/auto-recipe", aiLimiter, autoRecipeRoutes);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/chat", aiLimiter);
app.use("/api/vision", aiLimiter);
app.use("/api/image", aiLimiter);
app.use("/api/preferences", preferencesRoutes);
app.use("/api/preferences", require("./routes/preferencesRoutes"));
app.use("/api/international-recipes", require("./routes/internationalRecipes"));
app.use("/api/special-recipes", require("./routes/specialRecipes"));
app.use("/api/settings", settingsRoutes);
app.use("/api/saude", saudeRoutes);
app.use('/api/saude', saudeRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/urls', urlsRoutes);
app.use('/api/integration', integrationRoutes);
// ===================== ROTAS DEFINITIVAS =====================
app.use("/api/auth", auth);   // Email/Senha/Me/Avatar
app.use("/api/2fa", twoFactorRoutes);
// Google/Facebook/Insta/TikTok
app.use("/api/image", imageRoutes);
app.use("/api/vision", visionRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/admin", admin);
app.use("/api/recipes", recipeRoutes);
app.use("/api/chat", chatRoutes);

// Health Check
app.get("/api/health", (req, res) => res.json({ status: "OK", timestamp: new Date() }));
// Configurações públicas (sem autenticação) — lidas pelo frontend
app.get('/api/settings/public', async (req, res) => {
  try {
    const { getSettings } = require('./services/systemSettingsService');
    const s = await getSettings();
    res.json({
      success: true,
      data: {
        premiumPrices: s.premiumPrices,
        trialDays: s.trialDays,
        subscriptionsEnabled: s.subscriptionsEnabled,
        aiFeatures: s.aiFeatures,
        defaultLimits: s.defaultLimits,
        maintenanceMode: s.maintenanceMode,
        allowNewRegistrations: s.allowNewRegistrations,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Tratamento de Erros Global
app.use((err, req, res, next) => {
  console.error(`[ERROR]: ${err.message}`);
  res.status(500).json({ error: "Erro interno no servidor Bom Piteu." });
});

console.log("Chat routes loaded from:", require.resolve("./routes/chat"));
console.log("ChatRoutes loaded from:", require.resolve("./routes/chatRoutes"));
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Bom Piteu Backend rodando em http://localhost:${PORT}`));
module.exports = app;