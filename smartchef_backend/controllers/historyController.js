// controllers/historyController.js
// ─────────────────────────────────────────────────────────────
// IMPORTANTE: usa RecipeSession como fonte de histórico.
// NÃO existe ChatSession neste projecto.
// ─────────────────────────────────────────────────────────────
const mongoose    = require("mongoose");
const RecipeSession = require("../models/RecipeSession");

// ─────────────────────────────────────────────────────────────
// HELPER – converte RecipeSession no formato esperado pelo frontend
// ─────────────────────────────────────────────────────────────
function formatSession(session) {
  if (!session) return null;

  const s = session.toObject ? session.toObject() : { ...session };

  // O frontend usa `sessionId` (string) para identificar sessões.
  // Aqui o _id do Mongo é o ID real.
  return {
    sessionId:    String(s._id),
    _id:          String(s._id),
    title:        s.selectedRecipe?.title
                    || s.sourceText?.replace(/^Desejo:\s*/, '')
                    || "Receita sem título",
    status:       s.status || "OPTIONS",
    category:     s.category || "general",
    lastActivity: s.updatedAt || s.createdAt,
    createdAt:    s.createdAt,

    // chatState: o que o frontend precisa para restaurar
    chatState: {
      recipe: s.selectedRecipe
        ? {
            title:       s.selectedRecipe.title,
            ingredients: s.selectedRecipe.ingredients || [],
            steps:       s.selectedRecipe.steps       || [],
            time:        s.selectedRecipe.time,
            difficulty:  s.selectedRecipe.difficulty,
            finalImage:  s.recipeFinalImage || null
          }
        : null,
      options:     s.recipeOptions || [],
      sessionId:   String(s._id),
      // currentStep: índice do PRÓXIMO passo a gerar (0 = não iniciou)
      currentStepIndex: typeof s.currentStep === "number" ? s.currentStep : 0,
      currentStep: (() => {
        // Devolve o último passo já feito (para o header mostrar "Passo X/Y")
        const idx   = typeof s.currentStep === "number" ? s.currentStep : 0;
        const steps = s.selectedRecipe?.steps || [];
        if (idx > 0 && steps[idx - 1]) {
          const raw = steps[idx - 1];
          return {
            stepNumber:  idx,
            description: typeof raw === "string" ? raw : (raw.description || raw.text || ""),
            imageUrl:    raw.imageUrl || null
          };
        }
        return null;
      })()
    },

    // Reconstrói as mensagens a partir dos dados da sessão
    messages: buildMessages(s),

    // Metadados para o card do histórico
    statistics: {
      messageCount:     estimateMessageCount(s),
      recipeSteps:      s.selectedRecipe?.steps?.length || 0,
      completedRecipes: s.status === "COMPLETED" ? 1 : 0
    },

    // Imagem de thumbnail
    thumbnailUrl: s.recipeFinalImage || s.sourceImageUrl || null
  };
}

