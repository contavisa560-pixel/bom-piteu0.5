// db.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // parâmetros padrão do Mongoose
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB conectado com sucesso!");
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    process.exit(1); // encerra a aplicação se não conseguir conectar
  }
}

// Exporta a função para ser usada em server.js ou outros arquivos
module.exports = connectDB;
