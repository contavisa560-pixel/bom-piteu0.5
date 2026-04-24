export function mapHistorySessionToChatState(sessionDetail) {
  console.log("🔄 Mapeando sessão do histórico:", sessionDetail.title);

  // Normaliza mensagens (o principal problema)
  const messages = Array.isArray(sessionDetail.messages) 
    ? sessionDetail.messages.map(msg => ({
        id: msg._id || msg.id || Date.now() + Math.random(),
        role: msg.role || (msg.type === 'user' ? 'user' : 'assistant'),
        type: msg.messageType || msg.type || 'text',
        content: msg.content || '',
        imageUrl: msg.imageUrl || msg.metadata?.imageUrl || null,
        metadata: msg.metadata || {},
        step: msg.metadata?.recipeStep ? { stepNumber: msg.metadata.recipeStep } : null,
        timestamp: msg.createdAt || new Date().toISOString(),
      }))
    : [];

  // Estado da receita
  const recipe = sessionDetail.chatState?.recipe || 
                sessionDetail.selectedRecipe || 
                sessionDetail.recipeData || null;

  return {
    messages,
    recipe,
    currentStep: sessionDetail.chatState?.currentStep || sessionDetail.currentStep || 0,
    sessionId: sessionDetail.sessionId,
    title: sessionDetail.title || 'Sessão sem título',
    status: sessionDetail.status || 'active',
  };
}
