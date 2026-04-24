const { saveMessage } = require("../services/messageService");
const ChatSession = require("../models/ChatSession");
const Message = require("../models/Message");
const { openaiText } = require("../services/openaiClients");
const { uploadToCloudflare } = require("../services/storageService");
const { analyzeFoodImage } = require("../services/visionService");
const historyService = require("../services/historyService");

/**
 * Controlador principal do chat de texto
 */
exports.handleChat = async (req, res) => {
  try {
    const { message, userId, sessionId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ error: "Mensagem e userId são obrigatórios." });
    }

    // Define sessionId padrão se não fornecido
    const finalSessionId = sessionId || `chat_${userId}_${Date.now()}`;

    // 1️⃣ Busca histórico do MongoDB (últimas 20 mensagens)
    const history = await Message.find({ userId })
      .sort({ createdAt: 1 })
      .limit(20)
      .select("role content -_id");

    // 2️⃣ Mensagens enviadas à OpenAI
    const messages = [
      {
        role: "system",
        content: "Você é um Chef IA especializado em receitas angolanas e internacionais. Responda de forma clara, prática e amigável em português de Angola."
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
      content: message,
      sessionId: finalSessionId
    });

    // 4️⃣ Atualiza ou cria sessão no ChatSession
    await ChatSession.findOneAndUpdate(
      { sessionId: finalSessionId, userId },
      {
        sessionId: finalSessionId,
        userId,
        title: "Conversa com Chef IA",
        status: "active",
        lastActivity: new Date(),
        $push: {
          messages: {
            type: "user",
            content: message,
            timestamp: new Date()
          }
        }
      },
      { upsert: true, new: true }
    );

    // 5️⃣ Chamada OpenAI
    const response = await openaiText.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 500
    });

    const reply = response.choices[0].message.content;

    // 6️⃣ Salva resposta da IA
    await saveMessage({
      userId,
      role: "assistant",
      content: reply,
      model: "gpt-4o-mini",
      sessionId: finalSessionId
    });

    // 7️⃣ Atualiza sessão com resposta do bot
    await ChatSession.findOneAndUpdate(
      { sessionId: finalSessionId, userId },
      {
        $push: {
          messages: {
            type: "bot",
            content: reply,
            timestamp: new Date()
          }
        },
        lastActivity: new Date()
      }
    );

    return res.json({
      reply,
      sessionId: finalSessionId
    });
    
  } catch (error) {
    console.error("Erro no chat:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Controlador para chat com imagem
 */
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

    // 3️⃣ Salva no histórico automaticamente
    try {
      const sessionId = `img_${Date.now()}_${userId}`;
      await historyService.addMessage(sessionId, {
        userId,
        type: 'user',
        content: prompt || 'Enviei uma imagem',
        imageUrl: imageUrl,
        timestamp: new Date(),
        metadata: {
          messageType: 'image_upload',
          fileSize: req.file.size,
          dimensions: { width: 0, height: 0 }
        }
      });

      // Salva resposta da análise
      await historyService.addMessage(sessionId, {
        userId,
        type: 'bot',
        content: analysis.notes || "Imagem analisada com sucesso",
        timestamp: new Date(),
        metadata: {
          messageType: 'image_analysis',
          canAdvance: analysis.canAdvance,
          state: analysis.state
        }
      });
    } catch (historyError) {
      console.error("Erro ao salvar no histórico:", historyError);
      // Não falha a requisição principal
    }

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