// Constrói um array de mensagens representativas da sessão
function buildMessages(s) {
  const msgs = [];
  const sessionId = String(s._id);

  // 1. Mensagem de origem (texto digitado ou foto enviada)
  if (s.sourceText) {
    const pratoMatch = s.sourceText.match(/Desejo:\s*(.+?)(?:\s*\|.*)?$/);
    msgs.push({
      id:        `src_${sessionId}`,
      type:      "user",
      content:   pratoMatch ? pratoMatch[1] : s.sourceText,
      timestamp: s.createdAt
    });
  }

  // 2. Opções apresentadas
  if (s.recipeOptions && s.recipeOptions.length > 0) {
    msgs.push({
      id:        `opts_${sessionId}`,
      type:      "bot",
      content:   "Aqui estão as opções de receita:",
      options:   s.recipeOptions,
      timestamp: s.createdAt
    });
  }

  // 3. Receita seleccionada
  if (s.selectedRecipe) {
    const steps      = s.selectedRecipe.steps || [];
    const totalSteps = steps.length;
    // currentStep é o índice do PRÓXIMO passo a gerar (0-based).
    // Se for 0 ainda não iniciou passo a passo; se for > 0 já fez alguns passos.
    const currentStepIndex = typeof s.currentStep === "number" ? s.currentStep : 0;
    const stepsAlreadyDone = currentStepIndex; // quantos passos já foram mostrados

    // 3a. Receita criada (sempre aparece)
    const isInProgress = ["IN_PROGRESS"].includes(s.status);
    const isCompleted  = s.status === "COMPLETED";
    const wasStarted   = isInProgress && stepsAlreadyDone > 0;

    msgs.push({
      id:                    `recipe_${sessionId}`,
      type:                  "receita_criada",
      content:               `Receita "${s.selectedRecipe.title}" criada!`,
      receita: {
        title:       s.selectedRecipe.title,
        ingredients: s.selectedRecipe.ingredients || [],
        steps:       steps,
        time:        s.selectedRecipe.time,
        difficulty:  s.selectedRecipe.difficulty
      },
      finalImage:             s.recipeFinalImage || null,
      // Só mostra botão "COMEÇAR" se ainda não iniciou os passos E não está concluída
      podeIniciarPassoAPasso: !isCompleted && (s.status === "SELECTED" || (isInProgress && stepsAlreadyDone === 0)),
      mensagemInicio:         "Quer começar o passo a passo?",
      sessionId:              sessionId,
      totalPassos:            totalSteps,
      timestamp:              s.createdAt
    });

    // 3b. Reconstrói os passos já concluídos
    // Para COMPLETED: mostra TODOS os passos (a sessão acabou, stepsAlreadyDone pode ser 0)
    // Para IN_PROGRESS: mostra só os passos já feitos
    const stepsToShow = isCompleted ? steps.length : stepsAlreadyDone;

    if ((wasStarted || isCompleted) && steps.length > 0) {
      for (let i = 0; i < stepsToShow && i < steps.length; i++) {
        const step = steps[i];
        const stepNum = i + 1;
        const isLastDone = (i === stepsToShow - 1);

        msgs.push({
          id:         `step_${sessionId}_${stepNum}`,
          type:       "cooking-step",
          content:    `Passo ${stepNum}`,
          step: {
            stepNumber:  stepNum,
            description: typeof step === "string" ? step : (step.description || step.text || step),
            imageUrl:    step.imageUrl || null
          },
          progress:   `${stepNum}/${totalSteps}`,
          totalSteps: totalSteps,
          timestamp:  s.updatedAt || s.createdAt,
          // No último passo já feito, mostra botão "Próximo passo" / "Continuar"
          isLastRestored: isLastDone
        });
      }

      // 3c. Mensagem de resumo/retoma — botão para continuar do passo seguinte
      if (stepsAlreadyDone < totalSteps) {
        msgs.push({
          id:                    `resume_${sessionId}`,
          type:                  "receita_criada",
          content:               `Continuar a partir do passo ${stepsAlreadyDone + 1}`,
          receita:               null,
          podeIniciarPassoAPasso: true,
          mensagemInicio:        `Continuar do passo ${stepsAlreadyDone + 1} de ${totalSteps}`,
          sessionId:             sessionId,
          totalPassos:           totalSteps,
          isResume:              true,
          currentStepIndex:      stepsAlreadyDone,
          timestamp:             s.updatedAt || s.createdAt
        });
      }
    }
  }

  // 4. Receita concluída
  if (s.status === "COMPLETED") {
    msgs.push({
      id:           `done_${sessionId}`,
      type:         "recipe-completed",
      content:      "RECEITA CONCLUÍDA!",
      recipeTitle:  s.selectedRecipe?.title || "Receita",
      finalImage:   s.recipeFinalImage || null,
      cookingTime:  s.selectedRecipe?.time || "–",
      difficulty:   s.selectedRecipe?.difficulty || "–",
      showConfetti: false,
      showRating:   true,
      showShare:    true,
      showFavorite: true,
      showDownload: true,
      timestamp:    s.completedAt || s.updatedAt
    });
  }

  return msgs;
}

function estimateMessageCount(s) {
  let count = 0;
  if (s.sourceText)                           count += 1;
  if (s.recipeOptions?.length)                count += 2;
  if (s.selectedRecipe)                       count += 1;
  if (s.selectedRecipe?.steps?.length)        count += s.selectedRecipe.steps.length * 2;
  if (s.status === "COMPLETED")               count += 1;
  if (s.stepQuestions?.length)                count += s.stepQuestions.length * 2;
  return count;
}

