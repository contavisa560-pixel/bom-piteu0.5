require("dotenv").config(); // carregar variáveis do .env
const mongoose = require("mongoose");
const RecipeService = require("./services/recipeService");

async function main() {
  try {
    // 🔹 Conecta no MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado ao MongoDB Atlas");

    const userId = "64b000000000000000000001"; // ID de teste
    
    const recipeData = {
      title: "Lasanha à Bolonhesa",
      steps: [
        {
          objective: "Preparar o molho à bolonhesa.",
          expectedAction: "Em uma panela, aquecer azeite e refogar cebola e alho...",
          expectedVisual: "Um molho espesso e bem temperado, com pedaços de carne e molho de tomate.",
          warnings: ["Não deixar a carne queimar."]
        },
        {
          objective: "Preparar o molho branco.",
          expectedAction: "Derreter manteiga, adicionar farinha, leite, mexer até engrossar...",
          expectedVisual: "Um molho branco cremoso e liso.",
          warnings: ["Não parar de mexer."]
        },
        {
          objective: "Montar a lasanha.",
          expectedAction: "Intercalar camadas de molho, massa e queijo...",
          expectedVisual: "Uma lasanha bem montada, com camadas visíveis e queijo derretido.",
          warnings: ["Queijo deve estar derretido."]
        },
        {
          objective: "Servir a lasanha.",
          expectedAction: "Retirar do forno, descansar 10 min e cortar.",
          expectedVisual: "Porções de lasanha servidas em pratos.",
          warnings: ["Cuidado com molho quente."]
        }
      ]
    };

    const session = await RecipeService.startSession(userId, recipeData);
    console.log("✅ Sessão iniciada:", session._id);

    for (let i = 0; i < session.steps.length; i++) {
      const updated = await RecipeService.updateProgress(session._id, i);
      console.log(`➡️ Passo ${i + 1}: ${updated.steps[i].objective}`);
      console.log(`   Status do passo: ${updated.steps[i].completed}`);
    }

    const active = await RecipeService.getActiveSession(userId);
    console.log("📝 Sessão final:", active.status);

  } catch (err) {
    console.error("❌ Erro:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

main();
