const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/*export const sendStepText = async ({ sessionId, content, token }) => {
  if (!token) {
    throw new Error("Token não fornecido. Faça login novamente.");
  }
  const response = await fetch(`${API_URL}/recipe/session/message/text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ sessionId, content })
  });

  if (response.status === 401) {
    throw new Error("Token inválido ou expirado");
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
  }

  return response.json();
};*/

export const sendStepText = async ({ sessionId, content }) => {
  const response = await fetch("http://localhost:5000/api/recipe/session/message/text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ sessionId, content })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro no chef");
  }

  return response.json();
};
//funciona sem token