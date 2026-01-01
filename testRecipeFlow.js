// testRecipeFlow.js
import RecipeSession from "./smartchef_backend/models/RecipeSession.js";
import { v4 as uuidv4 } from "uuid";
// Mock de detectUserIntent
function detectUserIntent(text) {
  const lower = text.toLowerCase();
  const isCooking = lower.includes("cozinhar") || lower.includes("preparar") || lower.includes("fazer");
  const isQuestion = lower.includes("como") || lower.includes("qual");
  return { isCooking, isQuestion };
}

// Mock de answerGeneralQuestion
async function answerGeneralQuestion(text, userName) {
  return `Olá ${userName}, eu posso te ajudar com dicas culinárias sobre: "${text}"`;
}

// Mock de askChefSmartExploration
async function askChefSmartExploration({ ingredientsText }) {
  // Se mencionar "pão" → inicia automaticamente receita
  if (ingredientsText.includes("pão")) {
    return {
      mode: "AUTO_START",
      recipe: {
        title: "Torrada de Banana com Mel",
        description: "Uma receita deliciosa para o café da manhã.",
        steps: [
          { stepNumber: 1, objective: "Preparar ingredientes", expectedAction: "Corte a banana", validationStatus: "PENDING" },
          { stepNumber: 2, objective: "Montar a torrada", expectedAction: "Coloque banana e mel sobre o pão", validationStatus: "PENDING" }
        ]
      }
    };
  }

  // Caso contrário → apenas sugere opções
  return {
    mode: "CHOICE",
    alternatives: ["Bolo de Banana", "Panquecas"]
  };
}

// Mock de startRecipeSession
async function startRecipeSession(session, recipe) {
  session.mode = "RECIPE_ACTIVE";
  session.recipe = recipe;
  session.currentStepIndex = 0;
  session.steps = recipe.steps || [];
  console.log(`✅ Receita iniciada: ${recipe.title}`);
}

// Mock de askChef
async function askChef({ message, step }) {
  console.log(`💬 Prompt enviado ao Chef: ${message}`);
  return { status: "VALID", reply: `Passo ${step.stepNumber} validado com sucesso!` };
}

// Função principal de teste
async function testFlow() {
  const userId = uuidv4();
  let session = {
    _id: uuidv4(),
    userId,
    mode: "CHAT",
    steps: [],
    currentStepIndex: 0,
    recipe: null
  };

  console.log("=== INÍCIO DO TESTE DE FLUXO DE RECEITA ===");

  // 1️⃣ Mensagem inicial do usuário
  let userMsg = "Oi, tenho pão, manteiga, mel e banana. Vamos cozinhar!";
  let intent = detectUserIntent(userMsg);
  console.log("\n[Usuário]:", userMsg);
  console.log("➡️ Detecção de intenção:", intent);

  // 2️⃣ Modo CHAT → EXPLORATION
  if (session.mode === "CHAT" && intent.isCooking) {
    session.mode = "EXPLORATION";
    console.log("🔹 Mudando para modo EXPLORATION");

    const exploration = await askChefSmartExploration({ ingredientsText: userMsg });

    if (exploration.mode === "AUTO_START") {
      await startRecipeSession(session, exploration.recipe);
      console.log("📌 Receita ativa:", session.recipe.title);
    } else {
      console.log("📌 Alternativas:", exploration.alternatives);
    }
  }

  // 3️⃣ Modo RECIPE_ACTIVE → passo a passo
  while (session.mode === "RECIPE_ACTIVE") {
    const step = session.steps[session.currentStepIndex];
    console.log(`\n🔹 Passo ${step.stepNumber}: ${step.objective}`);
    console.log(`Esperado: ${step.expectedAction}`);

    // Simula entrada do usuário
    const userStepMsg = `Executando passo ${step.stepNumber}`;
    console.log("[Usuário]:", userStepMsg);

    // Simula chamada ao Chef
    const completion = await askChef({
      message: `Prompt para passo ${step.stepNumber}`,
      step
    });

    step.validationStatus = completion.status;
    step.completedAt = new Date();
    console.log("[Chef]:", completion.reply);

    session.currentStepIndex += 1;

    if (session.currentStepIndex >= session.steps.length) {
      session.mode = "COMPLETED";
      console.log("\n🎉 Receita concluída com sucesso!");
      break;
    }
  }

  console.log("\n=== FIM DO TESTE ===");
}

testFlow();
