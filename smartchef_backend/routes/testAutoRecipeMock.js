const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const RecipeSession = require("../models/RecipeSession");
const { callOpenAIText, callOpenAIImage } = require("../services/openaiClients");

// =====================
// ROTA DE TESTE FULL FLOW REAL
// =====================
router.get("/full-flow", async (req, res) => {
  try {
    console.log("=== INICIANDO TESTE FULL FLOW REAL ===");

    const recipeTitle = "Gelado de Morango Caseiro";

    // =====================
    // 1️⃣ GERAR IMAGEM BASE DA RECEITA (REAL COM FALLBACK)
    // =====================
    console.log("Gerando imagem base da receita...");

    let sourceImageUrl = null;
    try {
      const imageResult = await callOpenAIImage(
        `Fotografia realista de um ${recipeTitle}, estilo food photography`
      );
      sourceImageUrl = imageResult.url || imageResult.b64_json
        ? `data:image/png;base64,${imageResult.b64_json}`
        : null;
      console.log("Imagem gerada com sucesso:", sourceImageUrl);
    } catch (err) {
      console.warn("Falha ao gerar imagem real. Usando placeholder.", err.message);
      sourceImageUrl = "https://via.placeholder.com/512x512.png?text=Imagem+Teste";
    }

    // =====================
    // 2️⃣ CRIAR SESSÃO NO MONGO
    // =====================
    const session = new RecipeSession({
      userId: new mongoose.Types.ObjectId(),
      sourceImage: sourceImageUrl,
      recipeOptions: [
        {
          title: recipeTitle,
          description: "Receita gerada automaticamente pela IA",
        },
      ],
      status: "OPTIONS",
    });

    await session.save();
    console.log("Sessão criada:", session._id.toString());

    // =====================
    // 3️⃣ SIMULAR SELEÇÃO DE RECEITA
    // =====================
    session.selectedRecipe = {
      title: recipeTitle,
      ingredients: ["Morango", "Natas", "Açúcar"],
      steps: [],
    };
    session.status = "SELECTED";
    await session.save();
    console.log("Receita selecionada:", session.selectedRecipe.title);

    // =====================
    // 4️⃣ GERAR PASSOS REAIS DA RECEITA
    // =====================
    console.log("Gerando passos da receita...");

    for (let i = 0; i < 3; i++) {
      // Gerar texto do passo
      const stepDescription = await callOpenAIText(
        `Crie o passo ${i + 1} da receita "${recipeTitle}" com instruções claras.`
      ).then((r) => r.recipe)
        .catch((err) => {
          console.warn("Erro ao gerar texto real. Usando placeholder.", err.message);
          return `Passo ${i + 1}: Descrição de teste para o passo.`;
        });

      // Gerar imagem do passo
      let stepImageUrl = null;
      try {
        const stepImage = await callOpenAIImage(
          `Fotografia realista do passo ${i + 1} da receita "${recipeTitle}"`
        );
        stepImageUrl = stepImage.url || stepImage.b64_json
          ? `data:image/png;base64,${stepImage.b64_json}`
          : null;
      } catch (err) {
        console.warn("Erro ao gerar imagem do passo. Usando placeholder.", err.message);
        stepImageUrl = "https://via.placeholder.com/512x512.png?text=Imagem+Teste";
      }

      session.selectedRecipe.steps.push({
        stepNumber: i + 1,
        title: `Passo ${i + 1}`,
        description: stepDescription,
        imageUrl: stepImageUrl,
        completed: false,
      });

      session.currentStep = i;
    }

    session.status = "IN_PROGRESS";
    await session.save();
    console.log("Passos gerados e sessão em progresso");

    // =====================
    // 5️⃣ RESPONDER COMO FRONTEND VERIA
    // =====================
    res.json({
      success: true,
      message: "FULL FLOW REAL executado com sucesso",
      sessionId: session._id,
      status: session.status,
      steps: session.selectedRecipe.steps,
      sourceImage: session.sourceImage,
    });
  } catch (err) {
    console.error("❌ ERRO NO FULL FLOW REAL:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
