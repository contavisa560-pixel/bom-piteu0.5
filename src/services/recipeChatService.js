

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";


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