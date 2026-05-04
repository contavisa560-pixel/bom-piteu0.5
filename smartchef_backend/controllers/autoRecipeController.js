const { uploadToCloudflare } = require("../services/storageService");
const RecipeSession = require("../models/RecipeSession");
const { callOpenAIText, callOpenAIImage, extractStepIngredients } = require("../services/openaiClients");
const NotificationService = require('../services/notificationService');
const History = require("../models/History");
const {
  visionOptionsPrompt,
  stepImagePrompt,
  finalDishImagePrompt,
  recipePrompt
} = require("../services/chefPrompt");
const { getOrGenerateImage } = require("../services/imageCacheService");

// BUSCAR PREFERÊNCIAS DO USUÁRIO PARA O BOT
const Preference = require("../models/Preference");

// ── HELPER DE IDIOMA ──────────────────────────────────────────────────────────
// Recebe o código de língua vindo do frontend (ex: 'en', 'pt', 'fr')
// e devolve uma instrução clara para a IA responder nesse idioma.
// SUBSTITUIR a função inteira
function getLanguageInstruction(language) {
  const lang = (language || 'pt').split('-')[0].toLowerCase();
  const map = {
    'pt': 'Responde sempre em Português. Nunca uses outra língua.',
    'en': 'Always respond in English only.',
    'es': 'Responde siempre en Español únicamente.',
    'fr': 'Réponds toujours en Français uniquement.',
    'de': 'Antworte immer nur auf Deutsch.',
    'it': 'Rispondi sempre solo in Italiano.',
    'ru': 'Отвечай всегда только на Русском языке.',
    'zh': '请始终只用中文回答。',
    'ja': '常に日本語のみで回答してください。',
    'ko': '항상 한국어로만 답변하세요.',
    'ar': 'أجب دائماً باللغة العربية فقط.',
    'hi': 'हमेशा केवल हिंदी में उत्तर दें।',
    'tr': 'Her zaman yalnızca Türkçe yanıt ver.',
    'pl': 'Odpowiadaj zawsze tylko po polsku.',
    'nl': 'Antwoord altijd alleen in het Nederlands.',
    'sv': 'Svara alltid bara på svenska.',
    'id': 'Selalu jawab hanya dalam Bahasa Indonesia.',
    'vi': 'Luôn trả lời chỉ bằng tiếng Việt.',
    'th': 'ตอบเป็นภาษาไทยเท่านั้นเสมอ',
    'uk': 'Завжди відповідай лише українською мовою.',
    'cs': 'Vždy odpovídej pouze česky.',
    'ro': 'Răspunde întotdeauna doar în română.',
    'hu': 'Mindig csak magyarul válaszolj.',
    'el': 'Να απαντάς πάντα μόνο στα Ελληνικά.',
    'he': 'ענה תמיד רק בעברית.',
    'fa': 'همیشه فقط به فارسی پاسخ بده.',
    'bn': 'সবসময় শুধুমাত্র বাংলায় উত্তর দাও।',
    'sw': 'Jibu kwa Kiswahili pekee daima.',
    'ms': 'Sentiasa jawab dalam Bahasa Melayu sahaja.',
  };
  return map[lang] || 'Always respond in English only.';
}
// ─────────────────────────────────────────────────────────────────────────────

async function getUserPreferencesForBot(userId) {
  try {
    console.log(` Buscando preferências do usuário: ${userId}`);

    const mongoose = require('mongoose');

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`⚠️ ID não é ObjectId válido: ${userId}`);
      return {
        hasPreferences: false,
        summary: "ID de usuário inválido",
        restrictionsText: ""
      };
    }
    const preferences = await Preference.findOne({ userId });

    if (!preferences) {
      return {
        hasPreferences: false,
        summary: "Sem preferências configuradas",
        restrictionsText: ""
      };
    }

    const restrictions = [];

    if (preferences.diets && preferences.diets.length > 0) {
      restrictions.push(` Dietas: ${preferences.diets.join(', ')}`);
    }

    if (preferences.allergies && preferences.allergies.length > 0) {
      const allergyNames = preferences.allergies.map(a => a.customName || a.name);
      restrictions.push(` Alergias: ${allergyNames.join(', ')}`);
    }

    if (preferences.intolerances && preferences.intolerances.length > 0) {
      const intoleranceNames = preferences.intolerances.map(i => i.customName || i.name);
      restrictions.push(` Intolerâncias: ${intoleranceNames.join(', ')}`);
    }

    if (preferences.goals && preferences.goals.length > 0) {
      const goalNames = preferences.goals.map(g => g.customName || g.name);
      restrictions.push(` Objetivos: ${goalNames.join(', ')}`);
    }

    if (preferences.calorieTarget) {
      restrictions.push(` Meta calórica: ${preferences.calorieTarget} kcal/dia`);
    }

    if (preferences.bloodType) {
      restrictions.push(` Tipo sanguíneo: ${preferences.bloodType}`);
    }

    return {
      hasPreferences: restrictions.length > 0,
      restrictionsText: restrictions.join(' | '),
      rawPreferences: preferences
    };

  } catch (error) {
    console.error("❌ Erro ao buscar preferências:", error);
    return {
      hasPreferences: false,
      summary: "Erro ao carregar preferências",
      restrictionsText: ""
    };
  }
}


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
 *  GERAR RECEITA COMPLETA A PARTIR DO TÍTULO 
 */
exports.gerarReceitaCompletaParaFavorito = async (req, res) => {
  try {
    const { tituloReceita, userId, language } = req.body; // ← language adicionado
    const langInstruction = getLanguageInstruction(language);

    console.log("🍎 GERANDO RECEITA REAL PARA FAVORITO:", tituloReceita);

    if (!tituloReceita) {
      return res.status(400).json({ error: "Título da receita é obrigatório" });
    }

    const userPrefs = await getUserPreferencesForBot(userId);
    console.log("📋 Preferências do usuário:", userPrefs.restrictionsText);

    const prompt = `
GERE UMA RECEITA COMPLETA E REAL PARA O PRATO: "${tituloReceita}"

INSTRUÇÕES ABSOLUTAS:
1. A receita deve ser AUTÊNTICA e PRÁTICA para fazer em casa
2. Use ingredientes comuns em Angola/Portugal
3. Inclua todos os detalhes necessários

${userPrefs.hasPreferences ? `
 RESTRIÇÕES DO USUÁRIO QUE DEVEM SER RESPEITADAS:
${userPrefs.restrictionsText}

IMPORTANTE: Esta receita NÃO pode conter:
- ${userPrefs.rawPreferences?.allergies?.map(a => a.customName || a.name).join(', ') || 'Nenhuma alergia'}
- Deve ser compatível com: ${userPrefs.rawPreferences?.diets?.join(', ') || 'Nenhuma dieta'}
- Respeitar objetivo: ${userPrefs.rawPreferences?.goals?.map(g => g.customName || g.name).join(', ') || 'Nenhum objetivo'}
` : ''}

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON):
{
  "titulo": "${tituloReceita}",
  "descricao": "Descrição apetitosa do prato",
  "ingredientes": ["500g de ingrediente principal", "2 cebolas", "3 dentes de alho", "Sal e pimenta", "Azeite"],
  "passos": ["Lave os ingredientes", "Pique a cebola e alho", "Refogue", "Cozinhe o ingrediente principal", "Tempere e sirva"],
  "dificuldade": "Fácil/Média/Difícil",
  "tempoPreparo": "XX minutos",
  "dicas": ["Dica 1", "Dica 2"],
  "categoria": "angolan",
  "saudeScore": 8,
  "adaptacoesParaUsuario": "${userPrefs.hasPreferences ? 'Adaptado às restrições do usuário' : 'Receita padrão'}"
}

${langInstruction}
`;

    const aiResponse = await callOpenAIText(
      prompt,
      null,
      `Você é um chef profissional que cria receitas detalhadas e práticas para fazer em casa. ${langInstruction}`
    );

    let receitaCompleta;
    try {
      const jsonMatch = aiResponse.raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        receitaCompleta = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON não encontrado na resposta");
      }
    } catch (parseErr) {
      console.log("❌ Parse error, criando receita fallback");
      receitaCompleta = criarReceitaFallbackReal(tituloReceita, userPrefs);
    }

    receitaCompleta = validarReceitaCompleta(receitaCompleta, userPrefs);

    let finalImageUrl = null;
    try {
      console.log("🎨 Gerando imagem REAL para:", receitaCompleta.titulo);

      const tempImageUrl = await callOpenAIImage(
        "",
        receitaCompleta.titulo,
        receitaCompleta.descricao || "Prato tradicional bem apresentado",
        true
      );

      if (tempImageUrl) {
        console.log("💾 Salvando imagem REAL no Cloudflare R2...");
        finalImageUrl = await require("../services/storageService").ensurePermanentImageUrl(
          tempImageUrl,
          receitaCompleta.titulo,
          'final-dish'
        );
        console.log("✅ Imagem REAL salva:", finalImageUrl);
      }
    } catch (imgErr) {
      console.log("❌ Erro ao gerar imagem:", imgErr.message);
      finalImageUrl = getFallbackImageBasedOnRecipe(tituloReceita);
    }

    const session = await RecipeSession.create({
      userId: userId,
      sourceText: `Favorito: ${tituloReceita}`,
      status: "SELECTED",
      category: receitaCompleta.categoria || "angolan",
      selectedRecipe: {
        title: receitaCompleta.titulo,
        ingredients: receitaCompleta.ingredientes,
        steps: receitaCompleta.passos.map((desc, idx) => ({
          stepNumber: idx + 1,
          description: desc
        })),
        time: receitaCompleta.tempoPreparo,
        difficulty: receitaCompleta.dificuldade
      },
      recipeFinalImage: finalImageUrl,
      recipeOptions: [{
        title: receitaCompleta.titulo,
        description: receitaCompleta.descricao,
        ingredients: receitaCompleta.ingredientes.slice(0, 5),
        difficulty: receitaCompleta.dificuldade,
        time: receitaCompleta.tempoPreparo
      }],
      identifiedIngredients: receitaCompleta.ingredientes,
      currentStep: 0,
      inStepMode: false
    });

    console.log("✅ SESSÃO REAL CRIADA com ID:", session._id);

    await NotificationService.createForUsersWithSetting(
      'notifyRecipes',
      'new_recipe',
      ' Nova Receita Disponível!',
      `Uma nova receita foi gerada: ${receitaCompleta.titulo}`,
      { recipeId: session._id, recipeTitle: receitaCompleta.titulo }
    );

    res.json({
      tipo: "receita_adaptada_pronta",
      success: true,
      sessionId: session._id,
      receita: {
        title: receitaCompleta.titulo,
        description: receitaCompleta.descricao,
        ingredients: receitaCompleta.ingredientes,
        steps: receitaCompleta.passos.map((desc, idx) => ({
          stepNumber: idx + 1,
          description: desc
        })),
        time: receitaCompleta.tempoPreparo,
        difficulty: receitaCompleta.dificuldade,
        healthScore: receitaCompleta.saudeScore || 8,
        adaptacoes: userPrefs.hasPreferences ? ["Adaptado às suas restrições"] : [],
        fromFavorite: true
      },
      finalImage: finalImageUrl,
      podeIniciarPassoAPasso: true,
      mensagemInicio: `Receita "${receitaCompleta.titulo}" criada com sucesso!`,
      acaoSugerida: "iniciar_passo_a_passo",
      totalPassos: receitaCompleta.passos.length,
      preferenciasConsideradas: userPrefs.hasPreferences
    });

  } catch (err) {
    console.error("❌ ERRO ao gerar receita para favorito:", err);
    res.status(500).json({
      error: "Erro ao processar receita favorita",
      details: err.message
    });
  }
};

