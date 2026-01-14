const { uploadToCloudflare } = require("../services/storageService");
const RecipeSession = require("../models/RecipeSession");
const { callOpenAIText, callOpenAIImage } = require("../services/openaiClients");
const History = require("../models/History");
const {
  visionOptionsPrompt,
  stepImagePrompt,
  finalDishImagePrompt,
  recipePrompt
} = require("../services/chefPrompt");

const translateStepToEnglish = async (text) => {
  try {
    const res = await fetch(`${process.env.BASE_URL || 'http://localhost:5000'}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage: 'en' })
    });
    const data = await res.json();
    return data.translatedText || text;
  } catch (err) {
    console.log('Translation failed, using original:', text);
    return text;
  }
};

/**
 * 1️⃣ Recebe imagem e gera 3 opções REAIS baseadas na imagem
 */
exports.generateOptions = async (req, res) => {
  try {
    console.log("✅ Request:", {
      hasFile: !!req.file,
      hasText: !!req.body.ingredients,
      category: req.body.category || 'general'
    });

    const ingredientsText = req.body.ingredients || null;
    const category = req.body.category || 'general';
    let imageBase64 = null;
    let imageUrl = null;

    if (req.file) {
      try {
        imageUrl = await uploadToCloudflare(
          req.file.buffer,
          req.file.originalname,
          'recipe-photos'
        );
        console.log("CLOUDFLARE R2:", imageUrl);
        imageBase64 = `data:image/jpeg;base64,${req.file.buffer.toString('base64')}`;
      } catch (r2Err) {
        console.log(" R2 falhou, usando base64");
        imageBase64 = `data:image/jpeg;base64,${req.file.buffer.toString('base64')}`;
      }
    }

    let prompt;
    let systemMessage;

    if (ingredientsText && !imageBase64) {
      // 📝 MODO TEXTO
      systemMessage = "Você é um chef angolano profissional com 20 anos de experiência.";
      prompt = `Analise ESTES ingredientes: "${ingredientsText}" 

Categoria solicitada: ${category}

Gere EXATAMENTE 3 receitas AUTÊNTICAS usando principalmente esses ingredientes.

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON):
{
  "ingredientsIdentified": ["lista de ingredientes do texto"],
  "options": [
    {
      "title": "Nome ESPECÍFICO e DESCRITIVO",
      "description": "Breve descrição que explica o prato",
      "ingredients": ["ingredientes principais"],
      "difficulty": "Fácil/Média/Difícil",
      "time": "XX min",
      "category": "${category}"
    }
  ]
}

NUNCA USE receitas genéricas como "Omelete Simples" ou "Arroz com Legumes".`;

    } else if (imageBase64) {
      // 👁️ MODO VISION - IMAGEM
      systemMessage = "Você é um especialista em análise visual de alimentos com conhecimento culinário profundo.";
      prompt = visionOptionsPrompt(imageUrl, category);

    } else {
      return res.status(400).json({ error: "Envie texto (ingredients) OU imagem" });
    }

    // Chamada à API com system message
    const aiResponse = await callOpenAIText(prompt, imageBase64, systemMessage);

    let options = [];
    let ingredientsIdentified = [];

    try {
      // Tenta extrair JSON da resposta
      const jsonMatch = aiResponse.raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        options = parsed.options || [];
        ingredientsIdentified = parsed.ingredientsIdentified || [];
      } else {
        // Fallback: parse manual
        const lines = aiResponse.raw.split('\n').filter(l => l.trim());
        options = lines
          .filter(l => /^\d+\./.test(l) || /^[•\-]/.test(l))
          .slice(0, 3)
          .map((line, i) => ({
            title: line.replace(/^\d+\.\s*|^[•\-]\s*/, '').trim(),
            description: `Receita usando ${ingredientsText || 'os ingredientes da imagem'}`,
            ingredients: ingredientsIdentified,
            difficulty: "Média",
            time: "30-45 min",
            category: category
          }));
      }
    } catch (parseErr) {
      console.log("❌ Parse error, usando fallback");
      options = [
        { title: "Receita Especial 1", description: "Baseada nos ingredientes fornecidos", difficulty: "Média", time: "30 min" },
        { title: "Receita Especial 2", description: "Preparação tradicional", difficulty: "Média", time: "45 min" },
        { title: "Receita Especial 3", description: "Opção criativa", difficulty: "Fácil", time: "25 min" }
      ];
    }

    // SALVA SESSÃO
    const session = await RecipeSession.create({
      userId: req.user._id,
      sourceImage: imageUrl || req.file?.filename || 'text-only',
      sourceImageUrl: imageUrl,
      sourceText: ingredientsText,
      recipeOptions: options,
      identifiedIngredients: ingredientsIdentified,
      category: category,
      status: "OPTIONS",
    });

    console.log("✅ OPÇÕES SALVAS:", options.map(o => o.title));
    res.json({
      sessionId: session._id,
      options,
      ingredientsIdentified,
      mode: ingredientsText ? 'text' : 'image'
    });

  } catch (err) {
    console.error("❌ ERRO generateOptions:", err.message);
    res.status(500).json({ error: "Erro ao gerar opções", details: err.message });
  }
};

/**
 * 2️⃣ Seleciona receita e gera receita completa
 */
exports.selectRecipe = async (req, res) => {
  try {
    const { sessionId, choice } = req.body;
    const session = await RecipeSession.findById(sessionId);

    if (!session || session.status !== "OPTIONS") {
      return res.status(400).json({ error: "Sessão inválida" });
    }

    const chosenRecipe = session.recipeOptions[choice - 1];
    console.log(" Escolheu:", chosenRecipe.title);

    // IMAGEM DO PRATO FINAL - ULTRA REALISTA
    let finalImageUrl = null;
    try {
      const imagePrompt = finalDishImagePrompt(
        chosenRecipe.title,
        chosenRecipe.description || "Prato tradicional bem apresentado"
      );

      console.log(" Gerando imagem final ultra-realista...");
      finalImageUrl = await callOpenAIImage(
        "", // Prompt vazio, será construído na função
        chosenRecipe.title,
        chosenRecipe.description || "Prato final bem apresentado",
        true // isFinalDish = true
      );

      if (finalImageUrl) {
        console.log("PRATO FINAL gerado:", finalImageUrl.slice(0, 80));
        session.recipeFinalImage = finalImageUrl;
      }
    } catch (imgErr) {
      console.log("❌ Falha imagem final, usando fallback:", imgErr.message);
      finalImageUrl = getFallbackFinalImage(chosenRecipe.title);
      session.recipeFinalImage = finalImageUrl;
    }

    // GERA RECEITA COMPLETA
    const prompt = recipePrompt(
      chosenRecipe.title,
      session.identifiedIngredients || []
    );

    const aiResponse = await callOpenAIText(prompt, null, "Você é um chef profissional especializado em receitas detalhadas.");

    let recipeData;
    try {
      const jsonMatch = aiResponse.raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recipeData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (e) {
      console.log("⚠️ JSON falhou, construindo manualmente...");
      recipeData = buildRecipeFallback(chosenRecipe, session.identifiedIngredients || []);
    }

    // VALIDA E COMPLETA A RECEITA
    recipeData = validateAndCompleteRecipe(recipeData, chosenRecipe.title);

    // SALVA RECEITA SELECIONADA
    session.selectedRecipe = recipeData;
    session.currentStep = 0;
    session.status = "SELECTED";
    await session.save();

    res.json({
      recipe: recipeData,
      finalImage: finalImageUrl
    });

  } catch (err) {
    console.error("❌ selectRecipe ERROR:", err);
    res.status(500).json({ error: "Erro ao selecionar receita", details: err.message });
  }
};

/**
 * 3️⃣ Gera passo + imagem ESPECÍFICA do passo
 */
exports.generateStep = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await RecipeSession.findById(sessionId).populate("userId");

    if (!session) {
      return res.status(404).json({ error: "Sessão não encontrada" });
    }

    const steps = session.selectedRecipe?.steps || [];
    const totalSteps = steps.length;
    const stepIndex = session.currentStep || 0;

    console.log("🔍 STEP REQUEST", {
      recipe: session.selectedRecipe?.title,
      stepIndex,
      totalSteps,
      status: session.status
    });

    // VERIFICAÇÕES
    if (session.status === "COMPLETED") {
      return res.json({
        message: "Receita concluída!",
        status: "COMPLETED",
        finalImage: session.recipeFinalImage,
        recipeTitle: session.selectedRecipe?.title
      });
    }

    if (!["SELECTED", "IN_PROGRESS"].includes(session.status)) {
      return res.status(400).json({
        error: `Estado inválido: ${session.status}`
      });
    }

    // FINALIZA SE NÃO HÁ MAIS PASSOS
    if (stepIndex >= totalSteps) {
      await finalizeSession(session);
      return res.json({
        message: "Receita concluída!",
        status: "COMPLETED",
        finalImage: session.recipeFinalImage,
        recipeTitle: session.selectedRecipe?.title
      });
    }

    const currentStep = steps[stepIndex];
    console.log("👨‍🍳 PASSO ATUAL:", currentStep.description);

    // TEXTO EXPLICATIVO DO PASSO
    const stepPrompt = `
CHEF'S STEP-BY-STEP GUIDANCE

RECIPE: "${session.selectedRecipe.title}"
CURRENT STEP: ${stepIndex + 1} de ${totalSteps}
STEP DESCRIPTION: "${currentStep.description}"
INGREDIENTS: ${session.selectedRecipe.ingredients.join(', ')}

INSTRUCTIONS:
Explain this cooking step in DETAILED but SIMPLE terms.
Assume the user is a beginner home cook.
Include:
1. What to do EXACTLY
2. What to look for (visual cues)
3. Common mistakes to avoid
4. Safety tips if applicable

RESPONSE LANGUAGE: Portuguese (Angolan)
FORMAT: Clear, friendly, instructional tone
LENGTH: 3-4 sentences maximum
`;

    const stepTextResponse = await callOpenAIText(
      stepPrompt,
      null,
      "Você é um chef paciente que explica técnicas culinárias para iniciantes."
    );

    const stepText = stepTextResponse.raw;

    // IMAGEM ESPECÍFICA DO PASSO - ULTRA REALISTA
    let stepImageUrl = null;
    try {
      // Traduz para inglês para melhor qualidade de imagem
      const recipeTitleEN = await translateToEnglish(session.selectedRecipe.title);
      const stepDescriptionEN = await translateToEnglish(currentStep.description);

      // Gera prompt específico para este passo
      const imagePrompt = stepImagePrompt(
        recipeTitleEN,
        stepIndex + 1,
        stepDescriptionEN,
        totalSteps,
        session.selectedRecipe.ingredients.slice(0, 5) // Primeiros 5 ingredientes
      );

      console.log("🖼️ Gerando imagem específica do passo...");
      stepImageUrl = await callOpenAIImage(
        "", // Prompt vazio
        recipeTitleEN,
        stepDescriptionEN,
        false // isFinalDish = false
      );

      if (!stepImageUrl) {
        throw new Error("No image URL returned");
      }

      console.log("✅ Imagem do passo gerada:", stepImageUrl.slice(0, 80));

    } catch (imgErr) {
      console.log("❌ Falha na imagem do passo, usando fallback:", imgErr.message);
      stepImageUrl = getStepSpecificFallbackImage(
        session.selectedRecipe.title,
        currentStep.description,
        stepIndex + 1,
        totalSteps
      );
    }

    // AVANÇA O PASSO
    session.currentStep = stepIndex + 1;

    // VERIFICA SE É O ÚLTIMO PASSO
    if (session.currentStep >= totalSteps) {
      await finalizeSession(session);
    } else {
      session.status = "IN_PROGRESS";
      await session.save();
    }

    // RETORNA RESPOSTA
    res.json({
      step: {
        stepNumber: currentStep.stepNumber || stepIndex + 1,
        description: stepText,
        imageUrl: stepImageUrl,
      },
      progress: `${session.currentStep}/${totalSteps}`,
      status: session.status,
      recipeTitle: session.selectedRecipe?.title
    });

  } catch (err) {
    console.error("❌ generateStep ERROR:", err);
    res.status(500).json({
      error: "Erro ao gerar passo",
      details: err.message
    });
  }
};

// ==================== FUNÇÕES AUXILIARES ====================

async function finalizeSession(session) {
  session.status = "COMPLETED";
  session.completedAt = new Date();
  await session.save();

  await History.create({
    user: session.userId._id || session.userId,
    type: "recipe",
    prompt: `Receita "${session.selectedRecipe.title}" concluída.`,
    response: session.selectedRecipe,
  });

  console.log("🎉 Receita finalizada:", session.selectedRecipe.title);
}

async function translateToEnglish(text) {
  try {
    if (!text || text.length < 2) return text;

    const res = await fetch(`${process.env.BASE_URL || 'http://localhost:5000'}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage: 'en' })
    });

    if (res.ok) {
      const data = await res.json();
      return data.translatedText || text;
    }
    return text;
  } catch (err) {
    console.log('Translation skipped:', err.message);
    return text;
  }
}

