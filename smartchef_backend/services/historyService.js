const ChatSession = require("../models/ChatSession");
const Message = require("../models/Message");
const { uploadToCloudflare } = require("./storageService");

class HistoryService {
  /**
   * Processa e armazena imagem no Cloudflare antes de salvar
   */
  async processImageForHistory(imageBuffer, originalName, userId) {
    try {
      if (!imageBuffer || typeof imageBuffer === 'string') {
        if (imageBuffer?.startsWith('http')) {
          return imageBuffer;
        }
        if (imageBuffer?.startsWith('data:')) {
          const base64Data = imageBuffer.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          return await uploadToCloudflare(
            buffer,
            `history-${Date.now()}.jpg`,
            'chat-history'
          );
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
      if (msg.imageUrl?.includes('r2.cloudflarestorage.com') || 
          msg.imageUrl?.includes(process.env.R2_PUBLIC_URL)) {
        urls.add(msg.imageUrl);
      }
      if (msg.metadata?.imageUrl?.includes('r2.cloudflarestorage.com')) {
        urls.add(msg.metadata.imageUrl);
      }
    });
    
    return Array.from(urls);
  }

  /**
   * Calcula tamanho estimado de armazenamento
   */
  calculateStorageSize(messages) {
    let totalSize = 0;
    totalSize += messages.length * 50 * 1024;
    const imageCount = messages.filter(m => m.imageUrl).length;
    totalSize += imageCount * 200 * 1024;
    return totalSize;
  }

  /**
   * Cria ou atualiza sessão com suporte a Cloudflare
   */
  async createOrUpdateSession(userId, sessionId, sessionData = {}) {
    try {
      const cloudflareUrls = this.extractCloudflareUrls(sessionData.messages || []);
      const storageSize = this.calculateStorageSize(sessionData.messages || []);
      
      // Tenta encontrar sessão existente
      let session = await ChatSession.findOne({ sessionId, userId });
      
      if (session) {
        // Atualiza sessão existente
        session.title = sessionData.title || session.title;
        session.category = sessionData.category || session.category;
        session.messages = sessionData.messages || session.messages;
        session.recipeData = sessionData.recipeData || session.recipeData;
        session.status = sessionData.status || session.status;
        session.lastActivity = new Date();
        
        // Atualiza storage info
        session.storageInfo = {
          totalImages: cloudflareUrls.length,
          estimatedStorage: storageSize,
          cloudflareUrls
        };
        
        // Atualiza estatísticas
        session.statistics = {
          messageCount: sessionData.messages?.length || session.statistics?.messageCount || 0,
          imageCount: cloudflareUrls.length,
          recipeSteps: sessionData.statistics?.recipeSteps || session.statistics?.recipeSteps || 0,
          duration: sessionData.statistics?.duration || session.statistics?.duration || 0
        };
        
        await session.save();
      } else {
        // Cria nova sessão
        session = await ChatSession.create({
          userId,
          sessionId,
          title: sessionData.title || "Nova Conversa Culinária",
          category: sessionData.category || "general",
          messages: sessionData.messages || [],
          recipeData: sessionData.recipeData || null,
          status: sessionData.status || "active",
          lastActivity: new Date(),
          storageInfo: {
            totalImages: cloudflareUrls.length,
            estimatedStorage: storageSize,
            cloudflareUrls
          },
          statistics: {
            messageCount: sessionData.messages?.length || 0,
            imageCount: cloudflareUrls.length,
            recipeSteps: sessionData.statistics?.recipeSteps || 0,
            duration: sessionData.statistics?.duration || 0
          }
        });
      }
      
      return session;
    } catch (error) {
      console.error("Erro ao criar/atualizar sessão:", error);
      throw error;
    }
  }

  /**
   * Adiciona mensagem com suporte a imagens no Cloudflare
   */
  async addMessage(sessionId, messageData) {
    const session = await ChatSession.findOne({ sessionId });
    if (!session) {
      throw new Error(`Sessão ${sessionId} não encontrada`);
    }

    let cloudflareUrl = null;
    let thumbnailUrl = null;

    // Processa imagem se existir
    if (messageData.imageBuffer || messageData.imageBase64) {
      cloudflareUrl = await this.processImageForHistory(
        messageData.imageBuffer || messageData.imageBase64,
        messageData.imageName || `msg-${Date.now()}.jpg`,
        session.userId
      );
      
      if (cloudflareUrl) {
        thumbnailUrl = cloudflareUrl.replace('/chat-history/', '/chat-history/thumbnails/');
      }
    }

    const newMessage = {
      type: messageData.type,
      content: messageData.content || "",
      imageUrl: cloudflareUrl || messageData.imageUrl,
      thumbnailUrl: thumbnailUrl,
      metadata: {
        ...(messageData.metadata || {}),
        fileSize: messageData.fileSize,
        dimensions: messageData.dimensions
      },
      timestamp: messageData.timestamp || new Date()
    };

    // Atualiza estatísticas
    session.statistics.messageCount += 1;
    if (cloudflareUrl || messageData.imageUrl) {
      session.statistics.imageCount += 1;
      
      if (cloudflareUrl && !session.storageInfo.cloudflareUrls.includes(cloudflareUrl)) {
        session.storageInfo.cloudflareUrls.push(cloudflareUrl);
        session.storageInfo.totalImages += 1;
        session.storageInfo.estimatedStorage += 200 * 1024;
      }
    }

    if (messageData.metadata?.stepNumber) {
      session.statistics.recipeSteps = Math.max(
        session.statistics.recipeSteps,
        messageData.metadata.stepNumber
      );
    }

    session.messages.push(newMessage);
    
    if (messageData.metadata?.recipeTitle && !session.title.includes("Receita")) {
      session.title = `${messageData.metadata.recipeTitle} - ${session.title}`;
    }

    session.lastActivity = new Date();
    await session.save();
    return session;
  }

  /**
   * NOVO: Busca histórico do usuário com filtros e paginação
   */
  async getUserHistory(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      status,
      fromDate,
      toDate
    } = options;

    const query = { userId };

    // Filtros opcionais
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      ChatSession.find(query)
        .sort({ lastActivity: -1 })
        .skip(skip)
        .limit(limit)
        .select('sessionId title category status statistics storageInfo createdAt lastActivity')
        .lean(),
      ChatSession.countDocuments(query)
    ]);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * NOVO: Busca detalhes completos de uma sessão
   */
  async getSessionDetail(sessionId, userId) {
    const session = await ChatSession.findOne({ sessionId, userId }).lean();
    
    if (!session) {
      throw new Error("Sessão não encontrada");
    }

    return session;
  }

  /**
   * NOVO: Deleta uma sessão
   */
  async deleteSession(sessionId, userId) {
    const result = await ChatSession.deleteOne({ sessionId, userId });
    
    // Também deleta mensagens relacionadas
    await Message.deleteMany({ sessionId });
    
    return result;
  }

  /**
   * NOVO: Exporta sessão em diferentes formatos
   */
  async exportSession(sessionId, userId, format = 'json') {
    const session = await this.getSessionDetail(sessionId, userId);
    
    if (format === 'html') {
      return this.generateHTML(session);
    }
    
    return session;
  }

  /**
   * Gera HTML para exportação
   */
  generateHTML(session) {
    const messages = session.messages.map(msg => {
      const type = msg.type === 'user' ? 'Você' : 'Chef IA';
      const image = msg.imageUrl ? `<img src="${msg.imageUrl}" style="max-width:300px;border-radius:8px;margin:10px 0;"/>` : '';
      return `
        <div style="margin:15px 0;padding:10px;background:${msg.type === 'user' ? '#e3f2fd' : '#f5f5f5'};border-radius:8px;">
          <strong>${type}:</strong>
          <p>${msg.content}</p>
          ${image}
          <small style="color:#666;">${new Date(msg.timestamp).toLocaleString('pt-PT')}</small>
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${session.title}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #ff5722; }
        </style>
      </head>
      <body>
        <h1>${session.title}</h1>
        <p><strong>Data:</strong> ${new Date(session.createdAt).toLocaleDateString('pt-PT')}</p>
        <p><strong>Categoria:</strong> ${session.category}</p>
        <hr/>
        ${messages}
      </body>
      </html>
    `;
  }

  /**
   * Busca imagens de uma sessão (útil para galeria)
   */
  async getSessionImages(sessionId, userId) {
    const session = await ChatSession.findOne({ sessionId, userId });
    if (!session) return [];
    
    return session.messages
      .filter(msg => msg.imageUrl)
      .map(msg => ({
        url: msg.imageUrl,
        thumbnail: msg.thumbnailUrl,
        type: msg.type,
        timestamp: msg.timestamp,
        metadata: msg.metadata
      }));
  }

  /**
   * Limpa imagens temporárias
   */
  async cleanupSessionImages(sessionId) {
    console.log(`Cleanup de imagens da sessão ${sessionId} - mantidas no Cloudflare`);
    return true;
  }
}

module.exports = new HistoryService();