function criarReceitaFallbackReal(tituloReceita, userPrefs) {
  const receitaBase = {
    titulo: tituloReceita,
    descricao: `Delicioso ${tituloReceita} preparado com ingredientes frescos e técnicas tradicionais.`,
    ingredientes: [
      "500g de ingrediente principal",
      "2 cebolas médias picadas",
      "3 dentes de alho picados",
      "2 tomates maduros",
      "Sal e pimenta a gosto",
      "Azeite para refogar",
      "Água conforme necessário",
      "Coentros ou salsa para decorar"
    ],
    passos: [
      "Lave e prepare todos os ingredientes",
      "Numa panela, aqueça o azeite e refogue a cebola e o alho até dourarem",
      "Adicione o tomate picado e cozinhe até formar um molho",
      "Junte o ingrediente principal e misture bem",
      "Tempere com sal e pimenta, adicione água se necessário",
      "Deixe cozinhar em fogo médio por 20-25 minutos",
      "Retifique os temperos se necessário",
      "Sirva quente decorado com coentros ou salsa"
    ],
    dificuldade: "Média",
    tempoPreparo: "45 minutos",
    dicas: [
      "Use ingredientes frescos para melhor sabor",
      "Ajuste o tempo de cozimento conforme necessário"
    ],
    categoria: "angolan",
    saudeScore: 8
  };

  if (userPrefs.hasPreferences) {
    receitaBase.adaptacoesParaUsuario = "Adaptado às suas restrições alimentares";
    if (userPrefs.rawPreferences?.diets?.includes("Vegetariana")) {
      receitaBase.ingredientes[0] = "500g de proteína vegetal (feijão, grão, tofu)";
    }
  }

  return receitaBase;
}

function validarReceitaCompleta(receita, userPrefs) {
  if (!receita.ingredientes || !Array.isArray(receita.ingredientes)) {
    receita.ingredientes = criarReceitaFallbackReal(receita.titulo, userPrefs).ingredientes;
  }

  if (!receita.passos || !Array.isArray(receita.passos)) {
    receita.passos = criarReceitaFallbackReal(receita.titulo, userPrefs).passos;
  }

  if (!receita.dificuldade) receita.dificuldade = "Média";
  if (!receita.tempoPreparo) receita.tempoPreparo = "45 minutos";
  if (!receita.saudeScore) receita.saudeScore = 8;

  return receita;
}

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

    const userPrefs = await getUserPreferencesForBot(req.user._id);
    console.log(" Preferências para gerar opções:", userPrefs.hasPreferences ? "SIM" : "NÃO");

    // ── IDIOMA ──
    const language = req.body.language || req.headers['accept-language'] || 'pt';
    const langInstruction = getLanguageInstruction(language);

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
      systemMessage = `Você é um chef angolano profissional com 20 anos de experiência. ${langInstruction}`;
      prompt = `Analise ESTES ingredientes: "${ingredientsText}" 

Categoria solicitada: ${category}

`;

      if (userPrefs.hasPreferences && userPrefs.restrictionsText) {
        prompt += `
🚨 ALERTA DE SEGURANÇA - O USUÁRIO TEM ESTAS RESTRIÇÕES:
${userPrefs.restrictionsText}

REGRAS ABSOLUTAS PARA AS RECEITAS:
1. NENHUMA receita pode conter: ${userPrefs.rawPreferences?.allergies?.map(a => a.customName || a.name).join(', ') || 'Nenhuma alergia'}
2. TODAS devem ser compatíveis com: ${userPrefs.rawPreferences?.diets?.join(', ') || 'Nenhuma dieta'}
3. Se os ingredientes fornecidos contiverem algo proibido, SUBSTITUIR por alternativa segura
4. Explicar claramente as adaptações feitas

`;
      }

      prompt += `Gere EXATAMENTE 3 receitas AUTÊNTICAS usando principalmente esses ingredientes.

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
      "category": "${category}",
      "observations": "Como esta receita respeita as restrições do usuário"
    }
  ],
  "warnings": ["Avisos sobre compatibilidade com restrições"]
}

NUNCA USE receitas genéricas como "Omelete Simples" ou "Arroz com Legumes".

${langInstruction}`;

    } else if (imageBase64) {
      systemMessage = `Você é um especialista em análise visual de alimentos com conhecimento culinário profundo. ${langInstruction}`;
      prompt = visionOptionsPrompt(imageUrl, category);

    } else {
      return res.status(400).json({ error: "Envie texto (ingredients) OU imagem" });
    }

    const aiResponse = await callOpenAIText(prompt, imageBase64, systemMessage);

    let options = [];
    let ingredientsIdentified = [];

    try {
      const jsonMatch = aiResponse.raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        options = parsed.options || [];
        ingredientsIdentified = parsed.ingredientsIdentified || [];
      } else {
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
    const { sessionId, choice, language } = req.body; // ← language adicionado
    const langInstruction = getLanguageInstruction(language);

    const session = await RecipeSession.findById(sessionId);

    if (!session || session.status !== "OPTIONS") {
      return res.status(400).json({ error: "Sessão inválida" });
    }

    const chosenRecipe = session.recipeOptions[choice - 1];
    console.log(" Escolheu:", chosenRecipe.title);

    let finalImageUrl = null;
    try {
      const cachePrompt = chosenRecipe.title.toLowerCase().trim();

      finalImageUrl = await getOrGenerateImage(
        cachePrompt,
        "final-dish",
        async () => {
          console.log("🎨 [selectRecipe] Gerando nova imagem final...");
          const tempImageUrl = await callOpenAIImage(
            "",
            chosenRecipe.title,
            chosenRecipe.description || "Prato final bem apresentado",
            true
          );
          if (!tempImageUrl) throw new Error("OpenAI não retornou URL");
          return await require("../services/storageService").ensurePermanentImageUrl(
            tempImageUrl,
            chosenRecipe.title,
            "final-dish"
          );
        }
      );

      session.recipeFinalImage = finalImageUrl;
      console.log("✅ [selectRecipe] Imagem final pronta:", finalImageUrl);
    } catch (imgErr) {
      console.log("❌ [selectRecipe] Falha imagem final, usando fallback:", imgErr.message);
      finalImageUrl = getFallbackFinalImage(chosenRecipe.title);
      session.recipeFinalImage = finalImageUrl;
    }

    const prompt = recipePrompt(
      chosenRecipe.title,
      session.identifiedIngredients || []
    );

    const aiResponse = await callOpenAIText(
      prompt,
      null,
      `Você é um chef profissional especializado em receitas detalhadas. ${langInstruction}`
    );

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

    recipeData = validateAndCompleteRecipe(recipeData, chosenRecipe.title);

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

    // ── IDIOMA: lê do body ou do header Accept-Language ──
    const language = req.body.language || req.headers['accept-language'] || 'pt';
    const langInstruction = getLanguageInstruction(language);

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
      status: session.status,
      language
    });

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

    // TEXTO EXPLICATIVO DO PASSO — agora com instrução de idioma
    const stepPrompt = `
CHEF'S STEP-BY-STEP GUIDANCE

RECIPE: "${session.selectedRecipe.title}"
CURRENT STEP: ${stepIndex + 1} of ${totalSteps}
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

FORMAT: Clear, friendly, instructional tone
LENGTH: 3-4 sentences maximum

${langInstruction}
`;

    const stepTextResponse = await callOpenAIText(
      stepPrompt,
      null,
      `Você é um chef paciente que explica técnicas culinárias para iniciantes. ${langInstruction}`
    );

    const stepText = stepTextResponse.raw;

    let stepImageUrl = null;
    try {
      const recipeTitleEN = await translateToEnglish(session.selectedRecipe.title);
      const stepDescriptionEN = await translateToEnglish(currentStep.description);

      const stepIngredients = await extractStepIngredients(
        currentStep.description,
        session.selectedRecipe.ingredients,
        session.selectedRecipe.title
      );

      console.log(`🥘 Passo ${stepIndex + 1} — ingredientes específicos:`, stepIngredients);
      const stepContextForImage = `${stepDescriptionEN} [INGREDIENTS:${stepIngredients.join(",")}]`;
      const cachePrompt = `${recipeTitleEN}::step${stepIndex + 1}`;

      stepImageUrl = await getOrGenerateImage(
        cachePrompt,
        "step",
        async () => {
          console.log("🎨 [generateStep] Gerando nova imagem do passo...");
          const tempStepImageUrl = await callOpenAIImage(
            "",
            recipeTitleEN,
            stepContextForImage,
            false,
            stepIndex + 1,
            totalSteps
          );
          if (!tempStepImageUrl) throw new Error("OpenAI não retornou URL");
          return await require("../services/storageService").ensurePermanentImageUrl(
            tempStepImageUrl,
            `${session.selectedRecipe.title} - Passo ${stepIndex + 1}`,
            "step"
          );
        }
      );

      console.log("✅ [generateStep] Imagem do passo pronta:", stepImageUrl);
    } catch (imgErr) {
      console.log("❌ Falha na imagem do passo, usando fallback:", imgErr.message);
      stepImageUrl = getStepSpecificFallbackImage(
        session.selectedRecipe.title,
        currentStep.description,
        stepIndex + 1,
        totalSteps
      );
    }

    if (stepImageUrl && session.selectedRecipe.steps[stepIndex]) {
      session.selectedRecipe.steps[stepIndex].imageUrl = stepImageUrl;
      session.markModified('selectedRecipe');
    }

    session.currentStep = stepIndex + 1;
    session.inStepMode = true;
    session.status = "IN_PROGRESS";

    if (session.currentStep >= totalSteps) {
      await finalizeSession(session);
    } else {
      await session.save();
    }

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

