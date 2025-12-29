const RecipeSession = require("../models/RecipeSession");
const Message = require("../models/Message");
const {
  askChef,
  askChefSmartExploration,
  detectUserIntent,
  answerGeneralQuestion
} = require("../services/openai");
const { v4: uuidv4 } = require("uuid");
const { buildStepPrompt } = require("../services/buildStepPrompt");
const { interpretExplorationInput } = require("../services/openai");



// 🔹 Função auxiliar: obter passo atual
function getCurrentStep(session) {
  return session.steps[session.currentStepIndex] || null;
}

// 🔹 Função auxiliar: iniciar receita passo a passo
async function startRecipeSession(session, recipe) {
  if (session.mode === "RECIPE_ACTIVE") return;

  session.mode = "RECIPE_ACTIVE";
  session.recipeTitle = recipe.title;
  session.steps = recipe.steps.map((s, i) => ({
    stepNumber: i + 1,
    objective: s.objective || s.description,
    expectedAction: s.expectedAction || s.action,
    expectedVisual: s.expectedVisual || "",
    validationStatus: "PENDING"
  }));

  session.currentStepIndex = 0;
  await session.save();
}


// 🔹 1️⃣ Criar sessão
exports.startSession = async (req, res) => {
  try {
    const { recipeTitle, fullRecipeData } = req.body;

    if (!recipeTitle || !fullRecipeData) {
      return res.status(400).json({ error: "Dados da receita em falta" });
    }

    const session = await RecipeSession.create({
      userId: req.user._id,
      sessionId: uuidv4(),
      recipeTitle,
      fullRecipeData,
      steps: fullRecipeData.steps || [],
      mode: "CHAT", // inicia em modo CHAT, EXPLORATION será ativado quando o usuário fornecer ingredientes
      currentStepIndex: 0
    });

    res.json({
      sessionId: session._id,
      recipeTitle: session.recipeTitle,
      currentStepIndex: session.currentStepIndex,
      mode: session.mode
    });
  } catch (err) {
    console.error("ERRO startSession:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// 🔹 2️⃣ Enviar mensagem — versão profissional e interativa
exports.sendStepMessage = async (req, res) => {
  try {
    const { sessionId, content, image } = req.body;
    const session = await RecipeSession.findOne({
      _id: sessionId,
      userId: req.user.id,
      status: "IN_PROGRESS"
    });

    if (!session) {
      return res.status(404).json({ error: "Sessão não encontrada" });
    }// Detectar intenção do usuário
    const intent = detectUserIntent(content);
    //  USUÁRIO ESCOLHEU UMA RECEITA (clicou num card)
    if (intent === "CHOOSE_RECIPE") {
      // Encontrar a receita completa
      const recipe = session.explorationOptions?.find(
        r => r.title.toLowerCase() === content.toLowerCase()
      ) || session.fullRecipeData;

      if (!recipe) {
        return res.json({
          chefFeedback: "Não encontrei a receita completa. Tente novamente.",
          mode: "EXPLORATION"
        });
      }

      // Inicia a receita e popula os passos
      await startRecipeSession(session, recipe);

      const firstStep = session.steps[0];

      return res.json({
        chefFeedback:
          `🍽️ **${recipe.title}**\n\n` +
          `**Passo 1 de ${session.steps.length}**\n` +
          `🎯 Objetivo: ${firstStep.objective}\n\n` +
          `👉 O que fazer agora:\n${firstStep.expectedAction}`,
        step: firstStep,
        action: "SHOW_STEP",
        mode: "RECIPE_ACTIVE"
      });
    }

    console.log("💬 Conteúdo:", content);
    console.log("🧠 Sessão ID:", session._id);
    console.log("📌 MODO ATUAL:", session.mode);
    console.log("🍽️ Receita ativa:", session.recipe?.title || "Nenhuma");
    console.log("🎯 INTENÇÃO DETETADA:", intent);

    // 🔹 PRIORIDADE MÁXIMA: interpretar escolha se já existem opções
    if (
      session.mode === "EXPLORATION" &&
      Array.isArray(session.explorationOptions) &&
      session.explorationOptions.length > 0
    ) {
      // 🔐 Match direto por título (clique em card)
      const directIndex = session.explorationOptions.findIndex(
        r => r.title.toLowerCase() === content.toLowerCase()
      );

      if (directIndex !== -1) {
        const recipe = session.explorationOptions[directIndex];
        await startRecipeSession(session, recipe);

        const firstStep = session.steps[0];

        return res.json({
          chefFeedback:
            `🍽️ **${recipe.title}**\n\n` +
            `**Passo 1 de ${session.steps.length}**\n` +
            `🎯 Objetivo: ${firstStep.objective}\n\n` +
            `👉 O que fazer agora:\n${firstStep.expectedAction}`,
          step: firstStep,
          action: "SHOW_STEP",
          mode: "RECIPE_ACTIVE"
        });
      }

      const interpretation = await interpretExplorationInput({
        userText: content,
        options: session.explorationOptions
      });

      //  Pedido de mais opções
      if (interpretation.intent === "MORE") {
        session.explorationOptions = [];
        await session.save();

        return res.json({
          chefFeedback: "Sem problemas! Vou sugerir outras opções 🍽️",
          mode: "EXPLORATION"
        });
      }

      //  Escolha válida
      if (
        interpretation.intent === "CHOOSE" &&
        session.explorationOptions[interpretation.index]
      ) {
        const recipe = session.explorationOptions[interpretation.index];
        await startRecipeSession(session, recipe);

        const firstStep = session.steps[0];

        return res.json({
          chefFeedback:
            `🍽️ **${recipe.title}**\n\n` +
            `**Passo 1 de ${session.steps.length}**\n` +
            `🎯 Objetivo: ${firstStep.objective}\n\n` +
            `👉 O que fazer agora:\n${firstStep.expectedAction}`,
          step: firstStep,
          action: "SHOW_STEP",
          mode: "RECIPE_ACTIVE"
        });
      }

      // Não entendeu a escolha
      return res.json({
        chefFeedback:
          "Não entendi a sua escolha. Clique numa opção ou peça mais sugestões.",
        mode: "EXPLORATION"
      });
    }

    // 🔹 MODO EXPLORATION
    if (
      session.mode === "EXPLORATION" &&
      intent?.isCooking &&
      (!session.explorationOptions || session.explorationOptions.length === 0)
    ) {
      const exploration = await askChefSmartExploration({
        ingredientsText: content,
        userPreferences: req.user.preferences
      });

      // Guardar alternativas
      session.explorationOptions = exploration.alternatives || [];
      if (exploration.recipe && session.explorationOptions.length === 0) {
        session.explorationOptions.push(exploration.recipe);
      }
      await session.save();

      return res.json({
        chefFeedback: "Aqui estão algumas opções para você escolher:",
        options: session.explorationOptions,
        mode: "EXPLORATION"
      });
    }

    // 🔹 MODO RECIPE_ACTIVE
    if (session.mode === "RECIPE_ACTIVE") {
      const step = session.steps[session.currentStepIndex];

      if (!step) {
        return res.json({
          chefFeedback: "Parabéns! Você concluiu a receita com sucesso 👏",
          mode: "RECIPE_ACTIVE"
        });
      }

      const prompt = buildStepPrompt({
        recipeTitle: session.recipeTitle,
        step: {
          stepNumber: step.stepNumber || session.currentStepIndex + 1,
          totalSteps: session.steps.length,
          objective: step.objective,
          expectedAction: step.expectedAction,
          expectedVisual: step.expectedVisual
        },
        userText: content,
        visionResult: null
      });

      const completion = await askChef({
        message: prompt,
        step,
        recipe: session.recipe.title
      });

      if (completion.status === "VALID") {
        step.validationStatus = "VALID";
        step.completedAt = new Date();
        await session.save();

        return res.json({
          chefFeedback:
            `**Passo concluído com sucesso!**\n\n${completion.reply}\n\n Pode avançar para o próximo passo.`,
          validationStatus: "VALID",
          action: "CAN_ADVANCE",
          mode: "RECIPE_ACTIVE"
        });
      }

      step.validationStatus = "INVALID";
      await session.save();

      return res.json({
        chefFeedback:
          `**Ainda não está correto**\n\n${completion.reply}\n\n Ajuste e tente novamente.`,
        validationStatus: "INVALID",
        action: "FIX_STEP",
        mode: "RECIPE_ACTIVE"
      });
    }

    // 🔹 fallback
    // 🔹 EXPLORATION fallback inteligente
    if (session.mode === "EXPLORATION") {
      const exploration = await askChefSmartExploration({
        ingredientsText: content,
        userPreferences: req.user.preferences
      });

      session.explorationOptions = exploration.alternatives || [];

      if (exploration.recipe && session.explorationOptions.length === 0) {
        session.explorationOptions.push(exploration.recipe);
      }

      await session.save();

      return res.json({
        chefFeedback: "Perfeito! Encontrei estas opções para você:",
        options: session.explorationOptions,
        mode: "EXPLORATION"
      });
    }

  } catch (err) {
    console.error("ERRO sendStepMessage:", err);
    res.status(500).json({ error: "Erro no processamento da mensagem" });
  }
};

// 🔹 3️⃣ Avançar passo
exports.advanceStep = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await RecipeSession.findOne({
      _id: sessionId,
      userId: req.user.id,
      status: "IN_PROGRESS"
    });

    if (!session) {
      return res.status(404).json({ error: "Sessão não encontrada" });
    }

    const currentStep = getCurrentStep(session);
    if (!currentStep || !currentStep.completed) {
      return res.status(400).json({ error: "Passo ainda não validado" });
    }

    session.currentStepIndex += 1;

    if (session.currentStepIndex >= session.steps.length) {
      session.status = "completed";
      session.endTime = new Date();
    }

    await session.save();

    res.json({
      currentStepIndex: session.currentStepIndex,
      status: session.status,
      mode: session.mode
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao avançar passo" });
  }
};
// 🔹 Ativar modo cozinha (botão laranja)
exports.startCooking = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await RecipeSession.findOne({
      _id: sessionId,
      userId: req.user.id,
      status: "IN_PROGRESS"
    });

    if (!session) {
      return res.status(404).json({ error: "Sessão não encontrada" });
    }


    session.cookingConfirmed = true;
    session.mode = "EXPLORATION";
    session.explorationOptions = [];
    session.currentStepIndex = 0;
    session.steps = [];

    await session.save();

    return res.json({
      chefFeedback: "Perfeito! O que vamos cozinhar hoje? Diga os ingredientes ou o prato.",
      mode: "EXPLORATION"
    });
  } catch (err) {
    console.error("ERRO startCooking:", err);
    res.status(500).json({ error: "Erro ao iniciar modo cozinha" });
  }
};

// 🔹 Encerrar receita (botão vermelho)
exports.endRecipe = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await RecipeSession.findOne({
      _id: sessionId,
      userId: req.user.id,
      status: "IN_PROGRESS"
    });

    if (!session) {
      return res.status(404).json({ error: "Sessão não encontrada" });
    }

    session.status = "ABANDONED";
    session.mode = "CHAT";
    session.cookingConfirmed = false;
    session.finishedAt = new Date();

    await session.save();

    return res.json({
      chefFeedback:
        "⛔ Receita encerrada com sucesso. Quando quiser cozinhar novamente, é só clicar em **Iniciar modo cozinha**.",
      mode: "CHAT",
      action: "SESSION_ENDED"
    });
  } catch (err) {
    console.error("ERRO endRecipe:", err);
    res.status(500).json({ error: "Erro ao encerrar receita" });
  }
};
