// db.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Carrega variáveis do .env
dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI); // só isso já basta

    console.log("MongoDB conectado com sucesso!");
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    process.exit(1);
  }
}

module.exports = connectDB;
