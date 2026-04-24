const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const sendStepImage = async ({ sessionId, imageUrl }) => {

  const response = await fetch("http://localhost:5000/recipe/session/image", {

    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ sessionId, imageUrl })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Erro imagem");
  }

  return response.json();
};
//funciona sem token