const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function requestJson(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || data.message || "Request failed");
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

function authHeader(providedToken) {
  const token = providedToken || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Inicia sessão de receita
export async function startRecipeSession(recipeId, steps = []) {
  const url = `${API_URL}/api/recipe/session/start`;
  return await requestJson(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify({ recipeId, totalSteps: steps.length, steps }),
  });
}

// Envia texto para validação do passo (chat)
export async function sendTextMessage({ sessionId, content, token = null }) {
  if (!sessionId) throw new Error("sessionId is required");
  const url = `${API_URL}/api/recipe/session/message/text`;
  return await requestJson(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify({ sessionId, content }),
  });
}

// Envia imagem (dataURL ou URL) para validação do passo
export async function sendImageMessage({ sessionId, imageUrl, token = null }) {
  if (!sessionId) throw new Error("sessionId is required");
  const url = `${API_URL}/api/recipe/session/message/image`;
  return await requestJson(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify({ sessionId, imageUrl }),
  });
}

// Avança para o próximo passo da sessão
export async function advanceStep({ sessionId, token = null }) {
  if (!sessionId) throw new Error("sessionId is required");
  const url = `${API_URL}/api/recipe/session/advance`;
  return await requestJson(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify({ sessionId }),
  });
}