/**
 * 4️⃣ Usuário quer fazer um prato específico
 */
exports.handleDesejoPrato = async (req, res) => {
  try {
    const { pratoDesejado, ingredientesDisponiveis, sessionId, language } = req.body; // ← language
    const langInstruction = getLanguageInstruction(language);
    const userId = req.user._id;

    const userPrefs = await getUserPreferencesForBot(userId);
    console.log(" Preferências para desejo de prato:", userPrefs.hasPreferences ? "SIM" : "NÃO");

    console.log(" DESEJO DE PRATO:", {
      prato: pratoDesejado,
      temIngredientes: !!ingredientesDisponiveis,
      sessionId: sessionId || 'nova',
      language
    });

    if (!pratoDesejado || typeof pratoDesejado !== 'string') {
      return res.status(400).json({
        error: "Por favor, especifique qual prato deseja fazer (ex: 'arroz de marisco', 'frango assado')"
      });
    }

    let session;
    const mongoose = require('mongoose');
    const isValidObjectId = mongoose.Types.ObjectId.isValid(sessionId);

    if (sessionId && isValidObjectId) {
      session = await RecipeSession.findById(sessionId);
      console.log("🔍 Buscando sessão com ID válido:", sessionId);

      if (session) {
        console.log("✅ Sessão encontrada:", session._id);
      } else {
        console.log("❌ Sessão não encontrada, criando nova...");
        session = null;
      }
    } else if (sessionId) {
      console.log("⚠️ sessionId inválido para MongoDB, criando nova sessão:", sessionId);
      session = null;
    } else {
      console.log(" Criando nova sessão (sem sessionId)");
      session = null;
    }

    if (!session) {
      session = await RecipeSession.create({
        userId,
        sourceText: `Desejo: ${pratoDesejado} | Aguardando ingredientes`,
        status: "OPTIONS",
        category: "personalizado"
      });
      console.log(" Nova sessão criada com ID:", session._id);
    }

    if (!ingredientesDisponiveis) {

      if (userPrefs.hasPreferences) {
        const alergias = userPrefs.rawPreferences?.allergies?.map(a => a.customName || a.name) || [];
        const pratoLower = pratoDesejado.toLowerCase();

        let temIngredienteProibido = false;
        let ingredienteProibido = '';

        for (const alergia of alergias) {
          const alergiaLower = alergia.toLowerCase();
          if (pratoLower.includes(alergiaLower) ||
            (alergiaLower.includes('leite') && (pratoLower.includes('leite') || pratoLower.includes('lácteo'))) ||
            (alergiaLower.includes('marisco') && (pratoLower.includes('marisco') || pratoLower.includes('camarão') || pratoLower.includes('fruto do mar')))) {
            temIngredienteProibido = true;
            ingredienteProibido = alergia;
            break;
          }
        }

        if (temIngredienteProibido) {
          return res.json({
            tipo: "alerta_alergia",
            mensagem: `⚠️ ATENÇÃO! Você tem alergia a ${ingredienteProibido.replace('Alergia a ', '')}, então não posso sugerir "${pratoDesejado}".`,
            sugestao: `Que tal uma versão sem ${ingredienteProibido}? Por exemplo, "${pratoDesejado.replace(ingredienteProibido, 'legumes').replace(/marisco|camarão/i, 'vegetais')}"`,
            pratoOriginal: pratoDesejado,
            alergia: ingredienteProibido
          });
        }
      }

      const prompt = require("../services/chefPrompt").desejoPratoPrompt(pratoDesejado, null, userPrefs);

      const aiResponse = await callOpenAIText(
        prompt,
        null,
        `Você é um chef experiente que ajuda pessoas a cozinhar com o que têm disponível. ${langInstruction}`
      );

      let resposta;
      try {
        const jsonMatch = aiResponse.raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          resposta = JSON.parse(jsonMatch[0]);
        } else {
          resposta = {
            pergunta: `Para fazer ${pratoDesejado}, que ingredientes tens disponível?`,
            ingredientesEssenciais: ["ingredientes principais do prato"],
            dicas: ["Use ingredientes frescos para melhor resultado"]
          };
        }
      } catch (e) {
        resposta = {
          pergunta: `Para fazer ${pratoDesejado}, que ingredientes tens disponível?`,
          dicas: ["Podes adaptar a receita ao que tens em casa"]
        };
      }

      session.sourceText = `Desejo: ${pratoDesejado} | Aguardando ingredientes`;
      await session.save();

      return res.json({
        type: "pergunta_ingredientes",
        sessionId: session._id,
        pratoDesejado,
        mensagem: resposta.pergunta || `Para fazer ${pratoDesejado}, que ingredientes tens disponível?`,
        ingredientesSugeridos: resposta.ingredientesEssenciais || [],
        dicas: resposta.dicas || [],
        status: "AGUARDANDO_RESPOSTA"
      });
    }

    console.log("🧂 Ingredientes fornecidos:", ingredientesDisponiveis);

    const ingredientesArray = typeof ingredientesDisponiveis === 'string'
      ? ingredientesDisponiveis.split(',').map(i => i.trim()).filter(i => i)
      : ingredientesDisponiveis;

    const prompt = require("../services/chefPrompt").desejoPratoPrompt(pratoDesejado, ingredientesArray, userPrefs);

    const aiResponse = await callOpenAIText(
      prompt,
      null,
      `Você é um chef criativo que adapta receitas aos ingredientes disponíveis. ${langInstruction}`
    );

    let receitaAdaptada;
    try {
      const jsonMatch = aiResponse.raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        receitaAdaptada = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Resposta não contém JSON válido");
      }
    } catch (e) {
      console.log("❌ Parse error, criando receita fallback");
      receitaAdaptada = {
        titulo: `${pratoDesejado} Adaptado`,
        descricao: `Versão simplificada usando ${ingredientesArray.join(', ')}`,
        ingredientes: ingredientesArray.map(ing => `300g de ${ing}`),
        dificuldade: "Média",
        tempo: "45 min",
        adaptacoes: [
          "Adaptado aos ingredientes disponíveis",
          "Versão caseira e saborosa"
        ],
        passos: [
          "Prepare todos os ingredientes",
          "Siga as técnicas básicas de preparo",
          "Ajuste os temperos a gosto",
          "Sirva quente e aproveite"
        ]
      };
    }

    if (!receitaAdaptada.titulo) receitaAdaptada.titulo = `${pratoDesejado} Personalizado`;
    if (!receitaAdaptada.descricao) receitaAdaptada.descricao = `Versão adaptada de ${pratoDesejado}`;
    if (!receitaAdaptada.dificuldade) receitaAdaptada.dificuldade = "Média";
    if (!receitaAdaptada.tempo) receitaAdaptada.tempo = "45 min";

    if (!receitaAdaptada.ingredientes || !Array.isArray(receitaAdaptada.ingredientes)) {
      receitaAdaptada.ingredientes = ingredientesArray.map(ing => `quantidade de ${ing}`);
    }

    if (!receitaAdaptada.passos || !Array.isArray(receitaAdaptada.passos) || receitaAdaptada.passos.length === 0) {
      receitaAdaptada.passos = [
        "Prepare os ingredientes disponíveis",
        "Siga o método básico de preparação",
        "Ajuste conforme necessário",
        "Finalize e sirva"
      ];
    }

    if (!receitaAdaptada.adaptacoes || !Array.isArray(receitaAdaptada.adaptacoes)) {
      receitaAdaptada.adaptacoes = ["Adaptado aos ingredientes disponíveis"];
    }

    let finalImageUrl = null;
    try {
      const tempImageUrl = await callOpenAIImage(
        "",
        receitaAdaptada.titulo,
        receitaAdaptada.descricao || "Prato adaptado",
        true
      );

      if (tempImageUrl) {
        console.log("💾 Salvando imagem do prato desejado no Cloudflare R2...");
        finalImageUrl = await require("../services/storageService").ensurePermanentImageUrl(
          tempImageUrl,
          receitaAdaptada.titulo,
          'final-dish'
        );
      }
    } catch (imgErr) {
      console.log("❌ Falha imagem final, usando fallback");
      finalImageUrl = getFallbackFinalImage(receitaAdaptada.titulo);
    }

    session.selectedRecipe = {
      title: receitaAdaptada.titulo,
      ingredients: receitaAdaptada.ingredientes || [],
      steps: receitaAdaptada.passos.map((desc, idx) => ({
        stepNumber: idx + 1,
        description: desc
      })),
      time: receitaAdaptada.tempo,
      difficulty: receitaAdaptada.dificuldade
    };

    session.recipeFinalImage = finalImageUrl;
    session.recipeOptions = [{
      title: receitaAdaptada.titulo,
      description: receitaAdaptada.descricao,
      ingredients: receitaAdaptada.ingredientes || [],
      difficulty: receitaAdaptada.dificuldade,
      time: receitaAdaptada.tempo
    }];

    session.identifiedIngredients = ingredientesArray;
    session.status = "SELECTED";
    session.currentStep = 0;
    session.sourceText = `Desejo: ${pratoDesejado} | Ingredientes: ${ingredientesArray.join(', ')}`;
    await session.save();

    res.json({
      tipo: "receita_adaptada_pronta",
      sessionId: session._id,
      pratoDesejado,
      receita: {
        title: receitaAdaptada.titulo,
        description: receitaAdaptada.descricao,
        ingredients: receitaAdaptada.ingredientes || [],
        steps: receitaAdaptada.passos.map((desc, idx) => ({
          stepNumber: idx + 1,
          description: desc
        })),
        time: receitaAdaptada.tempo,
        difficulty: receitaAdaptada.dificuldade,
        adaptacoes: receitaAdaptada.adaptacoes || []
      },
      finalImage: finalImageUrl,
      ingredientesUtilizados: ingredientesArray,
      status: "RECEITA_PRONTA",
      podeIniciarPassoAPasso: true,
      mensagemInicio: `Receita "${receitaAdaptada.titulo}" criada com sucesso! Quer começar o passo a passo com imagens?`,
      acaoSugerida: "chamar_iniciar_passo_a_passo",
      totalPassos: receitaAdaptada.passos.length
    });

  } catch (err) {
    console.error("❌ ERRO handleDesejoPrato:", err);
    res.status(500).json({
      error: "Erro ao processar desejo de prato",
      details: err.message
    });
  }
};

