// services/historyApi.js
const API_URL = import.meta.env.VITE_API_URL;

function authHeader() {
  const token = localStorage.getItem("bomPiteuUserToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Trata erros de forma consistente
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `Erro HTTP ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      // Se não conseguir parsear JSON, usa mensagem padrão
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
}

/**
 * Busca histórico de sessões do usuário
 */
export async function getChatHistory({ page = 1, limit = 20, ...filters }) {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v != null && v !== '')
      )
    });

    const response = await fetch(
      `${API_URL}/api/history/sessions?${queryParams}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeader()
        }
      }
    );

    return handleResponse(response);
  } catch (error) {
    console.error("Erro em getChatHistory:", error);
    
    // Retorna estrutura vazia em caso de erro
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
 * Busca detalhes de uma sessão específica
 */
export async function getSessionDetail(sessionId) {
  if (!sessionId) {
    throw new Error("sessionId é obrigatório");
  }

  const response = await fetch(
    `${API_URL}/api/history/sessions/${sessionId}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeader()
      }
    }
  );

  return handleResponse(response);
}

/**
 * Deleta uma sessão
 */
export async function deleteSession(sessionId) {
  if (!sessionId) {
    throw new Error("sessionId é obrigatório");
  }

  const response = await fetch(
    `${API_URL}/api/history/sessions/${sessionId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeader()
      }
    }
  );

  return handleResponse(response);
}

/**
 * Exporta sessão para formato específico
 */
export async function exportSession(sessionId, format = "json") {
  if (!sessionId) {
    throw new Error("sessionId é obrigatório");
  }

  const response = await fetch(
    `${API_URL}/api/history/sessions/${sessionId}/export?format=${format}`,
    {
      headers: {
        "Content-Type": format === "html" ? "text/html" : "application/json",
        ...authHeader()
      }
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao exportar sessão");
  }

  if (format === "html") {
    return response.text();
  }

  return response.json();
}

/**
 * Busca estatísticas do usuário
 */
export async function getHistoryStatistics() {
  try {
    const response = await fetch(
      `${API_URL}/api/history/statistics`,
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeader()
        }
      }
    );

    return handleResponse(response);
  } catch (error) {
    console.error("Erro em getHistoryStatistics:", error);
    
    // Retorna estatísticas vazias em caso de erro
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
 * Salva ou atualiza uma sessão
 */
export async function saveSession(sessionData) {
  if (!sessionData.sessionId) {
    throw new Error("sessionId é obrigatório");
  }

  const response = await fetch(
    `${API_URL}/api/history/save`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader()
      },
      body: JSON.stringify(sessionData)
    }
  );

  return handleResponse(response);
}

/**
 * Busca imagens de uma sessão
 */
export async function getSessionImages(sessionId) {
  if (!sessionId) {
    throw new Error("sessionId é obrigatório");
  }

  try {
    const response = await fetch(
      `${API_URL}/api/history/sessions/${sessionId}/images`,
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeader()
        }
      }
    );

    if (!response.ok) {
      return [];
    }

    const images = await response.json();
    return Array.isArray(images) ? images : [];
  } catch (error) {
    console.error("Erro em getSessionImages:", error);
    return [];
  }
}