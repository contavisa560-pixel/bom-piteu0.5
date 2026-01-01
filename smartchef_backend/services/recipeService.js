const RecipeSession = require("../models/RecipeSession");

class RecipeService {
  // Inicia uma nova sessão e invalida a anterior (se existir)
  async startSession(userId, recipeData) {
    // Marcar sessões anteriores como 'abandoned' antes de começar nova
    await RecipeSession.updateMany(
      { userId, status: "active" },
      { status: "abandoned", endTime: new Date() }
    );

    const steps = recipeData.steps.map((step, index) => ({
      stepNumber: index + 1,
      description: step,
      completed: false
    }));

    return await RecipeSession.create({
      userId,
      recipeTitle: recipeData.title,
      steps,
      fullRecipeData: recipeData,
      status: "active"
    });
  }

  // Avança para o próximo passo ou finaliza
  async updateProgress(sessionId, stepIndex) {
    const session = await RecipeSession.findById(sessionId);
    if (!session) throw new Error("Sessão não encontrada");

    session.currentStepIndex = stepIndex;
    
    // Marcar passos anteriores como completados logicamente
    session.steps.forEach((step, idx) => {
      if (idx <= stepIndex) step.completed = true;
    });

    if (stepIndex >= session.steps.length - 1) {
      session.status = "completed";
      session.endTime = new Date();
    }

    return await session.save();
  }

  async getActiveSession(userId) {
    return await RecipeSession.findOne({ userId, status: "active" });
  }
}

module.exports = new RecipeService();