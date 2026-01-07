const express = require("express");
const router = express.Router();

const Recipe = require("../models/Recipe");
const RecipeStep = require("../models/RecipeStep");
const RecipeSession = require("../models/RecipeSession");

// START SESSION
router.post("/start", async (req, res) => {
  try {
    const { userId, recipeId } = req.body;

    if (!userId || !recipeId) {
      return res.status(400).json({ error: "userId e recipeId são obrigatórios" });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe || recipe.status !== "ACTIVE") {
      return res.status(404).json({ error: "Receita não encontrada ou inativa" });
    }

    const steps = await RecipeStep.find({ recipeId }).sort({ stepNumber: 1 });
    if (!steps.length) {
      return res.status(400).json({ error: "Receita sem passos" });
    }

    const sessionSteps = steps.map(step => ({
      stepNumber: step.stepNumber,
      objective: step.objective,
      expectedAction: step.expectedAction,
      expectedVisual: step.expectedVisual,
      warnings: step.warnings || []
    }));

    const session = await RecipeSession.create({
      userId,
      recipeId,
      totalSteps: sessionSteps.length,
      steps: sessionSteps,
      sessionId: "teste-" + uuidv4() 
    });

    const currentStep = session.steps[0];

    res.status(201).json({
      sessionId: session.sessionId, 
      currentStep: session.currentStep,
      totalSteps: session.totalSteps,
      step: currentStep
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao iniciar sessão" });
  }
});

module.exports = router;
