const mongoose = require("mongoose");
const RecipeSession = require("./models/RecipeSession");

const MONGO_URI = "mongodb+srv://contavisa560_db_user:IKUeAPQOMBRSAFcd@cluster.jfrxvdu.mongodb.net/bompiteu_db?retryWrites=true&w=majority";

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado ao MongoDB");

    const result = await RecipeSession.deleteMany({ sessionId: null });

    console.log(`🧹 Sessões apagadas: ${result.deletedCount}`);

    await mongoose.disconnect();
    console.log("🔌 Conexão encerrada");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro ao limpar sessões:", err);
    process.exit(1);
  }
})();
