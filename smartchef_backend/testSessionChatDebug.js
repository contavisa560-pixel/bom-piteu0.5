require("dotenv").config();
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

// Models
const RecipeSession = require("./models/RecipeSession");
const User = require("./models/User"); // Certifique-se de que existe algum usuário no banco

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://contavisa560_db_user:IKUeAPQOMBRSAFcd@cluster.jfrxvdu.mongodb.net/bompiteu_db?retryWrites=true&w=majority";
const JWT_SECRET = process.env.JWT_SECRET || "superseguro123";

async function main() {
  try {
    // 1️⃣ Conectar ao MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado ao MongoDB");

    // 2️⃣ Pega um usuário existente (ou cria um para teste)
    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        username: "testuser",
        email: "testuser@example.com",
        password: "123456" // qualquer coisa, só para teste
      });
      console.log("✅ Usuário de teste criado:", user._id.toString());
    }

    // 3️⃣ Gerar token JWT válido
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    console.log("✅ Token JWT gerado:", token);

    // 4️⃣ Criar sessão de teste
    const session = await RecipeSession.create({
      userId: user._id,
      sessionId: uuidv4(),
      recipeTitle: "Receita Teste",
      fullRecipeData: {
        steps: [
          { stepNumber: 1, description: "Pré-aqueça o forno" },
          { stepNumber: 2, description: "Misture os ingredientes" },
          { stepNumber: 3, description: "Asse por 30 minutos" }
        ]
      },
      steps: [
        { stepNumber: 1, description: "Pré-aqueça o forno" },
        { stepNumber: 2, description: "Misture os ingredientes" },
        { stepNumber: 3, description: "Asse por 30 minutos" }
      ]
    });
    console.log("✅ Sessão criada:", session._id.toString(), "UUID:", session.sessionId);

    // 5️⃣ Enviar mensagem ao chat da sessão
    const messageBody = {
      sessionId: session._id.toString(),
      content: "Olá Chef! Estou pronto para o passo 1."
    };

    const response = await fetch("http://localhost:5000/api/recipe/session/message/text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(messageBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Erro ao enviar mensagem:", response.status, data);
    } else {
      console.log("✅ Mensagem enviada com sucesso!");
      console.log("Resposta do AI:", data);
    }

    // 6️⃣ Encerrar conexão
    await mongoose.connection.close();
    console.log("✅ Conexão encerrada");
  } catch (err) {
    console.error("❌ Erro no teste completo:", err);
  }
}

main();
