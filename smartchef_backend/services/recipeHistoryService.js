// services/recipeHistoryService.js
const mongoose = require("mongoose");
const RecipeSession = require("../models/RecipeSession");

class RecipeHistoryService {
    /**
     * Converte RecipeSession para formato de histórico
     */
    convertToHistoryFormat(recipeSession) {
        try {
            // 1. IDs únicos
            const sessionId = recipeSession._id ? recipeSession._id.toString() : `recipe_${Date.now()}`;

            // 2. Título da receita
            let title = "Receita sem título";
            if (recipeSession.selectedRecipe?.title) {
                title = recipeSession.selectedRecipe.title;
            } else if (recipeSession.recipeOptions?.[0]?.title) {
                title = `${recipeSession.recipeOptions[0].title} (Opção)`;
            } else if (recipeSession.sourceText) {
                const sourceText = recipeSession.sourceText.substring(0, 50);
                title = sourceText.includes('Desejo:')
                    ? sourceText.replace('Desejo:', '').trim()
                    : `Ingredientes: ${sourceText}`;
            }

            // 3. Construir mensagens
            const messages = [];

            // Mensagem inicial do usuário
            if (recipeSession.sourceText) {
                messages.push({
                    type: 'user',
                    content: recipeSession.sourceText,
                    timestamp: recipeSession.createdAt || new Date()
                });
            }

            // Imagem enviada pelo usuário (se houver)
            if (recipeSession.sourceImageUrl) {
                messages.push({
                    type: 'user',
                    content: 'Enviei uma foto dos ingredientes',
                    imageUrl: recipeSession.sourceImageUrl,
                    timestamp: recipeSession.createdAt || new Date()
                });
            }

            // Opções sugeridas (se houver)
            if (recipeSession.recipeOptions?.length > 0) {
                messages.push({
                    type: 'bot',
                    content: 'Receitas sugeridas:',
                    options: recipeSession.recipeOptions,
                    timestamp: recipeSession.updatedAt || new Date()
                });
            }

            // Receita selecionada
            if (recipeSession.selectedRecipe) {
                //  ADICIONAR RECEITA COM FORMATAÇÃO
                messages.push({
                    type: 'bot',
                    content: `**${recipeSession.selectedRecipe.title}**`, 
                    recipeData: recipeSession.selectedRecipe,
                    finalImage: recipeSession.recipeFinalImage,
                    timestamp: recipeSession.updatedAt || new Date()
                });

                //  ADICIONAR INGREDIENTES FORMATADOS
                if (recipeSession.selectedRecipe.ingredients?.length > 0) {
                    const ingredientsText = recipeSession.selectedRecipe.ingredients
                        .map(ing => `• ${ing}`)
                        .join('\n');

                    messages.push({
                        type: 'bot',
                        content: `**Ingredientes:**\n${ingredientsText}`,
                        timestamp: recipeSession.updatedAt || new Date()
                    });
                }

                //  ADICIONAR PASSOS FORMATADOS
                if (recipeSession.selectedRecipe.steps) {
                    recipeSession.selectedRecipe.steps.forEach(step => {
                        messages.push({
                            type: 'bot',
                            content: `**Passo ${step.stepNumber}:** ${step.description}`,
                            step: step,
                            timestamp: recipeSession.updatedAt || new Date()
                        });
                    });
                }
            }
            // Conclusão (se completada)
            if (recipeSession.status === 'COMPLETED') {
                messages.push({
                    type: 'bot',
                    content: `🎉 Receita "${recipeSession.selectedRecipe?.title || title}" concluída!`,
                    recipeCompleted: true,
                    finalImage: recipeSession.recipeFinalImage,
                    timestamp: recipeSession.completedAt || recipeSession.updatedAt || new Date()
                });
            }

            // 4. Retornar estrutura completa
            return {
                sessionId: sessionId,
                _id: sessionId,
                title: title,
                category: recipeSession.category || 'recipe',
                messages: messages,
                recipeData: recipeSession.selectedRecipe
                    ? {
                        ...recipeSession.selectedRecipe,
                        finalImage: recipeSession.recipeFinalImage
                    }
                    : null,
                statistics: {
                    messageCount: messages.length,
                    imageCount: messages.filter(m => m.imageUrl || m.step?.imageUrl || m.finalImage).length,
                    recipeSteps: recipeSession.selectedRecipe?.steps?.length || 0,
                    duration: recipeSession.completedAt && recipeSession.createdAt
                        ? Math.round((recipeSession.completedAt - recipeSession.createdAt) / 60000)
                        : 0
                },
                status: this.mapSessionStatus(recipeSession.status),
                createdAt: recipeSession.createdAt || new Date(),
                updatedAt: recipeSession.updatedAt || new Date(),
                lastActivity: recipeSession.updatedAt || recipeSession.createdAt || new Date()
            };

        } catch (error) {
            console.error("❌ Erro em convertToHistoryFormat:", error);
            return this.getSafeFallback(recipeSession);
        }
    }