/**
 * Usuário pergunta sobre passo específico durante passo a passo
 */
exports.perguntaPasso = async (req, res) => {
  try {
    console.log("❓ PERGUNTA PASSO:", req.body);

    const { sessionId, pergunta, language } = req.body; // ← language
    const langInstruction = getLanguageInstruction(language);

    if (!sessionId || !pergunta) {
      return res.status(400).json({
        tipo: "erro_validacao",
        mensagem: "sessionId e pergunta são obrigatórios",
        dica: "Envie ambos os campos no corpo da requisição"
      });
    }

    const mongoose = require('mongoose');

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        tipo: "erro_id_invalido",
        mensagem: "ID de sessão inválido",
        dica: "Use um ID válido de uma sessão ativa de receita"
      });
    }

    const session = await RecipeSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Sessão não encontrada" });
    }

    if (!session.inStepMode || session.status !== "IN_PROGRESS") {
      return res.status(400).json({
        tipo: "erro_modo",
        mensagem: "Você precisa estar executando uma receita para fazer perguntas sobre passos.",
        dica: "Comece uma receita e avance até o primeiro passo para usar esta funcionalidade.",
        status: session.status,
        inStepMode: session.inStepMode
      });
    }

    const currentStep = session.currentStep || 1;
    const totalSteps = session.selectedRecipe?.steps?.length || 0;
    const currentStepData = session.selectedRecipe?.steps?.[currentStep - 1];

    if (!currentStepData) {
      return res.status(400).json({
        error: "Não foi possível encontrar o passo atual na receita"
      });
    }

    console.log("📝 CONTEXTO:", {
      receita: session.selectedRecipe?.title,
      passoAtual: currentStep,
      descricao: currentStepData.description
    });

    const prompt = `
CONTEXTO DA RECEITA:
- Título: "${session.selectedRecipe.title}"
- Passo atual: ${currentStep} de ${totalSteps}
- Descrição do passo: "${currentStepData.description}"
- Ingredientes principais: ${session.selectedRecipe.ingredients.slice(0, 5).join(', ')}

PERGUNTA DO USUÁRIO SOBRE ESTE PASSO:
"${pergunta}"

INSTRUÇÕES PARA SUA RESPOSTA:
1. Responda ESPECIFICAMENTE para o passo atual mencionado acima
2. Foque apenas na dúvida do usuário relacionada a ESTE passo
3. Se a pergunta for irrelevante para o passo atual, explique gentilmente e redirecione para o que precisa fazer agora
4. Dê soluções práticas e aplicáveis AGORA e depois recomende clicar no botão próximo passo para avançar
5. Seja breve (máximo 3-4 frases)
6. Mantenha tom de chef assistente: útil, prático, encorajador

${langInstruction}

RESPOSTA:
`;

    const aiResponse = await callOpenAIText(
      prompt,
      null,
      `Você é um chef assistente especializado em resolver dúvidas durante o passo a passo de receitas. ${langInstruction}`
    );

    const resposta = aiResponse.raw;

    session.stepQuestions.push({
      stepNumber: currentStep,
      question: pergunta,
      answer: resposta
    });

    await session.save();

    console.log("✅ RESPOSTA GERADA:", resposta.substring(0, 100) + "...");

    res.json({
      tipo: "resposta_contextual",
      resposta: resposta,
      contexto: {
        passoAtual: currentStep,
        totalPassos: totalSteps,
        tituloReceita: session.selectedRecipe.title,
        descricaoPasso: currentStepData.description,
        perguntaOriginal: pergunta
      },
      status: "EM_ANDAMENTO"
    });

  } catch (err) {
    console.error("❌ ERRO em perguntaPasso:", err);
    res.status(500).json({
      error: "Erro ao processar sua pergunta sobre o passo",
      details: err.message
    });
  }
};

