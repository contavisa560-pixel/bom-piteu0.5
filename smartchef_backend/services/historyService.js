// services/historyService.js
const ChatSession = require("../models/ChatSession");
const Message = require("../models/Message");
const { uploadToCloudflare } = require("./storageService");

class HistoryService {
  /**
   * Processa imagem para o Cloudflare R2 antes de guardar
   */
  async processImageForHistory(imageBuffer, originalName, userId) {
    try {
      if (!imageBuffer || typeof imageBuffer === 'string') {
        if (imageBuffer?.startsWith('http')) return imageBuffer;
        if (imageBuffer?.startsWith('data:')) {
          const base64Data = imageBuffer.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          return await uploadToCloudflare(buffer, `history-${Date.now()}.jpg`, 'chat-history');
        }
        return null;
      }
      return await uploadToCloudflare(
        imageBuffer,
        originalName || `history-${Date.now()}.jpg`,
        'chat-history'
      );
    } catch (error) {
      console.error("Erro ao processar imagem para histórico:", error);
      return null;
    }
  }

  /**
   * Extrai URLs do Cloudflare das mensagens
   */
  extractCloudflareUrls(messages) {
    const urls = new Set();
    messages.forEach(msg => {
      const candidates = [
        msg.imageUrl, msg.finalImage, msg.image,
        msg.step?.imageUrl, msg.metadata?.imageUrl
      ];
      candidates.forEach(url => {
        if (url && (url.includes('r2.cloudflarestorage.com') || url.includes(process.env.R2_PUBLIC_URL || ''))) {
          urls.add(url);
        }
      });
    });
    return Array.from(urls);
  }

  /**
   * Normaliza uma mensagem para garantir que todos os campos são guardados
   * Esta função é o coração da correção — preserva a estrutura visual completa
   */
  normalizeMessageForStorage(msg) {
    // Campos base sempre presentes
    const normalized = {
      type:      msg.type      || 'bot',
      content:   msg.content   || '',
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
    };

    // ── Imagens ──────────────────────────────────────────
    if (msg.image)      normalized.image      = msg.image;
    if (msg.imageUrl)   normalized.imageUrl   = msg.imageUrl;
    if (msg.finalImage) normalized.finalImage = msg.finalImage;
    if (msg.thumbnailUrl) normalized.thumbnailUrl = msg.thumbnailUrl;

    // ── Passo de cozinha (type: "cooking-step") ──────────
    if (msg.step) {
      normalized.step = {
        stepNumber:  msg.step.stepNumber,
        description: msg.step.description,
        imageUrl:    msg.step.imageUrl || null
      };
    }
    if (msg.progress)   normalized.progress   = msg.progress;
    if (msg.totalSteps) normalized.totalSteps = msg.totalSteps;

    // ── Opções de receita ─────────────────────────────────
    if (msg.options !== undefined && msg.options !== null) {
      normalized.options = msg.options;
    }

    // ── Receita criada (type: "receita_criada") ───────────
    if (msg.receita) normalized.receita = msg.receita;
    if (msg.podeIniciarPassoAPasso !== undefined) {
      normalized.podeIniciarPassoAPasso = msg.podeIniciarPassoAPasso;
    }
    if (msg.mensagemInicio) normalized.mensagemInicio = msg.mensagemInicio;
    if (msg.totalPassos)    normalized.totalPassos    = msg.totalPassos;
    if (msg.sessionId)      normalized.sessionId      = msg.sessionId;

    // ── Receita concluída (type: "recipe-completed") ──────
    if (msg.recipeTitle)        normalized.recipeTitle        = msg.recipeTitle;
    if (msg.ingredientsUsed)    normalized.ingredientsUsed    = msg.ingredientsUsed;
    if (msg.cookingTime)        normalized.cookingTime        = msg.cookingTime;
    if (msg.difficulty)         normalized.difficulty         = msg.difficulty;
    if (msg.showConfetti !== undefined) normalized.showConfetti = msg.showConfetti;
    if (msg.showRating !== undefined)   normalized.showRating   = msg.showRating;
    if (msg.showShare !== undefined)    normalized.showShare    = msg.showShare;
    if (msg.showFavorite !== undefined) normalized.showFavorite = msg.showFavorite;
    if (msg.showDownload !== undefined) normalized.showDownload = msg.showDownload;

    // ── Outros campos contextuais ─────────────────────────
    if (msg.ingredientesUtilizados) normalized.ingredientesUtilizados = msg.ingredientesUtilizados;
    if (msg.ingredients)            normalized.ingredients            = msg.ingredients;
    if (msg.isLoading !== undefined) normalized.isLoading             = msg.isLoading;

    // ── Metadata (compatibilidade) ────────────────────────
    if (msg.metadata) normalized.metadata = msg.metadata;

    return normalized;
  }

