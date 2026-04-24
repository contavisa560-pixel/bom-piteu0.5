require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");

const EMAIL = "visameu3@gmail.com"; // ← muda aqui

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado ao MongoDB");

    const user = await User.findOneAndUpdate(
      { email: EMAIL },
      { $set: { role: "admin" } },
      { new: true }
    );

    if (!user) {
      console.log("❌ Utilizador não encontrado:", EMAIL);
    } else {
      console.log("✅ Admin criado com sucesso!");
      console.log("   Nome:", user.name);
      console.log("   Email:", user.email);
      console.log("   Role:", user.role);
    }

  } catch (err) {
    console.error("❌ Erro:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Desconectado");
  }
}

makeAdmin();