// ─────────────────────────────────────────────────────────────
// GET /api/history/sessions
// ─────────────────────────────────────────────────────────────
exports.getUserHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, search, status } = req.query;

    console.log(`🔍 Buscando histórico para usuário ${userId}, página ${page}`);

    const userIdObj = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const query = { userId: userIdObj };

    // Filtro por status
    if (status && ["OPTIONS","SELECTED","IN_PROGRESS","COMPLETED"].includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }

    // Filtro por pesquisa (título da receita ou sourceText)
    if (search) {
      query.$or = [
        { "selectedRecipe.title": { $regex: search, $options: "i" } },
        { sourceText:             { $regex: search, $options: "i" } }
      ];
    }

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await RecipeSession.countDocuments(query);

    const sessions = await RecipeSession
      .find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    console.log(`✅ Histórico encontrado: ${sessions.length} sessões`);

    res.json({
      sessions: sessions.map(formatSession),
      pagination: {
        page:  parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("❌ Erro ao buscar histórico:", error);
    res.status(500).json({
      error:      "Erro ao buscar histórico",
      sessions:   [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 }
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/history/sessions/:sessionId
// ─────────────────────────────────────────────────────────────
exports.getSessionDetail = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    console.log(`🔍 Buscando detalhes da sessão ${sessionId}`);

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: "ID de sessão inválido" });
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);
    const session   = await RecipeSession.findOne({
      _id:    new mongoose.Types.ObjectId(sessionId),
      userId: userIdObj
    });

    if (!session) {
      return res.status(404).json({ error: "Sessão não encontrada" });
    }

    const formatted = formatSession(session);
    console.log(`✅ Sessão encontrada: "${formatted.title}" com ${formatted.messages.length} mensagens`);
    res.json(formatted);

  } catch (error) {
    console.error("❌ Erro ao buscar detalhes:", error);
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/history/sessions/:sessionId
// ─────────────────────────────────────────────────────────────
exports.deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const result = await RecipeSession.deleteOne({
      _id:    new mongoose.Types.ObjectId(sessionId),
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Sessão não encontrada" });
    }

    res.json({ success: true, message: "Sessão eliminada com sucesso" });
  } catch (error) {
    console.error("❌ Erro ao eliminar sessão:", error);
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/history/statistics
// ─────────────────────────────────────────────────────────────
exports.getStatistics = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(`📊 Buscando estatísticas do usuário ${userId}`);

    const userIdObj = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const [total, completed, inProgress] = await Promise.all([
      RecipeSession.countDocuments({ userId: userIdObj }),
      RecipeSession.countDocuments({ userId: userIdObj, status: "COMPLETED" }),
      RecipeSession.countDocuments({ userId: userIdObj, status: "IN_PROGRESS" })
    ]);

    // Soma de passos de todas as receitas completadas
    const completedSessions = await RecipeSession
      .find({ userId: userIdObj, status: "COMPLETED" })
      .select("selectedRecipe.steps stepQuestions")
      .lean();

    const totalSteps = completedSessions.reduce(
      (acc, s) => acc + (s.selectedRecipe?.steps?.length || 0), 0
    );

    res.json({
      totalSessions:    total,
      totalMessages:    total * 4,   // estimativa
      totalImages:      totalSteps,  // cada passo tem imagem
      completedRecipes: completed,
      inProgress:       inProgress,
      avgDuration:      0
    });
  } catch (error) {
    console.error("❌ Erro ao buscar estatísticas:", error);
    res.status(500).json({
      totalSessions: 0, totalMessages: 0,
      totalImages: 0,   completedRecipes: 0, avgDuration: 0
    });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/history/save  – mantido por compatibilidade mas é
// NOP: as sessões já são guardadas pelo autoRecipeController.
// ─────────────────────────────────────────────────────────────
exports.saveSession = async (req, res) => {
  // O ChatBot.jsx chama este endpoint automaticamente.
  // Como o autoRecipeController já guarda tudo em RecipeSession,
  // aqui apenas confirmamos sucesso sem duplicar dados.
  res.json({
    success:   true,
    sessionId: req.body?.sessionId || null,
    message:   "Sessão gerida pelo autoRecipeController"
  });
};

// Alias de compatibilidade
exports.quickSave = exports.saveSession;