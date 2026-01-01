exports.validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  
  if (!name || name.length < 3) {
    return res.status(400).json({ error: "O nome deve ter pelo menos 3 caracteres." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: "E-mail inválido." });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: "A senha deve ter no mínimo 6 caracteres." });
  }

  next(); // Tudo ok, pode seguir para a rota
};