function getFallbackFinalImage(recipeTitle) {
  // Fallback baseado no tipo de receita
  const recipeLower = recipeTitle.toLowerCase();

  if (recipeLower.includes('moamba') || recipeLower.includes('muamba')) {
    return "https://images.unsplash.com/photo-1563379091339-03246963d9d6?auto=format&fit=crop&w=1024&q=80";
  } else if (recipeLower.includes('calulu')) {
    return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1024&q=80";
  } else if (recipeLower.includes('mufete')) {
    return "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1024&q=80";
  } else if (recipeLower.includes('peixe') || recipeLower.includes('fish')) {
    return "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1024&q=80";
  } else if (recipeLower.includes('frango') || recipeLower.includes('chicken')) {
    return "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1024&q=80";
  } else {
    return "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=1024&q=80";
  }
}

function getStepSpecificFallbackImage(recipeTitle, stepDescription, stepNumber, totalSteps) {
  const stepLower = stepDescription.toLowerCase();

  // Mapeamento mais específico para ações de cozinha
  const actionMap = {
    // Ações de corte
    'cortar|picar|fatiar|descascar|triturar|ralar': "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1024&q=80",

    // Ações de cocção
    'refogar|fritar|saltear|sauté|dourar': "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1024&q=80",

    // Ações de mistura
    'misturar|mexer|bater|amassar|incorporar': "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1024&q=80",

    // Ações de cozimento
    'cozinhar|ferver|assar|grelhar|forno|cozer': "https://images.unsplash.com/photo-1556909114-b6f4a5d5a1e6?auto=format&fit=crop&w=1024&q=80",

    // Ações de preparação
    'temperar|salgar|adicionar|colocar|verter|medir': "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1024&q=80"
  };

  for (const [pattern, url] of Object.entries(actionMap)) {
    if (new RegExp(pattern).test(stepLower)) {
      return url;
    }
  }

  // Fallback genérico baseado no número do passo
  if (stepNumber === totalSteps) {
    return getFallbackFinalImage(recipeTitle);
  } else {
    return "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1024&q=80";
  }
}