  /**
   * Cria ou actualiza uma sessão completa
   * Chamado por historyController.saveSession
   */
  async createOrUpdateSession(userId, sessionId, sessionData = {}) {
    try {
      const mongoose = require('mongoose');

      // Converte userId para ObjectId se for string válida
      const userIdObj = mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : userId;

      const rawMessages    = sessionData.messages || [];
      const normalizedMsgs = rawMessages.map(m => this.normalizeMessageForStorage(m));
      const cloudflareUrls = this.extractCloudflareUrls(normalizedMsgs);

      // Garante que sessionId é sempre string (pode chegar como ObjectId do MongoDB)
      const sessionIdStr = String(sessionId);

      let session = await ChatSession.findOne({ sessionId: sessionIdStr, userId: userIdObj });

      // Fallback: tenta pelo _id se sessionId parece ObjectId
      if (!session && mongoose.Types.ObjectId.isValid(sessionIdStr)) {
        session = await ChatSession.findOne({
          _id: new mongoose.Types.ObjectId(sessionIdStr),
          userId: userIdObj
        });
      }

      if (session) {
        // ── Actualiza sessão existente ──────────────────
        session.title       = sessionData.title    || session.title;
        session.category    = sessionData.category || session.category;
        session.messages    = normalizedMsgs;
        session.chatState   = sessionData.chatState   || session.chatState  || {};
        session.uiState     = sessionData.uiState     || session.uiState    || {};
        session.recipeData  = sessionData.recipeData  || sessionData.chatState?.recipe || session.recipeData;
        session.status      = sessionData.status   || session.status;
        session.version     = '3.0';
        session.lastActivity = new Date();

        session.statistics = {
          messageCount: normalizedMsgs.length,
          imageCount:   cloudflareUrls.length,
          recipeSteps:  sessionData.statistics?.recipeSteps || session.statistics?.recipeSteps || 0,
          duration:     sessionData.statistics?.duration    || session.statistics?.duration    || 0
        };

        session.storageInfo = {
          totalImages:      cloudflareUrls.length,
          estimatedStorage: cloudflareUrls.length * 200 * 1024,
          cloudflareUrls
        };
      } else {
        // ── Cria nova sessão ────────────────────────────
        session = await ChatSession.create({
          userId:   userIdObj,
          sessionId: sessionIdStr,
          title:    sessionData.title    || "Nova Conversa Culinária",
          category: sessionData.category || "general",
          messages: normalizedMsgs,
          chatState:  sessionData.chatState  || {},
          uiState:    sessionData.uiState    || {},
          recipeData: sessionData.recipeData || sessionData.chatState?.recipe || null,
          status:  sessionData.status  || "active",
          version: '3.0',
          lastActivity: new Date(),
          statistics: {
            messageCount: normalizedMsgs.length,
            imageCount:   cloudflareUrls.length,
            recipeSteps:  sessionData.statistics?.recipeSteps || 0,
            duration:     sessionData.statistics?.duration    || 0
          },
          storageInfo: {
            totalImages:      cloudflareUrls.length,
            estimatedStorage: cloudflareUrls.length * 200 * 1024,
            cloudflareUrls
          }
        });
      }

      return session;
    } catch (error) {
      console.error("Erro ao criar/actualizar sessão:", error);
      throw error;
    }
  }