/**
 * Inicia o modo passo a passo
 */
exports.iniciarPassoAPasso = async (req, res) => {
  try {
    const { sessionId } = req.body;

    console.log("🚀 INICIAR PASSO A PASSO:", { sessionId });

    if (!sessionId) {
      return res.status(400).json({
        tipo: "erro_validacao",
        mensagem: "sessionId é obrigatório",
        dica: "Envie o ID da sessão que tem uma receita pronta"
      });
    }

    const session = await RecipeSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        error: "Sessão não encontrada",
        dica: "Verifique se o ID da sessão está correto"
      });
    }

    console.log("📋 SESSÃO ENCONTRADA:", {
      receita: session.selectedRecipe?.title,
      status: session.status,
      temReceita: !!session.selectedRecipe,
      currentStep: session.currentStep,
      inStepMode: session.inStepMode
    });

    if (!session.selectedRecipe) {
      return res.status(400).json({
        error: "Esta sessão não tem uma receita selecionada",
        dica: "Primeiro crie uma receita"
      });
    }

    if (session.inStepMode && session.status === "IN_PROGRESS" && session.currentStep > 0) {
      console.log(`▶️  Retomando do passo ${session.currentStep + 1} (${session.currentStep} passos já feitos)`);
      const mockReq = { body: { sessionId, language: req.body.language }, headers: req.headers, user: req.user };
      return exports.generateStep(mockReq, res);
    }

    session.currentStep = 0;
    session.status = "SELECTED";
    session.inStepMode = true;
    session.startedAt = new Date();
    await session.save();

    console.log("✅ MODO PASSO A PASSO INICIADO para:", session.selectedRecipe.title);

    const mockReq = { body: { sessionId, language: req.body.language }, headers: req.headers, user: req.user };
    return exports.generateStep(mockReq, res);

  } catch (err) {
    console.error("❌ ERRO em iniciarPassoAPasso:", err);
    res.status(500).json({
      error: "Erro ao iniciar passo a passo",
      details: err.message,
      sugestao: "Verifique se a sessão ainda é válida"
    });
  }
};

// ============ FUNÇÕES AUXILIARES ============

function criarReceitaFallback(pratoDesejado, ingredientes) {
  return {
    titulo: `${pratoDesejado} Adaptado`,
    descricao: `Versão simplificada de ${pratoDesejado} usando os ingredientes disponíveis`,
    ingredientes: ingredientes.map(ing => `300g de ${ing}`),
    dificuldade: "Média",
    tempo: "45 min",
    adaptacoes: [
      "Adaptado aos ingredientes que tens",
      "Versão simplificada mas saborosa"
    ],
    passos: [
      "Prepare todos os ingredientes",
      "Siga as técnicas básicas de preparo",
      "Ajuste os temperos a gosto",
      "Sirva e aproveite"
    ]
  };
}

function validarReceitaAdaptada(receita, pratoOriginal, ingredientes) {
  if (!receita.titulo) receita.titulo = `${pratoOriginal} Personalizado`;
  if (!receita.descricao) receita.descricao = `Versão adaptada de ${pratoOriginal}`;
  if (!receita.dificuldade) receita.dificuldade = "Média";
  if (!receita.tempo) receita.tempo = "45 min";

  if (!receita.ingredientes || !Array.isArray(receita.ingredientes)) {
    receita.ingredientes = ingredientes.map(ing => `quantidade de ${ing}`);
  }

  if (!receita.passos || !Array.isArray(receita.passos) || receita.passos.length === 0) {
    receita.passos = [
      "Prepare os ingredientes disponíveis",
      "Siga o método básico de preparação",
      "Ajuste conforme necessário",
      "Finalize e sirva"
    ];
  }

  if (!receita.adaptacoes || !Array.isArray(receita.adaptacoes)) {
    receita.adaptacoes = ["Adaptado aos ingredientes que tens disponível"];
  }

  return receita;
}