    // Método auxiliar para fallback seguro
    getSafeFallback(recipeSession) {
        return {
            sessionId: recipeSession._id?.toString() || `error_${Date.now()}`,
            title: recipeSession.selectedRecipe?.title || recipeSession.recipeOptions?.[0]?.title || "Receita",
            category: 'recipe',
            messages: [],
            statistics: { messageCount: 0, imageCount: 0, recipeSteps: 0, duration: 0 },
            status: 'interrupted',
            createdAt: recipeSession.createdAt || new Date(),
            updatedAt: recipeSession.updatedAt || new Date(),
            lastActivity: new Date()
        };
    }

    mapSessionStatus(recipeStatus) {
        switch (recipeStatus) {
            case 'COMPLETED': return 'completed';
            case 'IN_PROGRESS': return 'active';
            case 'SELECTED': return 'active';
            case 'OPTIONS': return 'interrupted';
            default: return 'interrupted';
        }
    }
    // 🔥 ADICIONAR ESTA FUNÇÃO NA CLASSE (em recipeHistoryService.js)
    // Procure: class RecipeHistoryService { ... }

    /**
     * Formata conteúdo para o histórico
     */
    formatForHistory(content, context = '') {
        if (!content) return '';

        // Se já tem formatação, manter
        if (content.includes('**') || content.includes('*') || content.includes('•')) {
            return content;
        }

        // Formatar baseado no contexto
        switch (context) {
            case 'recipe_title':
                return `**${content}**`;

            case 'ingredients':
                if (Array.isArray(content)) {
                    return content.map(ing => `• ${ing}`).join('\n');
                }
                return content;

            case 'step':
                return `**Passo ${context.stepNumber}:** ${content}`;

            default:
                return content;
        }
    }