  /**
   * Busca histórico do utilizador com filtros e paginação
   */
  async getUserHistory(userId, options = {}) {
    const mongoose = require('mongoose');
    const userIdObj = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const { page = 1, limit = 20, category, search, status, fromDate, toDate } = options;

    const query = { userId: userIdObj };
    if (category) query.category = category;
    if (status)   query.status   = status;
    if (search)   query.title    = { $regex: search, $options: 'i' };
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate)   query.createdAt.$lte = new Date(toDate);
    }

    const skip = (page - 1) * limit;
    const [sessions, total] = await Promise.all([
      ChatSession.find(query)
        .sort({ lastActivity: -1 })
        .skip(skip)
        .limit(limit)
        .select('sessionId title category status statistics storageInfo chatState recipeData createdAt lastActivity version')
        .lean(),
      ChatSession.countDocuments(query)
    ]);

    return {
      sessions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  /**
   * Busca sessão completa (com mensagens) para restaurar no chat
   * Procura pelo campo sessionId (string) OU pelo _id do MongoDB
   */
  async getSessionDetail(sessionId, userId) {
    const mongoose = require('mongoose');
    const userIdObj = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    // 1. Pelo campo sessionId (string customizada ex: "chat_xxx")
    let session = await ChatSession.findOne({ sessionId, userId: userIdObj }).lean();

    // 2. Se não encontrou e parece ObjectId, tenta pelo _id do Mongo
    if (!session && mongoose.Types.ObjectId.isValid(sessionId)) {
      session = await ChatSession.findOne({
        _id: new mongoose.Types.ObjectId(sessionId),
        userId: userIdObj
      }).lean();
    }

    // 3. Fallback sem userId (sessões antigas)
    if (!session) {
      session = await ChatSession.findOne({ sessionId }).lean();
    }
    if (!session && mongoose.Types.ObjectId.isValid(sessionId)) {
      session = await ChatSession.findOne({ _id: new mongoose.Types.ObjectId(sessionId) }).lean();
    }

    if (!session) throw new Error("Sessão não encontrada");

    // Garante que messages é sempre um array
    if (!Array.isArray(session.messages)) session.messages = [];

    console.log(`📦 getSessionDetail: "${session.title}" | ${session.messages.length} msgs | chatState: ${!!session.chatState}`);
    return session;
  }

  /**
   * Deleta sessão e mensagens relacionadas
   */
  async deleteSession(sessionId, userId) {
    const mongoose = require('mongoose');
    const userIdObj = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    const result = await ChatSession.deleteOne({ sessionId, userId: userIdObj });
    await Message.deleteMany({ sessionId });
    return result;
  }

  async exportSession(sessionId, userId, format = 'json') {
    const session = await this.getSessionDetail(sessionId, userId);
    if (format === 'html') return this.generateHTML(session);
    return session;
  }

  generateHTML(session) {
    const messages = (session.messages || []).map(msg => {
      const sender  = msg.type === 'user' ? 'Você' : 'Chef IA';
      const imgHtml = msg.imageUrl || msg.finalImage || msg.image
        ? `<img src="${msg.imageUrl || msg.finalImage || msg.image}" style="max-width:300px;border-radius:8px;margin:10px 0;"/>`
        : '';
      return `<div style="margin:15px 0;padding:10px;background:${msg.type === 'user' ? '#e3f2fd' : '#f5f5f5'};border-radius:8px;">
        <strong>${sender}:</strong><p>${msg.content || ''}</p>${imgHtml}
        <small style="color:#666;">${new Date(msg.timestamp).toLocaleString('pt-PT')}</small></div>`;
    }).join('');
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${session.title}</title>
      <style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px}h1{color:#ff5722}</style>
      </head><body><h1>${session.title}</h1>
      <p><strong>Data:</strong> ${new Date(session.createdAt).toLocaleDateString('pt-PT')}</p>
      <p><strong>Categoria:</strong> ${session.category}</p><hr/>${messages}</body></html>`;
  }

  async getSessionImages(sessionId, userId) {
    const mongoose = require('mongoose');
    const userIdObj = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
    const session = await ChatSession.findOne({ sessionId, userId: userIdObj });
    if (!session) return [];

    const images = [];
    (session.messages || []).forEach(msg => {
      const candidates = [
        { url: msg.image,      type: 'user-upload' },
        { url: msg.imageUrl,   type: 'step' },
        { url: msg.finalImage, type: 'final' }
      ];
      candidates.forEach(({ url, type }) => {
        if (url) images.push({ url, type, timestamp: msg.timestamp, metadata: msg.metadata });
      });
    });

    return images;
  }

  /**
   * Calcula estatísticas globais do utilizador
   */
  async getStatistics(userId) {
    const mongoose = require('mongoose');
    const userIdObj = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const [sessions, completedSessions] = await Promise.all([
      ChatSession.find({ userId: userIdObj }).select('statistics status').lean(),
      ChatSession.countDocuments({ userId: userIdObj, status: 'completed' })
    ]);

    const totalMessages = sessions.reduce((sum, s) => sum + (s.statistics?.messageCount || 0), 0);
    const totalImages   = sessions.reduce((sum, s) => sum + (s.statistics?.imageCount   || 0), 0);
    const totalDuration = sessions.reduce((sum, s) => sum + (s.statistics?.duration     || 0), 0);

    return {
      totalSessions:    sessions.length,
      totalMessages,
      totalImages,
      completedRecipes: completedSessions,
      avgDuration:      sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0
    };
  }

  async cleanupSessionImages(sessionId) {
    console.log(`Cleanup da sessão ${sessionId} — imagens mantidas no Cloudflare`);
    return true;
  }
}

module.exports = new HistoryService();