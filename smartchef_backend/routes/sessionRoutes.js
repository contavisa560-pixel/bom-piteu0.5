const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/security/jwtAuth");
const authService = require("../services/authService");

// ==================== GET - Sessões Ativas ====================
router.get("/sessions", authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const currentToken = req.headers.authorization?.split(" ")[1];
    
    // Obter sessões ativas
    const sessions = await authService.getActiveSessions(userId);
    
    // Marcar a sessão atual
    const sessionsWithCurrent = sessions.map(session => ({
      ...session,
      current: session.token.includes(currentToken?.substring(0, 10))
    }));
    
    res.json({
      success: true,
      sessions: sessionsWithCurrent,
      total: sessionsWithCurrent.length
    });
  } catch (error) {
    console.error("Erro ao buscar sessões:", error);
    res.status(500).json({ 
      success: false, 
      error: "Erro ao buscar sessões" 
    });
  }
});

// ==================== DELETE - Revogar Sessão Específica ====================
router.delete("/sessions/:sessionId", authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { sessionId } = req.params;
    
    await authService.revokeSession(userId, sessionId);
    
    res.json({
      success: true,
      message: "Sessão revogada com sucesso"
    });
  } catch (error) {
    console.error("Erro ao revogar sessão:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Erro ao revogar sessão" 
    });
  }
});

// ==================== POST - Revogar Outras Sessões ====================
router.post("/sessions/revoke-others", authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const currentToken = req.headers.authorization?.split(" ")[1];
    
    if (!currentToken) {
      return res.status(400).json({
        success: false,
        error: "Token não fornecido"
      });
    }
    
    await authService.revokeOtherSessions(userId, currentToken);
    
    res.json({
      success: true,
      message: "Todas as outras sessões foram terminadas"
    });
  } catch (error) {
    console.error("Erro ao revogar outras sessões:", error);
    res.status(500).json({ 
      success: false, 
      error: "Erro ao revogar sessões" 
    });
  }
});

module.exports = router;