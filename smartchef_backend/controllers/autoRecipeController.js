const { uploadToCloudflare } = require("../services/storageService");
const RecipeSession = require("../models/RecipeSession");
const { callOpenAIText, callOpenAIImage } = require("../services/openaiClients");
const History = require("../models/History");

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
    const finalImagePrompt = `Generate an image of the final dish: "${chosenRecipe.title}"

HUMAN REALITY:
Generate an ultra-realistic professional food photograph of the recipe [Recipe Name], extremely detailed textures, perfect cinematic lighting, shallow depth of field (blurred background), vibrant and natural colors, realistic steam rising from the food, glossy and juicy surfaces, cinematic composition, 8K resolution, meticulously styled plating, professional DSLR camera quality, ultra-sharp focus on the dish, warm atmosphere, soft shadows and realistic reflections, softly blurred background, editorial magazine-style food photography.

NEVER: digital art, 3D render, AI art, cartoon, CGI, plastic perfection

1024x1024, no people, no logos, only a minimalistic text in the top right corner of the image saying: Bom Piteu! Small, sophisticated, simple, modern, and subtle text.`;


    const finalImageUrl = await callOpenAIImage(chosenRecipe.title);
    if (!finalImageUrl) {
      console.log("Imagem final não foi gerada");
    } else {
      console.log(" PRATO FINAL:", finalImageUrl.slice(0, 50));
    }

    session.recipeFinalImage = finalImageUrl || null;


    // Receita como ANTES 
    const prompt = `Gera JSON válido EXATO para receita: "${chosenRecipe.title}"

FORMATO OBRIGATÓRIO SEMPRE:
{
  "title": "${chosenRecipe.title}",
  "time": "X horas ou X minutos", 
  "ingredients": [
    "quantidade + unidade + ingrediente",
    "quantidade + unidade + ingrediente",
    "ingrediente sem quantidade (se aplicável)"
  ],
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
    }
    catch (e) {
      console.log("⚠️ JSON falhou, usando TEXTO IA...");

      recipeData = {
        title: chosenRecipe.title,
        time: "30 min",
        ingredients: aiResponse.raw
          .split("\n")
          .filter(l => l.toLowerCase().includes("ingrediente"))
          .map(l => l.replace(/[-•]/g, "").trim())
          .slice(0, 8),

        steps: aiResponse.raw
          .split("\n")
          .filter(l => /^\d+/.test(l))
          .map((l, i) => ({
            stepNumber: i + 1,
            description: l.replace(/^\d+[\).\s]/, "").trim()
          }))
      };
    }

    // SALVA COM IMAGEM FINAL
    session.selectedRecipe = recipeData;
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
    const session = await RecipeSession.findById(sessionId).populate("userId");

    if (!session) {
      return res.status(404).json({ error: "Sessão não encontrada" });
    }

    const steps = session.selectedRecipe?.steps || [];
    const totalSteps = steps.length;
    const stepIndex = session.currentStep || 0;

    console.log("🔍 STEP REQUEST", {
      sessionId,
      status: session.status,
      stepIndex,
      totalSteps,
    });

    // 🔒 BLOQUEIO: sessão já concluída
    if (session.status === "COMPLETED") {
      console.log("⛔ Chamada duplicada ignorada");
      return res.json({
        message: "Receita já concluída!",
        status: "COMPLETED",
        finalImage: session.recipeFinalImage,
      });
    }

    // 🔒 Estado inválido
    if (!["SELECTED", "IN_PROGRESS"].includes(session.status)) {
      return res.status(400).json({
        error: `Estado inválido: ${session.status}`,
      });
    }

    // ✅ SE NÃO HÁ MAIS PASSOS → FINALIZA
    if (stepIndex >= totalSteps) {
      await finalizeSession(session);
      return res.json({
        message: "Receita concluída!",
        status: "COMPLETED",
        finalImage: session.recipeFinalImage,
      });
    }

    const currentStep = steps[stepIndex];
    console.log("👨‍🍳 Passo:", currentStep.description.slice(0, 60));
    console.log("🍳 Receita ativa:", session.selectedRecipe.title);
    // TEXTO DO PASSO
    const stepPrompt = `
Tu és um chef profissional.

Estás a orientar o utilizador passo a passo na receita:
"${session.selectedRecipe.title}"

Ingredientes da receita:
${session.selectedRecipe.ingredients.join(", ")}

Passo atual: ${stepIndex + 1} de ${totalSteps}

Descrição base do passo:
"${currentStep.description}"

REGRAS OBRIGATÓRIAS:
- NÃO sugerir novas receitas
- NÃO fazer perguntas
- NÃO listar opções
- NÃO repetir passos anteriores
- NÃO sair do contexto desta receita
- NÃO mencionar outros pratos
- Explica APENAS este passo
- Assume que o utilizador nunca cozinhou antes
- Usa linguagem clara, prática e direta

Responde apenas com a explicação deste passo.
`;

    const stepText = (await callOpenAIText(stepPrompt)).raw;

    // IMAGEM DO PASSO
    let imageUrl = null;

    try {
      console.log("🔄 Traduzindo para Stability.AI...");

      // Traduz título e passo
      const recipeTitleEN = await fetch('http://localhost:5000/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: session.selectedRecipe.title })
      }).then(r => r.json()).then(d => d.translatedText);

      const stepDescriptionEN = await fetch('http://localhost:5000/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentStep.description })
      }).then(r => r.json()).then(d => d.translatedText);

      console.log(" Stability.AI prompt:", stepDescriptionEN.slice(0, 60));

      imageUrl = await callOpenAIImage(recipeTitleEN, stepDescriptionEN);

    } catch (err) {
      console.log("FAL.AI falhou, tentando fallback...");
    }

    //  FALLBACK (igual ao comportamento antigo)
    if (!imageUrl) {
      imageUrl = getFallbackStepImage(session.selectedRecipe.title);
      console.log(" Usando imagem fallback (Unsplash)");
    }


    // 👉 AVANÇA PASSO
    session.currentStep = stepIndex + 1;

    // 👉 SE ESTE FOI O ÚLTIMO PASSO
    if (session.currentStep >= totalSteps) {
      await finalizeSession(session);
    } else {
      session.status = "IN_PROGRESS";
      await session.save();
    }

    return res.json({
      step: {
        stepNumber: currentStep.stepNumber,
        description: stepText,
        imageUrl,
      },
      progress: `${session.currentStep}/${totalSteps}`,
      status: session.status,
    });
  } catch (err) {
    console.error("generateStep ERROR:", err);
    res.status(500).json({
      error: "Erro ao gerar passo",
      details: err.message,
    });
  }
};

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

  console.log(" Receita finalizada:", session.selectedRecipe.title);
}
function getFallbackStepImage(recipeTitle) {
  return "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=1024&q=80";
}