async function finalizeSession(session) {
  session.status = "COMPLETED";
  session.inStepMode = false;
  session.completedAt = new Date();
  await session.save();

  await History.create({
    user: session.userId._id || session.userId,
    type: "recipe",
    prompt: `Receita "${session.selectedRecipe.title}" concluída.`,
    response: session.selectedRecipe,
  });

  await NotificationService.createSecurityAlert(
    session.userId._id || session.userId,
    'Receita Concluída',
    `Parabéns! Você concluiu a receita "${session.selectedRecipe.title}"`
  );

  console.log("🎉 Receita finalizada e modo passo a passo desativado:", session.selectedRecipe.title);
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

  const actionMap = {
    'cortar|picar|fatiar|descascar|triturar|ralar': "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1024&q=80",
    'refogar|fritar|saltear|sauté|dourar': "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1024&q=80",
    'misturar|mexer|bater|amassar|incorporar': "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1024&q=80",
    'cozinhar|ferver|assar|grelhar|forno|cozer': "https://images.unsplash.com/photo-1556909114-b6f4a5d5a1e6?auto=format&fit=crop&w=1024&q=80",
    'temperar|salgar|adicionar|colocar|verter|medir': "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1024&q=80"
  };

  for (const [pattern, url] of Object.entries(actionMap)) {
    if (new RegExp(pattern).test(stepLower)) {
      return url;
    }
  }

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

// ==================== CHAT LIVRE INTELIGENTE ====================

function detectarIntencao(mensagem, session = null) {
  const msg = mensagem.toLowerCase().trim();

  if (session && session.inStepMode && session.status === "IN_PROGRESS") {
    return "step_question";
  }

  const pratosComuns = /calulu|moamba|mufete|funge|muamba|quizaca|kitaba|arroz de|frango|peixe|carne|bolo|sopa/i;
  if (msg.match(/quero fazer|vou fazer|fazer|preparar|cozinhar/i) && msg.match(pratosComuns)) {
    return "specific_dish";
  }

  const ingredientesComuns = /frango|peixe|carne|arroz|feijão|tomate|cebola|alho|batata|mandioca|ovo|farinha/i;
  if ((msg.match(/tenho|tem|disponível|aqui tem|há/i) && msg.match(ingredientesComuns)) ||
    (msg.split(',').length >= 2 && msg.match(ingredientesComuns))) {
    return "recipe_ingredients";
  }

  if (msg.match(/como|quanto tempo|pode|posso|devo|dica|dúvida|o que é|significa|serve/i)) {
    return "cooking_question";
  }

  if (msg.match(/vamos cozinhar|quero cozinhar|começar|iniciar receita|nova receita/i)) {
    return "start_recipe";
  }

  return "conversational";
}

/**
 * 💬 CHAT LIVRE
 */
exports.chatLivre = async (req, res) => {
  try {
    const { mensagem, sessionId, language, contexto, historico } = req.body;
    const langInstruction = getLanguageInstruction(language);

    // Mapa de contexto por categoria 
    const contextMap = {
      'cocktails': 'O utilizador veio da secção de Cocktails. Foca em cocktails, bebidas especiais e mocktails. Pergunta que tipo de cocktail quer, para que ocasião e se tem alguma restrição.',
      'vegetariano': 'O utilizador é vegetariano ou vegano. Todas as sugestões devem ser plant-based, sem carne nem peixe. Pergunta que tipo de receitas prefere e os seus objetivos nutricionais.',
      'receitas_rapidas': 'O utilizador quer receitas muito rápidas (menos de 20 minutos). Sugere pratos simples e práticos. Pergunta quantas pessoas são e o que tem disponível em casa.',
      'saude': 'O utilizador está focado em saúde e nutrição. Sugere receitas equilibradas, com poucos processados. Pergunta os seus objetivos de saúde.',
      'economico': 'O utilizador tem orçamento reduzido. Sugere receitas baratas com ingredientes comuns. Pergunta quantas pessoas são e o que costuma ter em casa.',
      'tecnicas': 'O utilizador quer aprender técnicas culinárias profissionais. Explica técnicas de forma clara e progressiva. Pergunta o seu nível actual na cozinha.',
      'mood': 'O utilizador quer uma receita baseada no seu estado de espírito. Pergunta como se sente hoje e o que procura (conforto, energia, celebração, etc).',
      'topRated': 'O utilizador quer descobrir receitas populares e bem avaliadas. Sugere pratos clássicos e bem executados. Pergunta as suas preferências de cozinha.',
      'sazonal': 'O utilizador quer usar ingredientes da época. Pergunta onde vive para saber a estação do ano e que ingredientes tem disponíveis.',
    };
    const contextoExtra = contexto ? (contextMap[contexto] || '') : '';

    console.log("💬 CHAT LIVRE:", {
      mensagem: mensagem?.substring(0, 100),
      sessionId: sessionId || 'sem sessão',
      userId: req.user._id,
      language
    });

    if (!mensagem || typeof mensagem !== 'string' || mensagem.trim().length === 0) {
      return res.status(400).json({
        error: "Mensagem vazia ou inválida",
        dica: "Envie uma mensagem válida no campo 'mensagem'"
      });
    }

    const userPrefs = await getUserPreferencesForBot(req.user._id);
    console.log("🎯 Preferências encontradas:", userPrefs.hasPreferences ? "SIM" : "NÃO");

    if (userPrefs.hasPreferences) {
      console.log("📋 Restrições:", userPrefs.restrictionsText);
    }

    let session = null;
    if (sessionId) {
      try {
        session = await RecipeSession.findById(sessionId);
      } catch (err) {
        console.log("⚠️ Sessão não encontrada, mas continua...");
      }
    }

    const intencao = detectarIntencao(mensagem, session);
    console.log(`🎯 INTENÇÃO DETECTADA: ${intencao}`);

    if (intencao === "step_question") {
      console.log("🔀 REDIRECIONANDO: pergunta sobre passo");
      req.body.pergunta = mensagem;
      return exports.perguntaPasso(req, res);
    }

    if (intencao === "specific_dish") {
      console.log("🔀 REDIRECIONANDO: desejo de prato");
      const pratoMatch = mensagem.match(/(calulu|moamba|mufete|funge|muamba|quizaca|kitaba|arroz de \w+|frango \w+|peixe \w+|carne \w+|bolo de \w+)/i);
      const pratoDesejado = pratoMatch ? pratoMatch[0] : mensagem.replace(/quero fazer|vou fazer|fazer|preparar|cozinhar/gi, '').trim();
      req.body.pratoDesejado = pratoDesejado;
      return exports.handleDesejoPrato(req, res);
    }

    if (intencao === "recipe_ingredients") {
      console.log("🔀 REDIRECIONANDO: gerar opções de receita");
      const ingredientes = mensagem
        .replace(/tenho|tem|disponível|aqui tem|há|e|,/gi, ',')
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 2);
      req.body.ingredients = ingredientes.join(', ');
      return exports.generateOptions(req, res);
    }

    let promptContext = "";

    if (userPrefs.hasPreferences) {
      promptContext = `
📋 RESTRIÇÕES ALIMENTARES DO USUÁRIO QUE DEVEM SER RESPEITADAS:
${userPrefs.restrictionsText}

IMPORTANTE: Todas as suas respostas devem considerar estas restrições:
1. NUNCA sugerir alimentos ou receitas que contenham ingredientes às quais o usuário tem alergia
2. SEMPRE adaptar sugestões para as dietas do usuário
3. Considerar os objetivos nutricionais mencionados
4. Se o usuário perguntar sobre receita com ingrediente proibido, explicar porquê não pode sugerir
5. Oferecer alternativas seguras e compatíveis

`;
    }

    if (session && session.status === "COMPLETED") {
      promptContext += `
CONTEXTO: Usuário acabou de concluir a receita "${session.selectedRecipe?.title}"
`;
    } else if (session && session.status === "SELECTED") {
      promptContext += `
CONTEXTO: Usuário tem receita "${session.selectedRecipe?.title}" selecionada mas não iniciou os passos
`;
    }

    // ── Constrói mensagens com histórico real para o GROQ (NOVO) ──────────────
    const mensagensParaGroq = [];

    // System message com contexto da categoria + preferências do utilizador
    const systemContent = [
      `Você é o BOMPITEU, assistente culinário angolano inteligente e amigável.`,
      contextoExtra,
      userPrefs.hasPreferences ? `RESTRIÇÕES DO UTILIZADOR: ${userPrefs.restrictionsText}` : '',
      `REGRAS: Seja natural e conversacional. Nunca uses emojis. Máximo 4 frases por resposta.`,
      `Se o utilizador mencionar ingrediente proibido (alergia), avisa gentilmente e sugere alternativa.`,
      `Só entra em modo de receita quando o utilizador pedir explicitamente.`,
      langInstruction,
    ].filter(Boolean).join(' ');

    mensagensParaGroq.push({ role: 'system', content: systemContent });

    // Adiciona histórico real da conversa (se existir)
    if (Array.isArray(historico) && historico.length > 0) {
      historico.forEach(msg => {
        if (msg.role && msg.content && typeof msg.content === 'string') {
          mensagensParaGroq.push({ role: msg.role, content: msg.content });
        }
      });
    }

    // Mensagem actual do utilizador
    mensagensParaGroq.push({ role: 'user', content: mensagem });

    // Chama o GROQ directamente com o array de mensagens
    const axios = require('axios');
    const groqResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: mensagensParaGroq,
        temperature: 0.75,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 25000
      }
    );

    const respostaNatural = groqResponse.data.choices[0].message.content;
    // ─────────────────────────────────────────────────────────────────────────

    let contextoExtra2 = null;
    if (session && session.status === "SELECTED") {
      contextoExtra2 = {
        temReceitaPendente: true,
        receita: session.selectedRecipe?.title,
        mensagem: "Você tem uma receita pronta para começar! Quer iniciar os passos?"
      };
    }

    res.json({
      tipo: "chat_livre",
      intencao: intencao,
      resposta: respostaNatural,           // ← usa a nova variável
      temPreferencias: userPrefs.hasPreferences,
      preferenciasResumo: userPrefs.restrictionsText || null,
      contextoReceita: contextoExtra2,
      sessionId: session?._id || null
    });

  } catch (err) {
    console.error("❌ ERRO chatLivre:", err);
    res.status(500).json({
      error: "Erro ao processar chat",
      details: err.message
    });
  }
};

/**
 * 🔄 OBTER STATUS DA SESSÃO ATUAL
 */
exports.getSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.json({
        temSessao: false,
        mensagem: "Nenhuma sessão ativa"
      });
    }

    const session = await RecipeSession.findById(sessionId);

    if (!session) {
      return res.json({
        temSessao: false,
        mensagem: "Sessão não encontrada"
      });
    }

    res.json({
      temSessao: true,
      sessionId: session._id,
      status: session.status,
      inStepMode: session.inStepMode || false,
      receita: session.selectedRecipe?.title || null,
      passoAtual: session.currentStep || 0,
      totalPassos: session.selectedRecipe?.steps?.length || 0,
      categoria: session.category || 'geral'
    });

  } catch (err) {
    console.error("❌ ERRO getSessionStatus:", err);
    res.status(500).json({
      error: "Erro ao buscar status da sessão",
      details: err.message
    });
  }
};

/**
 * Inicia uma sessão de cozinha guiada a partir de uma Observação
 */
exports.iniciarDeObservacao = async (userId, observacao) => {
  try {
    console.log("📦 Criando sessão guiada a partir da observação:", observacao._id);

    const recipeData = observacao.recipeData;
    if (!recipeData) throw new Error("Observação não contém dados de receita");

    const steps = (recipeData.steps || []).map((desc, index) => ({
      stepNumber: index + 1,
      description: desc
    }));

    const session = await RecipeSession.create({
      userId: userId,
      sourceText: `Observação: ${recipeData.title || "Receita"}`,
      sourceImage: observacao.imageUrl || null,
      status: "SELECTED",
      category: "observacao",
      selectedRecipe: {
        title: recipeData.title || "Receita da Observação",
        ingredients: recipeData.ingredients || [],
        steps: steps,
        time: recipeData.time || "30-45 min",
        difficulty: recipeData.difficulty || "Média"
      },
      identifiedIngredients: recipeData.ingredients || [],
      recipeOptions: [{
        title: recipeData.title || "Receita da Observação",
        description: recipeData.description || "Receita guardada",
        ingredients: (recipeData.ingredients || []).slice(0, 5),
        difficulty: recipeData.difficulty || "Média",
        time: recipeData.time || "30-45 min"
      }],
      currentStep: 0,
      inStepMode: false,
      recipeFinalImage: observacao.imageUrl || null
    });

    console.log("✅ Sessão guiada criada com ID:", session._id);
    return session;
  } catch (error) {
    console.error("❌ Erro ao criar sessão guiada da observação:", error);
    throw error;
  }
};

