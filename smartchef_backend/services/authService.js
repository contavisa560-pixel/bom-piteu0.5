const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Nota: Usando bcryptjs para maior compatibilidade

const JWT_SECRET = process.env.JWT_SECRET;

const authService = {
  // 1. Geração Centralizada de Token
  generateToken: (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
  },

  // 2. Segurança: Hash e Comparação
  hashPassword: async (password) => {
    return await bcrypt.hash(password, 10);
  },

  comparePassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  // 3. Formato Único de Usuário para o Frontend (MVP Stability)
  formatUser: (user) => ({
    id: user._id || user.id,
    name: user.name || user.displayName || "Utilizador",
    email: user.email || (user.emails && user.emails[0]?.value),
    avatar: user.avatar || (user.photos && user.photos[0]?.value) || "",
    plan: user.isPremium ? "Premium" : "Free",
    needsPassword: user.needsPassword || false,
    provider: user.provider || "local"
  }),

  // 4. Helper para Redirecionamento OAuth
  generateAuthRedirect: (user) => {
    const token = authService.generateToken(user._id || user.id);
    const userData = authService.formatUser(user);
    const userParam = encodeURIComponent(JSON.stringify(userData));
    return `${process.env.CLIENT_URL}/?token=${token}&user=${userParam}`;
  }
};

module.exports = authService;