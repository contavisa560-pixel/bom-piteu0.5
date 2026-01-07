const RecipeSession = require("../models/RecipeSession");
const OpenAI = require("openai");
const { buildStepPrompt } = require("../services/chefPrompt");
const { validateStep } = require("../services/stepValidator");
const { analyzeFoodImage } = require("../services/visionService");


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.startSession = async (req, res) => {
  const session = await RecipeSession.create({
    userId: req.user?._id || null,   //temporario ou seja, não usa o token
    recipeId: req.body.recipeId,
    totalSteps: req.body.totalSteps,
    steps: req.body.steps
  });

  res.json(session);
};

exports.sendText = async (req, res) => {


  console.log("=== REQUEST RECEBIDA ===");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("User:", req.user);


  const session = await RecipeSession.findOne({ sessionId: req.body.sessionId });
  
  if (!session) {
    return res.status(404).json({ error: "Sessão não encontrada" });
  }

  const step = session.steps[session.currentStep - 1];

  const prompt = buildStepPrompt(step);
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: req.body.content }
    ]
  });

  const chefReply = response.choices[0].message.content;
  step.chefFeedback = chefReply;
  step.validationStatus = validateStep(chefReply);
  step.userText = req.body.content;

  await session.save();
  res.json(step);
};

exports.sendImage = async (req, res) => {
  try {
    const { sessionId, imageUrl } = req.body;

    if (!sessionId || !imageUrl) {
      return res.status(400).json({ error: "sessionId e imageUrl são obrigatórios" });
    }   

    const session = await RecipeSession.findOne({ sessionId })
    if (!session) {
      return res.status(404).json({ error: "Sessão não encontrada" });
    }

    const step = session.steps[session.currentStep - 1];

    const stepContext = `
Objetivo: ${step.objective}
Ação esperada: ${step.expectedAction}
Visual esperado: ${step.expectedVisual}
    `.trim();

    // 🔥 VISÃO DECIDE
    const visionResult = await analyzeFoodImage(imageUrl, stepContext);

    step.userImageUrl = imageUrl;
    step.visionAnalysis = visionResult;
    step.chefFeedback = visionResult.notes;
    step.validationStatus = visionResult.canAdvance ? "VALID" : "INVALID";

    await session.save();

    return res.json({
      vision: visionResult,
      validationStatus: step.validationStatus,
      canAdvance: visionResult.canAdvance
    });
  } catch (err) {
    console.error("Erro sendImage:", err);
    res.status(500).json({ error: "Erro ao analisar imagem" });
  }
};


exports.advanceStep = async (req, res) => {
  const session = await RecipeSession.findOne({ sessionId })
  const step = session.steps[session.currentStep - 1];

  if (step.validationStatus !== "VALID") {
    return res.status(403).json({ error: "Passo não validado" });
  }

  session.currentStep += 1;
  await session.save();
  res.json(session);
};