exports.criarSessaoDeReceita = async (req, res) => {
  try {
    const { titulo, descricao, ingredientes, passos, tempo, dificuldade, imagemUrl } = req.body;
    const userId = req.user._id;

    if (!titulo || !ingredientes || !passos) {
      return res.status(400).json({ error: "Título, ingredientes e passos são obrigatórios" });
    }

    const steps = passos.map((desc, index) => ({
      stepNumber: index + 1,
      description: desc
    }));

    const session = await RecipeSession.create({
      userId,
      sourceText: `Criado a partir de perfil: ${titulo}`,
      status: "SELECTED",
      category: "perfil",
      selectedRecipe: {
        title: titulo,
        ingredients: ingredientes,
        steps: steps,
        time: tempo || "30 min",
        difficulty: dificuldade || "Média"
      },
      identifiedIngredients: ingredientes,
      recipeOptions: [{
        title: titulo,
        description: descricao || titulo,
        ingredients: ingredientes.slice(0, 5),
        difficulty: dificuldade || "Média",
        time: tempo || "30 min"
      }],
      currentStep: 0,
      inStepMode: false,
      recipeFinalImage: imagemUrl || null
    });

    res.json({
      success: true,
      sessionId: session._id,
      message: "Sessão criada com sucesso"
    });

  } catch (err) {
    console.error("❌ Erro ao criar sessão:", err);
    res.status(500).json({ error: "Erro ao criar sessão", details: err.message });
  }
};

/**
 * 📄 Analisa documento e gera 3 opções de receita
 */
exports.documentOptions = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Nenhum documento enviado" });
    }

    const userId = req.user?._id || req.user?.id;
    const language = req.body.language || req.headers['accept-language'] || 'pt';
    const langInstruction = getLanguageInstruction(language);

    let textoExtraido = "";
    const mime = file.mimetype;
    const buffer = file.buffer;

    if (mime === "application/pdf") {
      const pdfParse = require("pdf-parse");
      const parsed = await pdfParse(buffer);
      textoExtraido = parsed.text?.trim() || "";

    } else if (
      mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mime === "application/msword"
    ) {
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      textoExtraido = result.value?.trim() || "";

    } else if (mime === "text/plain") {
      textoExtraido = buffer.toString("utf-8").trim();

    } else {
      return res.status(415).json({ error: "Formato não suportado. Usa PDF, DOCX ou TXT." });
    }

    if (!textoExtraido || textoExtraido.length < 20) {
      return res.status(422).json({ error: "Não foi possível extrair texto do documento." });
    }

    const textoLimitado = textoExtraido.slice(0, 4000);

    console.log("📄 Documento recebido:", file.originalname, "| chars:", textoLimitado.length);

    const prompt = `Analisa este documento e extrai ou sugere 3 receitas culinárias baseadas no seu conteúdo.

DOCUMENTO:
${textoLimitado}

Responde APENAS com JSON válido neste formato exacto, sem texto adicional:
{
  "options": [
    {
      "title": "Nome da Receita",
      "description": "Descrição curta apetitosa (1-2 frases)",
      "difficulty": "Fácil",
      "time": "30 min",
      "ingredients": ["ingrediente 1", "ingrediente 2", "ingrediente 3"]
    },
    {
      "title": "Nome da Receita 2",
      "description": "Descrição curta",
      "difficulty": "Média",
      "time": "45 min",
      "ingredients": ["ingrediente 1", "ingrediente 2"]
    },
    {
      "title": "Nome da Receita 3",
      "description": "Descrição curta",
      "difficulty": "Fácil",
      "time": "25 min",
      "ingredients": ["ingrediente 1", "ingrediente 2"]
    }
  ]
}

${langInstruction}

Se o documento não tiver receitas, sugere receitas relacionadas com os temas ou ingredientes mencionados.`;

    const aiResponse = await callOpenAIText(
      prompt,
      null,
      `És um chef profissional que extrai e sugere receitas a partir de documentos. Respondes sempre em JSON válido. ${langInstruction}`
    );

    let options = [];
    try {
      const jsonMatch = aiResponse.raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        options = (parsed.options || []).slice(0, 3);
      }
    } catch (parseErr) {
      console.log("❌ Parse error documentOptions, fallback");
      options = [
        { title: "Receita do Documento 1", description: "Baseada no conteúdo enviado", difficulty: "Média", time: "30 min" },
        { title: "Receita do Documento 2", description: "Baseada no conteúdo enviado", difficulty: "Fácil", time: "25 min" },
        { title: "Receita do Documento 3", description: "Baseada no conteúdo enviado", difficulty: "Difícil", time: "50 min" }
      ];
    }

    if (!options.length) {
      return res.status(422).json({ error: "Não encontrei receitas no documento." });
    }

    const session = await RecipeSession.create({
      userId,
      sourceText: `[Documento: ${file.originalname}]\n${textoLimitado.slice(0, 500)}`,
      recipeOptions: options,
      identifiedIngredients: options.flatMap(o => o.ingredients || []).slice(0, 10),
      status: "OPTIONS",
      category: "document"
    });

    console.log("✅ documentOptions sessão criada:", session._id, "| opções:", options.map(o => o.title));

    return res.json({
      sessionId: session._id.toString(),
      options,
      documentName: file.originalname,
      message: `Encontrei ${options.length} receitas no teu documento!`
    });

  } catch (err) {
    console.error("❌ documentOptions error:", err);
    return res.status(500).json({ error: "Erro ao processar documento: " + err.message });
  }
};

/**
 * 📸 Identifica o prato na foto e cria sessão com receita completa
 */
