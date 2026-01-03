const OpenAI = require("openai");
const { saveMessage } = require("../services/messageService");
const Message = require("../models/Message");
// Inicializa o OpenAI com a chave do .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.handleChat = async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ error: "Mensagem e userId são obrigatórios." });
    }

    // 1️⃣ Busca histórico do MongoDB
    const history = await Message.find({ userId })
      .sort({ createdAt: 1 })
      .limit(20)
      .select("role content -_id");

    // 2️⃣ Mensagens enviadas à OpenAI
    const messages = [
      {
        role: "system",
        content: "Você é um Chef IA especializado em receitas. Responda de forma clara e prática."
      },
      ...history,
      {
        role: "user",
        content: message
      }
    ];

    // 3️⃣ Salva mensagem do usuário
    await saveMessage({
      userId,
      role: "user",
      content: message
    });

    // 4️⃣ Chamada OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 500
    });

    const reply = response.choices[0].message.content;

    // 5️⃣ Salva resposta da IA
    await saveMessage({
      userId,
      role: "assistant",
      content: reply,
      model: "gpt-3.5-turbo"
    });

    return res.json({ reply });
  } catch (error) {
    console.error("Erro no chat:", error);
    return res.status(500).json({ error: error.message });
  }
};

const { uploadToCloudflare } = require("../services/storageService");
const { analyzeFoodImage } = require("../services/visionService");

exports.handleImageChat = async (req, res) => {
  try {
    const { userId, prompt } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Imagem não enviada" });
    }

    // 1️⃣ Upload no Cloudflare R2
    const imageUrl = await uploadToCloudflare(
      req.file.buffer,
      req.file.originalname,
      "recipes"
    );

    // 2️⃣ Análise Vision (SÓ URL)
    const analysis = await analyzeFoodImage(
      imageUrl,
      prompt || "Analisar ingredientes da imagem"
    );

    return res.json({
      imageUrl,
      reply: analysis.notes,
      canAdvance: analysis.canAdvance,
      state: analysis.state
    });

  } catch (err) {
    console.error("IMAGE CHAT ERROR:", err);
    res.status(500).json({ error: "Erro ao processar imagem" });
  }
};
