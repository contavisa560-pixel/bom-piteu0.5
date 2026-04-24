const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// Carrega variáveis de ambiente
dotenv.config();

const USERS_FILE = path.join(__dirname, "data", "users.json");

async function connectDB() {
  try {
    // Chamada sem opções obsoletas 
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conectado com sucesso!");
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    // não encerraremos o processo para permitir uso do JSON local em desenvolvimento
  }
}

// Funções para leitura/escrita em data/users.json (mantém compatibilidade local)
function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
      fs.writeFileSync(USERS_FILE, "[]", "utf8");
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Erro a ler users.json:", err);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Erro a escrever users.json:", err);
    return false;
  }
}

module.exports = {
  connectDB,
  readUsers,
  writeUsers,
};