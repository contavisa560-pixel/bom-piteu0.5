const RecipeSession = require("../models/RecipeSession");
const { callOpenAIImage } = require("./openaiClients");

class CookingSession {
  static async createFromImage(userId, imageBase64, options) {
    const session = await RecipeSession.create({
      userId,
      sourceImage: imageBase64,
      recipeOptions: options,
      status: "OPTIONS",
    });
    return { sessionId: session._id, options: session.recipeOptions };
  }

  static async selectRecipe(sessionId, choice) {
    const session = await RecipeSession.findById(sessionId);
    if (!session || session.status !== "OPTIONS") throw new Error("Sessão inválida");

    const chosenRecipe = session.recipeOptions[choice - 1];
    if (!chosenRecipe) throw new Error("Escolha inválida");

    // IA gera receita dinâmica
    const recipeData = await this.#generateRecipeData(chosenRecipe.title);
    
    session.selectedRecipe = recipeData;
    session.currentStep = 0;
    session.status = "SELECTED";
    await session.save();

    return recipeData;
  }

  static async getNextStep(sessionId) {
    const session = await RecipeSession.findById(sessionId);
    if (!session || !["SELECTED", "IN_PROGRESS"].includes(session.status)) {
      throw new Error(`Estado inválido: ${session?.status || "inexistente"}`);
    }

    const stepIndex = session.currentStep || 0;
    const recipeSteps = session.selectedRecipe?.steps || [];

    if (stepIndex >= recipeSteps.length) {
      session.status = "COMPLETED";
      await session.save();
      return { message: "Receita concluída 🎉" };
    }

    const currentStep = recipeSteps[stepIndex];
    
    // Gera imagem DALL-E única para este passo
    const imageUrl = await callOpenAIImage(
      `Imagem realista cozinhando: ${session.selectedRecipe.title}\nPasso ${currentStep.stepNumber}: ${currentStep.description}`
    );

    session.currentStep = stepIndex + 1;
    session.status = "IN_PROGRESS";
    await session.save();

    return {
      step: {
        stepNumber: currentStep.stepNumber,
        description: currentStep.description,
        imageUrl: imageUrl.url
      },
      progress: `${session.currentStep}/${recipeSteps.length}`
    };
  }

  // Método privado - IA dinâmica
  static async #generateRecipeData(title) {
    // IA REAL aqui (igual ao controller atual)
    const aiResponse = await callOpenAIText(`Gera JSON para: "${title}"...`);
    // parse JSON + fallback como antes
    return parsedRecipeData;
  }
}

module.exports = CookingSession;
