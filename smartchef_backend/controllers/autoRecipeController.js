const RecipeSession = require("../models/RecipeSession");
const { callOpenAIText, callOpenAIImage } = require("../services/openaiClients");

/**
 * 1️⃣ Recebe imagem (multer OU JSON base64) e gera 3 opções de receitas
 */
exports.generateOptions = async (req, res) => {
  try {
    let imageBase64;

    // ✅ SUPORTE DUPLO: multer OU JSON base64
    if (req.file) {
      imageBase64 = req.file.buffer.toString("base64");
      console.log("✅ Imagem via multer:", req.file.originalname);
    }
    else if (req.body.imageBase64) {
      imageBase64 = req.body.imageBase64;
      console.log("✅ Imagem via JSON base64");
    }
    else {
      return res.status(400).json({ error: "Imagem não enviada" });
    }

    const prompt = `
Tu és um assistente culinário inteligente.

Analisa cuidadosamente a imagem enviada.
1. Identifica todos os ingredientes visíveis (legumes, vegetais, carnes, peixes).
2. Assume que o utilizador quer cozinhar com esses ingredientes.
3. Sugere exatamente 3 receitas possíveis que usem principalmente esses ingredientes.

Regras:
- Simples e práticas para casa
- Não inventa ingredientes complexos
- Formato: "1. NOME - descrição curta"

No final pergunta: "Qual receita queres preparar? Responde com 1, 2 ou 3."
`;

    const aiResponse = await callOpenAIText(prompt, imageBase64);

    const session = await RecipeSession.create({
      userId: req.user._id,
      sourceImage: imageBase64,
      recipeOptions: aiResponse.options || [],  // ← Proteção caso IA não retorne options
      status: "OPTIONS",
    });

    res.json({
      sessionId: session._id.toString(),
      options: session.recipeOptions,
    });
  } catch (err) {
    console.error("generateOptions ERROR:", err);
    res.status(500).json({ error: "Erro ao gerar opções", details: err.message });
  }
};

/**
 * 2️⃣ Utilizador escolhe → IA gera receita REAL + parse
 */
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
    console.log("✅ Escolheu:", chosenRecipe.title);

    // 🔥 PROMPT IA ESPECÍFICO para a receita escolhida
    const prompt = `Gera JSON válido EXATO para receita: "${chosenRecipe.title}"

FORMATO OBRIGATÓRIO SEMPRE:
{
  "title": "${chosenRecipe.title}",
  "time": "X horas ou X minutos", 
  "ingredients": ["ingrediente 1", "ingrediente 2", "ingrediente 3"],
  "steps": [
    {"stepNumber":1,"description":"Passo 1 claro e prático"},
    {"stepNumber":2,"description":"Passo 2 claro e prático"},
    {"stepNumber":3,"description":"Passo 3 claro e prático"},
    {"stepNumber":4,"description":"Passo 4 claro e prático"},
    {"stepNumber":5,"description":"Passo 5 claro e prático"},
    {"stepNumber":6,"description":"Passo 6 claro e prático"}
  ]
}

IMPORTANTE: Responde APENAS com JSON válido.`;

    const aiResponse = await callOpenAIText(prompt);
    console.log("✅ IA gerou:", aiResponse.raw.slice(0, 200));

    // ✅ TENTA PARSEAR JSON da IA primeiro
    let recipeData;
    try {
      recipeData = JSON.parse(aiResponse.raw);
    } catch (e) {
      console.log("⚠️ JSON inválido, fazendo fallback parse...");

      // Fallback: extrai passos numerados do texto
      const stepsMatch = aiResponse.raw.match(/(\d+\..*?)(?=\n\d+\.|$)/gs) || [];
      recipeData = {
        title: chosenRecipe.title,
        time: "2 horas",
        ingredients: ["ingredientes detectados na imagem"],
        steps: stepsMatch.slice(0, 6).map((step, i) => ({
          stepNumber: i + 1,
          description: step.replace(/^\d+\.\s*/i, '').trim()
        }))
      };
    }

    // ✅ GUARDA 6 PASSOS MÍNIMOS se IA falhar
    if (!recipeData.steps || recipeData.steps.length === 0) {
      console.log("⚠️ Sem passos, usando fallback da imagem...");
      recipeData.steps = [{
        stepNumber: 1,
        description: `Preparar ${chosenRecipe.title.split(' - ')[0]} (baseado na tua foto)`
      }];
    }

    // ✅ SALVA TUDO
    session.selectedRecipe = recipeData;
    session.currentStep = 0;
    session.status = "SELECTED";  // ← CRÍTICO!
    await session.save();

    console.log(`✅ Receita IA DINÂMICA salva: ${recipeData.steps.length} passos`);
    res.json({ recipe: recipeData });

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