function buildRecipeFallback(chosenRecipe, identifiedIngredients) {
  return {
    title: chosenRecipe.title,
    time: chosenRecipe.time || "45 min",
    difficulty: chosenRecipe.difficulty || "Média",
    ingredients: identifiedIngredients.length > 0
      ? identifiedIngredients.map(ing => `300g de ${ing}`).slice(0, 8)
      : ["500g de ingrediente principal", "2 cebolas", "3 dentes de alho", "Sal e pimenta a gosto"],
    steps: [
      { stepNumber: 1, description: "Prepare todos os ingredientes", time: "10 min" },
      { stepNumber: 2, description: "Aqueça o óleo em uma panela", time: "5 min" },
      { stepNumber: 3, description: "Refogue a cebola e o alho", time: "5 min" },
      { stepNumber: 4, description: "Adicione o ingrediente principal", time: "10 min" },
      { stepNumber: 5, description: "Cozinhe até ficar pronto", time: "15 min" },
      { stepNumber: 6, description: "Tempere a gosto e sirva", time: "5 min" }
    ],
    tips: ["Use ingredientes frescos para melhor sabor", "Ajuste o tempero conforme seu gosto"]
  };
}

function validateAndCompleteRecipe(recipeData, recipeTitle) {
  // Garante que a receita tenha estrutura mínima
  if (!recipeData.title) recipeData.title = recipeTitle;
  if (!recipeData.time) recipeData.time = "45 min";
  if (!recipeData.difficulty) recipeData.difficulty = "Média";

  if (!recipeData.ingredients || !Array.isArray(recipeData.ingredients)) {
    recipeData.ingredients = ["500g de ingrediente principal", "Sal e pimenta a gosto"];
  }

  if (!recipeData.steps || !Array.isArray(recipeData.steps) || recipeData.steps.length === 0) {
    recipeData.steps = [
      { stepNumber: 1, description: "Prepare todos os ingredientes" },
      { stepNumber: 2, description: "Siga as instruções básicas de preparo" },
      { stepNumber: 3, description: "Cozinhe conforme necessário" },
      { stepNumber: 4, description: "Finalize e sirva" }
    ];
  }

  // Numera os passos corretamente
  recipeData.steps = recipeData.steps.map((step, index) => ({
    stepNumber: step.stepNumber || index + 1,
    description: step.description || `Passo ${index + 1}`,
    time: step.time || null
  }));

  if (!recipeData.tips) {
    recipeData.tips = ["Aproveite a sua refeição!"];
  }

  return recipeData;
}