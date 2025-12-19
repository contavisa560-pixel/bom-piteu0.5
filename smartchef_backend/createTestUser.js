require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

// Conecta ao MongoDB
mongoose.connect(process.env.MONGO_URI)

  .then(() => console.log("MongoDB conectado!"))
  .catch(err => console.error("Erro ao conectar no MongoDB:", err));

async function createTestUser() {
  try {
    const email = "teste@teste.com";
    const password = "123456";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Usuário já existe!");
      return process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: "Usuário Teste",
      email,
      password: passwordHash,
      provider: "local",
      needsPassword: false
    });

    console.log("Usuário de teste criado:", user);
    process.exit(0);
  } catch (err) {
    console.error("Erro:", err);
    process.exit(1);
  }
}

createTestUser();
