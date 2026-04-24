// src/utils/messageReconstructor.js

import { normalizeImageUrl } from './imageUtils';

/**
 * Reconstrói uma mensagem do histórico para o formato do chat
 */
export const reconstructMessage = (msg, sessionData, index) => {
  const messageId = `restored_${sessionData.sessionId}_${index}_${Date.now()}`;
  const baseMessage = {
    id: messageId,
    type: msg.type,
    content: msg.content || '',
    timestamp: new Date(msg.timestamp || Date.now())
  };

  // ============ 1. RECONSTRUIR IMAGENS ============
  if (msg.images) {
    if (msg.images.userImage) {
      baseMessage.image = normalizeImageUrl(msg.images.userImage);
    }
    if (msg.images.stepImage) {
      baseMessage.imageUrl = normalizeImageUrl(msg.images.stepImage);
    }
    if (msg.images.finalImage) {
      baseMessage.finalImage = normalizeImageUrl(msg.images.finalImage);
    }
  }

  // ============ 2. RECONSTRUIR PASSOS DE COZINHA ============
  if (msg.stepData || (msg.metadata && msg.metadata.stepNumber)) {
    return reconstructCookingStep(msg, baseMessage, sessionData);
  }

  // ============ 3. RECONSTRUIR OPÇÕES DE RECEITA ============
  if (msg.options || (msg.metadata && msg.metadata.options)) {
    return reconstructRecipeOptions(msg, baseMessage, sessionData);
  }

  // ============ 4. RECONSTRUIR RECEITA CRIADA ============
  if (msg.type === "receita_criada" || (msg.metadata && msg.metadata.recipeTitle)) {
    return reconstructCreatedRecipe(msg, baseMessage, sessionData);
  }

  // ============ 5. RECONSTRUIR CONCLUSÃO ============
  if (msg.type === "recipe-completed" || sessionData.recipeData?.completed) {
    return reconstructRecipeCompleted(msg, baseMessage, sessionData);
  }

  // ============ 6. RECONSTRUIR INÍCIO DE RECEITA ============
  if (msg.type === "simple-recipe-start" || (msg.content && msg.content.includes('Receitas IA'))) {
    return reconstructRecipeStart(msg, baseMessage, sessionData);
  }

  return baseMessage;
};

/**
 * Reconstrói um passo de cozinha com toda a interface
 */
const reconstructCookingStep = (msg, baseMessage, sessionData) => {
  const stepNumber = msg.stepData?.stepNumber || msg.metadata?.stepNumber || 1;
  const stepDescription = msg.stepData?.description || msg.metadata?.stepDescription || '';
  const stepImage = normalizeImageUrl(msg.stepData?.imageUrl || msg.images?.stepImage);
  
  baseMessage.type = "cooking-step";
  baseMessage.step = {
    stepNumber: stepNumber,
    description: stepDescription,
    imageUrl: stepImage
  };
  
  baseMessage.imageUrl = stepImage;
  baseMessage.totalSteps = msg.metadata?.totalSteps || 
                          sessionData.recipeData?.steps?.length || 
                          8;
  baseMessage.progress = msg.metadata?.progress || `${stepNumber}/${baseMessage.totalSteps}`;
  
  // Adicionar botão "Próximo Passo" se não for o último
  if (stepNumber < baseMessage.totalSteps) {
    baseMessage.hasNextButton = true;
    baseMessage.nextButtonText = "Próximo Passo";
  } else {
    baseMessage.hasCompleteButton = true;
    baseMessage.completeButtonText = "Finalizar Receita";
  }
  
  return baseMessage;
};

/**
 * Reconstrói opções de receita com botões
 */
const reconstructRecipeOptions = (msg, baseMessage, sessionData) => {
  baseMessage.type = "bot";
  baseMessage.options = msg.options || msg.metadata?.options || [];
  
  if (baseMessage.options.length > 0) {
    baseMessage.showOptions = true;
    baseMessage.optionType = "recipe-choices";
  }
  
  return baseMessage;
};

/**
 * Reconstrói receita criada com botão "Começar Passo a Passo"
 */
const reconstructCreatedRecipe = (msg, baseMessage, sessionData) => {
  baseMessage.type = "receita_criada";
  baseMessage.recipeTitle = msg.metadata?.recipeTitle || sessionData.title;
  baseMessage.finalImage = normalizeImageUrl(msg.images?.finalImage || sessionData.recipeData?.finalImage);
  
  // Recuperar dados da receita
  if (sessionData.recipeData) {
    baseMessage.recipe = {
      title: sessionData.recipeData.title,
      ingredients: sessionData.recipeData.ingredients || [],
      steps: sessionData.recipeData.steps || [],
      time: sessionData.recipeData.time || "45 min",
      difficulty: sessionData.recipeData.difficulty || "Média"
    };
  }
  
  // Botão para iniciar passo a passo
  baseMessage.podeIniciarPassoAPasso = true;
  baseMessage.mensagemInicio = "Quer começar o passo a passo com imagens?";
  baseMessage.totalPassos = baseMessage.recipe?.steps?.length || 0;
  baseMessage.sessionId = sessionData.sessionId;
  
  return baseMessage;
};

/**
 * Reconstrói conclusão de receita com botões de ação
 */
const reconstructRecipeCompleted = (msg, baseMessage, sessionData) => {
  baseMessage.type = "recipe-completed";
  baseMessage.recipeTitle = msg.metadata?.recipeTitle || sessionData.title;
  baseMessage.finalImage = normalizeImageUrl(msg.images?.finalImage || sessionData.recipeData?.finalImage);
  baseMessage.showConfetti = true;
  
  // Adicionar estatísticas se disponíveis
  if (sessionData.recipeData) {
    baseMessage.cookingTime = sessionData.recipeData.time || "45 min";
    baseMessage.difficulty = sessionData.recipeData.difficulty || "Média";
  }
  
  // Botões de ação
  baseMessage.showRating = true;
  baseMessage.showShare = true;
  baseMessage.showFavorite = true;
  baseMessage.showDownload = true;
  
  return baseMessage;
};

/**
 * Reconstrói início de receita com botão "Cozinhar Agora"
 */
const reconstructRecipeStart = (msg, baseMessage, sessionData) => {
  baseMessage.type = "simple-recipe-start";
  
  if (sessionData.recipeData) {
    baseMessage.finalImage = normalizeImageUrl(sessionData.recipeData.finalImage);
    baseMessage.ingredients = sessionData.recipeData.ingredients || [];
    baseMessage.hasCookButton = true;
    baseMessage.cookButtonText = "COZINHAR AGORA";
  }
  
  return baseMessage;
};

/**
 * Reconstrói TODAS as mensagens de uma sessão
 */
export const reconstructAllMessages = (sessionData) => {
  if (!sessionData || !sessionData.messages) return [];
  
  return sessionData.messages.map((msg, index) => 
    reconstructMessage(msg, sessionData, index)
  );
};