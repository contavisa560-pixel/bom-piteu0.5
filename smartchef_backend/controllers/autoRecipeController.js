const { uploadToCloudflare } = require("../services/storageService");
const RecipeSession = require("../models/RecipeSession");
const { callOpenAIText, callOpenAIImage } = require("../services/openaiClients");

/**
 * 1️⃣ Recebe imagem (multer OU JSON base64) e gera 3 opções de receitas
 */
exports.generateOptions = async (req, res) => {
  try {
    console.log("✅ Request:", { hasFile: !!req.file, hasText: !!req.body.ingredients });

    //  DUAS ENTRADAS: TEXTO OU IMAGEM
    const ingredientsText = req.body.ingredients || null;
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
        console.log(" R2 falhou, usa RAM");
        imageBase64 = `data:image/jpeg;base64,${req.file.buffer.toString('base64')}`;
      }
    }

    let prompt;

    if (ingredientsText && !imageBase64) {
      // 📝 MODO TEXTO PURO
      prompt = `Analisa ESTES ingredientes: "${ingredientsText}" e gera EXATAMENTE 3 receitas reais.
      
      FORMATO:
      1. Receita 1 - descrição curta
      2. Receita 2 - descrição curta  
      3. Receita 3 - descrição curta`;

    } else if (imageBase64) {
      // 👁️ MODO VISION (imagem)
      prompt = `Analisa ESTA imagem de ingredientes e gera EXATAMENTE 3 receitas reais.
      
      FORMATO:
      1. Receita 1 - descrição curta
      2. Receita 2 - descrição curta
      3. Receita 3 - descrição curta`;

    } else {
      return res.status(400).json({ error: "Envie texto (ingredients) OU imagem" });
    }

    // ✨ callOpenAIText() funciona AMBOS (texto/vision keys)
    const aiResponse = await callOpenAIText(prompt, imageBase64);

    let options = aiResponse.options || [];

    // SALVA MONGODB (igual)
    const session = await RecipeSession.create({
      userId: req.user._id,
      sourceImage: imageUrl || req.file?.filename || 'text-only',
      sourceImageUrl: imageUrl,
      sourceText: ingredientsText || null,  // ← NOVO
      recipeOptions: options,
      status: "OPTIONS",
    });

    console.log("✅ OPÇÕES SALVAS:", options.map(o => o.title));
    res.json({
      sessionId: session._id,
      options,
      mode: ingredientsText ? 'text' : 'image'  // ← DEBUG
    });

  } catch (err) {
    console.error("❌ ERRO:", err.message);
    res.status(500).json({ error: "Erro ao gerar opções", details: err.message });
  }
};


/**
 * 2️⃣ IA GERA RECEITA 100% DINÂMICA por imagem/receita escolhida
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

    //  IMAGEM DO PRATO FINAL 
    const finalImagePrompt = ` Gera uma imagem gastronómica profissional ultra-realista de uma receita [ O nome da receita ], "${chosenRecipe.title}"
texturas extremamente detalhadas, iluminação perfeita e cinematográfica, profundidade de campo rasa (fundo desfocado), cores vibrantes e naturais, vapor realista subindo do alimento, superfícies brilhantes e suculentas, composição cinematográfica, resolução 8K, empratamento meticulosamente estilizado, qualidade de câmara DSLR profissional, foco ultra-nítido no prato, atmosfera quente, sombras suaves e reflexos realistas, fundo suavemente desfocado, estilo editorial de revista gastronómica,sem textos, sem pessoas , sem marcas. `;

    const finalImageUrl = await callOpenAIImage(chosenRecipe.title);
    console.log("✅ PRATO FINAL:", finalImageUrl?.slice(0, 50));

    // Receita como ANTES 
    const prompt = `Gera JSON válido EXATO para receita: "${chosenRecipe.title}"

FORMATO OBRIGATÓRIO SEMPRE:
{
  "title": "${chosenRecipe.title}",
  "time": "X horas ou X minutos", 
  "ingredients": ["ingrediente 1", "ingrediente 2"],
  "steps": [
    {"stepNumber":1,"description":"Passo 1"},
    {"stepNumber":2,"description":"Passo 2"}
  ]
}`;

    const aiResponse = await callOpenAIText(prompt);
    //  LIMPA markdown antes de parsear
    let cleanResponse = aiResponse.raw
      .replace(/```json|```/g, '')  // remove ```json e ```
      .replace(/```|```\n/g, '')     // remove outros ```
      .trim();

    let recipeData;
    try {
      recipeData = JSON.parse(cleanResponse);
    } catch (e) {
      console.log("⚠️ JSON falhou, usando fallback...");
      recipeData = {
        title: chosenRecipe.title,
        time: aiResponse.raw.match(/(\d+[\s\.]*(?:min|minutes?|h|hours?))/i)?.[1] || "30 min",
        ingredients: ["ingredientes da foto"],
        steps: [{ stepNumber: 1, description: `Preparar ${chosenRecipe.title}` }]
      };
    }


    // SALVA COM IMAGEM FINAL
    session.selectedRecipe = recipeData;
    session.recipeFinalImage = finalImageUrl;  // ← NOVA!
    session.currentStep = 0;
    session.status = "SELECTED";
    await session.save();

    res.json({
      recipe: recipeData,
      finalImage: finalImageUrl  // ← RETORNA!
    });

  } catch (err) {
    console.error("selectRecipe ERROR:", err);
    res.status(500).json({ error: "Erro ao selecionar", details: err.message });
  }
};


/**
 * 3️⃣ Gera passo + imagem
 */
exports.generateStep = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await RecipeSession.findById(sessionId).populate('userId');

    console.log("🔍 Session status:", session?.status, "currentStep:", session?.currentStep);

    if (!session) {
      return res.status(404).json({ error: "Sessão não encontrada" });
    }

    // ✅ CORREÇÃO: aceita SELECTED ou IN_PROGRESS
    if (session.status !== "SELECTED" && session.status !== "IN_PROGRESS") {
      console.log("❌ Status inválido:", session.status);
      return res.status(400).json({ error: `Estado inválido: ${session.status}` });
    }

    const stepIndex = session.currentStep || 0;
    const recipeSteps = session.selectedRecipe?.steps || [];

    console.log(`🔍 Gerando passo ${stepIndex + 1}/${recipeSteps.length}`);

    if ((stepIndex || 0) >= (recipeSteps.length || 0)) {
      session.status = "COMPLETED";
      await session.save();
      return res.json({ message: "Receita concluída 🎉" });
    }

    const currentStep = recipeSteps[stepIndex];
    console.log("✅ Passo atual:", currentStep.description.slice(0, 50));

    // ✅ IMAGEM DALL-E REAL
    const imagePrompt = `Imagem realista cozinhando: ${session.selectedRecipe.title}
Passo ${currentStep.stepNumber}: ${currentStep.description.slice(0, 100)}
Cozinha caseira, sem pessoas, luz natural, simples, apetitoso`;

    const image = await callOpenAIImage(imagePrompt);
    console.log("✅ Imagem DALL-E:", image.url.slice(0, 50));

    // ✅ Avança passo
    session.currentStep = stepIndex + 1;
    session.status = "IN_PROGRESS";
    await session.save();

    res.json({
      step: {
        stepNumber: currentStep.stepNumber,
        description: currentStep.description,
        imageUrl: image.url
      },
      next: "Diz 'vamos' para próximo passo",
      progress: `${session.currentStep}/${recipeSteps.length}`
    });

  } catch (err) {
    console.error("generateStep ERROR:", err);
    res.status(500).json({ error: "Erro ao gerar passo", details: err.message });
  }
};

