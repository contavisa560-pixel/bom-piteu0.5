const jwt = require("jsonwebtoken");
const User = require("../../models/User");

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ error: "Usuário não encontrado" });
    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
};

module.exports = { authenticate };