exports.identifyDish = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Nenhuma imagem enviada" });
    }

    const userId = req.user?._id || req.user?.id;
    const language = req.body.language || req.headers['accept-language'] || 'pt';
    const langInstruction = getLanguageInstruction(language);

    console.log("📸 identify-dish: a analisar imagem...");

    const imageBase64 = `data:image/jpeg;base64,${file.buffer.toString("base64")}`;

    const identifyPrompt = `Analisa esta imagem de comida com muito detalhe.

TAREFA:
1. Identifica EXACTAMENTE qual prato está na imagem (nome específico, ex: "Moamba de Galinha", "Frango Assado com Batatas", "Calulu de Peixe")
2. Se não conseguires identificar com certeza, dá o teu melhor palpite com base no aspecto

Responde APENAS com JSON válido:
{
  "dishName": "Nome Específico do Prato",
  "confidence": "alta|média|baixa",
  "description": "Breve descrição do prato (1 frase)",
  "cuisine": "angolana|portuguesa|internacional|desconhecida",
  "mainIngredients": ["ingrediente1", "ingrediente2", "ingrediente3"]
}

${langInstruction}`;

    const identifyResponse = await callOpenAIText(
      identifyPrompt,
      imageBase64,
      `És um especialista em gastronomia capaz de identificar qualquer prato a partir de uma foto. Respondes sempre em JSON válido. ${langInstruction}`
    );

    let dishInfo;
    try {
      const jsonMatch = identifyResponse.raw.match(/\{[\s\S]*\}/);
      dishInfo = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      dishInfo = null;
    }

    const dishName = dishInfo?.dishName || "Prato Identificado";
    console.log("✅ Prato identificado:", dishName, "| confiança:", dishInfo?.confidence);

    const userPrefs = await getUserPreferencesForBot(userId);

    const recipePromptText = `Cria uma receita COMPLETA e DETALHADA para: "${dishName}"

${dishInfo?.mainIngredients?.length ? `Ingredientes identificados na foto: ${dishInfo.mainIngredients.join(", ")}` : ""}
${dishInfo?.description ? `Descrição: ${dishInfo.description}` : ""}
${userPrefs.hasPreferences ? `\nRestrições do utilizador: ${userPrefs.restrictionsText}` : ""}

Responde APENAS com JSON válido:
{
  "title": "${dishName}",
  "description": "Descrição apetitosa do prato",
  "ingredients": [
    "500g de ingrediente principal",
    "2 cebolas médias",
    "3 dentes de alho",
    "Sal e pimenta a gosto",
    "Azeite para refogar"
  ],
  "steps": [
    { "stepNumber": 1, "description": "Passo detalhado 1..." },
    { "stepNumber": 2, "description": "Passo detalhado 2..." },
    { "stepNumber": 3, "description": "Passo detalhado 3..." },
    { "stepNumber": 4, "description": "Passo detalhado 4..." },
    { "stepNumber": 5, "description": "Passo detalhado 5..." },
    { "stepNumber": 6, "description": "Passo detalhado 6..." }
  ],
  "time": "XX minutos",
  "difficulty": "Fácil|Média|Difícil",
  "tips": ["Dica 1", "Dica 2"]
}

Gera pelo menos 5-8 passos detalhados.

${langInstruction}`;

    const recipeResponse = await callOpenAIText(
      recipePromptText,
      null,
      `És um chef profissional que cria receitas detalhadas e práticas para fazer em casa. ${langInstruction}`
    );

    let recipeData;
    try {
      const jsonMatch = recipeResponse.raw.match(/\{[\s\S]*\}/);
      recipeData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      recipeData = null;
    }

    if (!recipeData || !recipeData.steps?.length) {
      recipeData = {
        title: dishName,
        description: dishInfo?.description || `Receita tradicional de ${dishName}`,
        ingredients: dishInfo?.mainIngredients?.map(i => `Quantidade adequada de ${i}`) || [
          "500g de ingrediente principal",
          "2 cebolas", "3 dentes de alho", "Sal e pimenta", "Azeite"
        ],
        steps: [
          { stepNumber: 1, description: "Prepare e lave todos os ingredientes" },
          { stepNumber: 2, description: "Pique a cebola e o alho finamente" },
          { stepNumber: 3, description: "Aqueça o azeite e refogue a cebola e o alho até dourarem" },
          { stepNumber: 4, description: "Adicione o ingrediente principal e tempere com sal e pimenta" },
          { stepNumber: 5, description: "Cozinhe em fogo médio por 20-25 minutos, mexendo ocasionalmente" },
          { stepNumber: 6, description: "Rectifique os temperos e sirva quente" }
        ],
        time: "45 minutos",
        difficulty: "Média"
      };
    }

    console.log("✅ Receita gerada:", recipeData.title, "| passos:", recipeData.steps.length);

    let finalImageUrl = null;
    try {
      console.log("🎨 Gerando imagem final do prato identificado...");
      const tempImageUrl = await callOpenAIImage(
        "",
        recipeData.title,
        recipeData.description || dishInfo?.description || "Prato bem apresentado",
        true
      );
      if (tempImageUrl) {
        finalImageUrl = await require("../services/storageService").ensurePermanentImageUrl(
          tempImageUrl,
          recipeData.title,
          "final-dish"
        );
        console.log("✅ Imagem final salva:", finalImageUrl);
      }
    } catch (imgErr) {
      console.log("❌ Imagem final falhou, usando fallback:", imgErr.message);
      finalImageUrl = getFallbackFinalImage(dishName);
    }

    const session = await RecipeSession.create({
      userId,
      sourceText: `Identificado por foto: ${dishName}`,
      sourceImageUrl: null,
      status: "SELECTED",
      category: dishInfo?.cuisine === "angolana" ? "angolan" : "international",
      selectedRecipe: {
        title: recipeData.title,
        ingredients: recipeData.ingredients || [],
        steps: recipeData.steps.map((s, i) => ({
          stepNumber: s.stepNumber || i + 1,
          description: s.description
        })),
        time: recipeData.time || "45 min",
        difficulty: recipeData.difficulty || "Média"
      },
      recipeOptions: [{
        title: recipeData.title,
        description: recipeData.description,
        ingredients: (recipeData.ingredients || []).slice(0, 5),
        difficulty: recipeData.difficulty || "Média",
        time: recipeData.time || "45 min"
      }],
      identifiedIngredients: recipeData.ingredients || [],
      recipeFinalImage: finalImageUrl,
      currentStep: 0,
      inStepMode: false
    });

    console.log("✅ Sessão criada:", session._id);

    return res.json({
      success: true,
      sessionId: session._id.toString(),
      dishName: recipeData.title,
      confidence: dishInfo?.confidence || "média",
      cuisine: dishInfo?.cuisine || "desconhecida",
      recipe: {
        title: recipeData.title,
        description: recipeData.description,
        ingredients: recipeData.ingredients || [],
        steps: recipeData.steps.map((s, i) => ({
          stepNumber: s.stepNumber || i + 1,
          description: s.description
        })),
        time: recipeData.time || "45 min",
        difficulty: recipeData.difficulty || "Média"
      },
      finalImage: finalImageUrl,
      podeIniciarPassoAPasso: true,
      totalPassos: recipeData.steps.length,
      mensagemInicio: `Receita de "${recipeData.title}" pronta! Vamos começar?`
    });

  } catch (err) {
    console.error("❌ identifyDish error:", err);
    return res.status(500).json({
      error: "Erro ao identificar o prato",
      details: err.message
    });
  }
};
/**
 * 🌍 Inicia receita internacional direto ao passo a passo
 * Recebe nome da receita + país, gera receita completa e cria sessão pronta
 */
exports.iniciarReceitaDireta = async (req, res) => {
  try {
    const { nomeReceita, pais, language } = req.body;
    const userId = req.user._id;
    const langInstruction = getLanguageInstruction(language);

    if (!nomeReceita) {
      return res.status(400).json({ error: "nomeReceita é obrigatório" });
    }

    console.log(`🌍 Iniciando receita direta: "${nomeReceita}" de ${pais || 'origem desconhecida'}`);

    const userPrefs = await getUserPreferencesForBot(userId);

    // Gera receita completa com passos detalhados
    const prompt = `
Cria uma receita COMPLETA, AUTÊNTICA e DETALHADA para: "${nomeReceita}"
País de origem: ${pais || 'Internacional'}

${userPrefs.hasPreferences ? `
RESTRIÇÕES DO UTILIZADOR:
${userPrefs.restrictionsText}
` : ''}

RESPONDE APENAS com JSON válido:
{
  "title": "${nomeReceita}",
  "description": "Descrição apetitosa (1-2 frases)",
  "ingredients": [
    "200g de ingrediente (quantidade + unidade)",
    "..."
  ],
  "steps": [
    { "stepNumber": 1, "description": "Passo detalhado..." },
    { "stepNumber": 2, "description": "..." }
  ],
  "time": "XX minutos",
  "difficulty": "Fácil|Média|Difícil",
  "tips": ["Dica 1", "Dica 2"]
}

Gera entre 6 e 9 passos detalhados.
${langInstruction}
`;

    const aiResponse = await callOpenAIText(
      prompt, null,
      `Você é um chef especialista em culinária internacional. ${langInstruction}`
    );

    let recipeData;
    try {
      const jsonMatch = aiResponse.raw.match(/\{[\s\S]*\}/);
      recipeData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      recipeData = null;
    }

    // Fallback se o parse falhar
    if (!recipeData || !recipeData.steps?.length) {
      recipeData = {
        title: nomeReceita,
        description: `Receita autêntica de ${nomeReceita}`,
        ingredients: ["Ingredientes a confirmar"],
        steps: [
          { stepNumber: 1, description: "Prepare os ingredientes" },
          { stepNumber: 2, description: "Siga a técnica tradicional" },
          { stepNumber: 3, description: "Finalize e sirva" }
        ],
        time: "45 min",
        difficulty: "Média"
      };
    }

    recipeData = validateAndCompleteRecipe(recipeData, nomeReceita);

    // Gera imagem final
    let finalImageUrl = null;
    try {
      const tempImageUrl = await callOpenAIImage(
        "", recipeData.title,
        recipeData.description || "Prato bem apresentado",
        true
      );
      if (tempImageUrl) {
        finalImageUrl = await require("../services/storageService").ensurePermanentImageUrl(
          tempImageUrl, recipeData.title, 'final-dish'
        );
      }
    } catch (imgErr) {
      console.log("❌ Imagem falhou, fallback:", imgErr.message);
      finalImageUrl = getFallbackFinalImage(nomeReceita);
    }

    // Cria sessão pronta para passo a passo
    const session = await RecipeSession.create({
      userId,
      sourceText: `Receita internacional: ${nomeReceita} (${pais || 'Internacional'})`,
      status: "SELECTED",
      category: "international",
      selectedRecipe: {
        title: recipeData.title,
        ingredients: recipeData.ingredients || [],
        steps: recipeData.steps.map((s, i) => ({
          stepNumber: s.stepNumber || i + 1,
          description: s.description
        })),
        time: recipeData.time,
        difficulty: recipeData.difficulty
      },
      recipeOptions: [{
        title: recipeData.title,
        description: recipeData.description,
        ingredients: (recipeData.ingredients || []).slice(0, 5),
        difficulty: recipeData.difficulty,
        time: recipeData.time
      }],
      identifiedIngredients: recipeData.ingredients || [],
      recipeFinalImage: finalImageUrl,
      currentStep: 0,
      inStepMode: false
    });

    console.log("✅ Sessão receita direta criada:", session._id);

    res.json({
      success: true,
      sessionId: session._id.toString(),
      receita: {
        title: recipeData.title,
        description: recipeData.description,
        ingredients: recipeData.ingredients || [],
        steps: recipeData.steps.map((s, i) => ({
          stepNumber: s.stepNumber || i + 1,
          description: s.description
        })),
        time: recipeData.time,
        difficulty: recipeData.difficulty
      },
      finalImage: finalImageUrl,
      podeIniciarPassoAPasso: true,
      mensagemInicio: `Receita de "${recipeData.title}" pronta! Vamos cozinhar?`,
      totalPassos: recipeData.steps.length,
      pais: pais || 'Internacional'
    });

  } catch (err) {
    console.error("❌ ERRO iniciarReceitaDireta:", err);
    res.status(500).json({ error: "Erro ao preparar receita", details: err.message });
  }
};