    /**
     * Busca histórico do usuário
     */
    async getUserHistory(userId, options = {}) {
        try {
            const { page = 1, limit = 20, search, status } = options;

            const query = { userId };

            // Filtros
            if (status === 'completed') {
                query.status = 'COMPLETED';
            } else if (status === 'active') {
                query.$or = [{ status: 'IN_PROGRESS' }, { status: 'SELECTED' }];
            }

            if (search) {
                query.$or = [
                    { 'selectedRecipe.title': { $regex: search, $options: 'i' } },
                    { sourceText: { $regex: search, $options: 'i' } },
                    { 'recipeOptions.title': { $regex: search, $options: 'i' } }
                ];
            }

            const skip = (page - 1) * limit;

            const [recipeSessions, total] = await Promise.all([
                RecipeSession.find(query)
                    .sort({ updatedAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                RecipeSession.countDocuments(query)
            ]);

            // Converte para formato de histórico
            const sessions = recipeSessions.map(session =>
                this.convertToHistoryFormat(session)
            );

            return {
                sessions,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error("Erro em getUserHistory:", error);
            return {
                sessions: [],
                pagination: {
                    page: 1,
                    limit: 20,
                    total: 0,
                    pages: 0
                }
            };
        }
    }

    /**
     * Busca detalhes de uma sessão
     */
    async getSessionDetail(sessionId, userId) {
        try {
            let recipeSession;

            if (mongoose.Types.ObjectId.isValid(sessionId)) {
                recipeSession = await RecipeSession.findOne({
                    _id: sessionId,
                    userId
                }).lean();
            } else {
                recipeSession = await RecipeSession.findOne({
                    $or: [
                        { sessionId: sessionId },
                        { 'selectedRecipe.recipeId': sessionId }
                    ],
                    userId
                }).lean();
            }

            if (!recipeSession) {
                throw new Error("Sessão não encontrada");
            }

            return this.convertToHistoryFormat(recipeSession);
        } catch (error) {
            console.error("Erro em getSessionDetail:", error);
            throw error;
        }
    }

    /**
     * Deleta uma sessão
     */
    async deleteSession(sessionId, userId) {
        try {
            let result;

            if (mongoose.Types.ObjectId.isValid(sessionId)) {
                result = await RecipeSession.deleteOne({
                    _id: sessionId,
                    userId
                });
            } else {
                result = await RecipeSession.deleteOne({
                    $or: [
                        { sessionId: sessionId },
                        { 'selectedRecipe.recipeId': sessionId }
                    ],
                    userId
                });
            }

            return result;
        } catch (error) {
            console.error("Erro em deleteSession:", error);
            return { deletedCount: 0 };
        }
    }

    /**
     * Busca estatísticas
     */
    async getStatistics(userId) {
        try {
            const stats = await RecipeSession.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: null,
                        totalSessions: { $sum: 1 },
                        completedRecipes: {
                            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] }
                        }
                    }
                }
            ]);

            // Contagem simples
            const allSessions = await RecipeSession.find({ userId }).lean();
            let totalMessages = 0;
            let totalImages = 0;

            allSessions.forEach(session => {
                if (session.sourceText) totalMessages += 2;
                if (session.sourceImage || session.sourceImageUrl) {
                    totalMessages += 2;
                    totalImages += 1;
                }
                if (session.recipeOptions?.length) totalMessages += 1;
                if (session.selectedRecipe) {
                    totalMessages += 1;
                    if (session.selectedRecipe.steps) {
                        totalMessages += session.selectedRecipe.steps.length;
                    }
                }
            });

            return stats[0] ? {
                totalSessions: stats[0].totalSessions,
                totalMessages,
                totalImages,
                completedRecipes: stats[0].completedRecipes,
                avgDuration: 15
            } : {
                totalSessions: 0,
                totalMessages: 0,
                totalImages: 0,
                completedRecipes: 0,
                avgDuration: 0
            };
        } catch (error) {
            console.error("Erro em getStatistics:", error);
            return {
                totalSessions: 0,
                totalMessages: 0,
                totalImages: 0,
                completedRecipes: 0,
                avgDuration: 0
            };
        }
    }

    /**
     * Salva nova sessão
     */
    async saveSession(userId, sessionData) {
        try {
            let recipeSession = await RecipeSession.findOne({
                $or: [
                    { sessionId: sessionData.sessionId },
                    { 'selectedRecipe.recipeId': sessionData.sessionId }
                ],
                userId
            });

            if (recipeSession) {
                if (sessionData.recipeData) {
                    recipeSession.selectedRecipe = sessionData.recipeData;
                }
                recipeSession.status = sessionData.status === 'completed' ? 'COMPLETED' :
                    sessionData.status === 'active' ? 'IN_PROGRESS' : 'SELECTED';
                recipeSession.updatedAt = new Date();
                await recipeSession.save();
            } else {
                recipeSession = await RecipeSession.create({
                    userId,
                    sourceText: sessionData.messages?.find(m => m.type === 'user')?.content || '',
                    selectedRecipe: sessionData.recipeData || null,
                    status: sessionData.status === 'completed' ? 'COMPLETED' :
                        sessionData.status === 'active' ? 'IN_PROGRESS' : 'SELECTED',
                    updatedAt: new Date()
                });
            }

            return {
                success: true,
                sessionId: recipeSession._id.toString(),
                message: "Sessão salva com sucesso"
            };
        } catch (error) {
            console.error("Erro em saveSession:", error);
            throw error;
        }
    }

}

module.exports = new RecipeHistoryService();