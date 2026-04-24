const mongoose = require('mongoose');
const ChatSession = require('../models/ChatSession');
const Message = require('../models/Message');
const RecipeSession = require('../models/RecipeSession');
require('dotenv').config();

async function migrateHistory() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Conectado ao MongoDB");

  // Migra RecipeSessions para ChatSessions
  const recipeSessions = await RecipeSession.find({ status: "COMPLETED" })
    .populate('userId')
    .limit(1000);

  console.log(`Migrando ${recipeSessions.length} sessões de receitas...`);

  for (const rs of recipeSessions) {
    try {
      const sessionId = `recipe_${rs._id}`;
      
      // Verifica se já existe
      const exists = await ChatSession.findOne({ sessionId });
      if (exists) {
        console.log(`Sessão ${sessionId} já migrada, ignorando...`);
        continue;
      }

      // Cria mensagens baseadas na receita
      const messages = [];
      
      // Mensagem inicial (ingredientes)
      if (rs.sourceText) {
        messages.push({
          type: 'user',
          content: rs.sourceText,
          timestamp: rs.createdAt
        });
      } else if (rs.sourceImageUrl) {
        messages.push({
          type: 'user',
          content: 'Enviei uma foto dos ingredientes',
          imageUrl: rs.sourceImageUrl,
          timestamp: rs.createdAt
        });
      }

      // Opções de receita
      if (rs.recipeOptions && rs.recipeOptions.length > 0) {
        messages.push({
          type: 'bot',
          content: 'Aqui estão algumas receitas que podes fazer:',
          metadata: {
            options: rs.recipeOptions
          },
          timestamp: new Date(rs.createdAt.getTime() + 1000)
        });
      }

      // Receita selecionada
      if (rs.selectedRecipe) {
        messages.push({
          type: 'bot',
          content: `Vamos cozinhar: ${rs.selectedRecipe.title}`,
          metadata: {
            recipeTitle: rs.selectedRecipe.title,
            ingredients: rs.selectedRecipe.ingredients
          },
          timestamp: new Date(rs.createdAt.getTime() + 2000)
        });
      }

      // Cria a sessão no ChatSession
      await ChatSession.create({
        userId: rs.userId,
        sessionId,
        title: rs.selectedRecipe?.title || 'Receita Migrada',
        category: 'auto',
        messages,
        recipeData: rs.selectedRecipe ? {
          recipeId: rs._id,
          title: rs.selectedRecipe.title,
          ingredients: rs.selectedRecipe.ingredients,
          steps: rs.selectedRecipe.steps,
          finalImage: rs.recipeFinalImage,
          completed: true
        } : null,
        status: 'completed',
        statistics: {
          messageCount: messages.length,
          imageCount: rs.sourceImageUrl ? 1 : 0,
          recipeSteps: rs.selectedRecipe?.steps?.length || 0,
          duration: rs.completedAt ? 
            Math.round((rs.completedAt - rs.createdAt) / 60000) : 30
        },
        createdAt: rs.createdAt,
        updatedAt: rs.updatedAt
      });

      console.log(`Migrada: ${rs.selectedRecipe?.title || 'Receita sem nome'}`);
    } catch (err) {
      console.error(`Erro ao migrar sessão ${rs._id}:`, err.message);
    }
  }

  console.log("Migração completa!");
  process.exit(0);
}

migrateHistory().catch(console.error);