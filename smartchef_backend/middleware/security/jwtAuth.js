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
const authenticateOptional = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    req.user = user || null;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

module.exports = {
  authenticate,
  authenticateOptional
};