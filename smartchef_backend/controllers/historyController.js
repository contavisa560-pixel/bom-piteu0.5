// controllers/historyController.js
const historyService = require("../services/historyService");
const ChatSession = require("../models/ChatSession");

exports.getUserHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      page = 1, 
      limit = 20, 
      category, 
      search,
      status,
      from,
      to
    } = req.query;

    const result = await historyService.getUserHistory(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      search,
      status,
      fromDate: from,
      toDate: to
    });

    res.json(result);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    res.status(500).json({ 
      error: "Erro ao buscar histórico",
      sessions: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      }
    });
  }
};

exports.getSessionDetail = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId é obrigatório" });
    }

    const session = await historyService.getSessionDetail(sessionId, userId);
    
    if (!session) {
      return res.status(404).json({ error: "Sessão não encontrada" });
    }

    res.json(session);
  } catch (error) {
    console.error("Erro ao buscar detalhes da sessão:", error);
    res.status(404).json({ error: error.message || "Sessão não encontrada" });
  }
};

exports.exportSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { format = "json" } = req.query;
    const userId = req.user._id;

    const result = await historyService.exportSession(sessionId, userId, format);
    
    if (format === "html") {
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Content-Disposition", `attachment; filename="receita-${sessionId}.html"`);
      res.send(result);
    } else {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="receita-${sessionId}.json"`);
      res.json(result);
    }
  } catch (error) {
    console.error("Erro ao exportar sessão:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId é obrigatório" });
    }

    const result = await historyService.deleteSession(sessionId, userId);
    
    if (!result || result.deletedCount === 0) {
      return res.status(404).json({ error: "Sessão não encontrada" });
    }

    res.json({ 
      success: true, 
      message: "Sessão deletada com sucesso" 
    });
  } catch (error) {
    console.error("Erro ao deletar sessão:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const stats = await ChatSession.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalMessages: { $sum: "$statistics.messageCount" },
          totalImages: { $sum: "$statistics.imageCount" },
          completedRecipes: { 
            $sum: { 
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0] 
            } 
          },
          avgDuration: { $avg: "$statistics.duration" }
        }
      }
    ]);

    res.json(stats[0] || {
      totalSessions: 0,
      totalMessages: 0,
      totalImages: 0,
      completedRecipes: 0,
      avgDuration: 0
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ 
      totalSessions: 0,
      totalMessages: 0,
      totalImages: 0,
      completedRecipes: 0,
      avgDuration: 0
    });
  }
};

exports.saveSession = async (req, res) => {
  try {
    const sessionData = req.body;
    const userId = req.user._id;

    // Validações
    if (!sessionData.sessionId) {
      return res.status(400).json({ error: "sessionId é obrigatório" });
    }

    if (!sessionData.messages || !Array.isArray(sessionData.messages)) {
      sessionData.messages = [];
    }

    // Garante que todas as mensagens têm o formato correto
    sessionData.messages = sessionData.messages.map(msg => ({
      type: msg.type === "user" ? "user" : "bot",
      content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content || ""),
      imageUrl: msg.image || msg.imageUrl || msg.step?.imageUrl || msg.finalImage,
      metadata: {
        stepNumber: msg.step?.stepNumber,
        recipeTitle: msg.recipeTitle || sessionData.recipeData?.title,
        imageUrl: msg.image || msg.imageUrl || msg.step?.imageUrl
      },
      timestamp: msg.timestamp || new Date()
    }));

    const session = await historyService.createOrUpdateSession(
      userId,
      sessionData.sessionId,
      sessionData
    );

    res.json({
      success: true,
      sessionId: session.sessionId,
      message: "Sessão salva com sucesso"
    });
  } catch (error) {
    console.error("Erro ao salvar sessão:", error);
    res.status(500).json({ 
      success: false,
      error: "Erro ao salvar sessão no histórico" 
    });
  }
};

exports.quickSave = async (req, res) => {
  try {
    const sessionData = req.body;
    
    if (!sessionData.sessionId || !sessionData.userId) {
      return res.status(400).json({ error: "sessionId e userId são obrigatórios" });
    }

    await ChatSession.findOneAndUpdate(
      { 
        sessionId: sessionData.sessionId,
        userId: sessionData.userId
      },
      {
        title: sessionData.title,
        status: sessionData.status || 'interrupted',
        lastActivity: new Date()
      },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Erro no quick save:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getSessionImages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const images = await historyService.getSessionImages(sessionId, userId);
    res.json(images);
  } catch (error) {
    console.error("Erro ao buscar imagens:", error);
    res.status(500).json([]);
  }
};