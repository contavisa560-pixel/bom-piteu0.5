const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/*export async function sendStepImage({ sessionId, imageUrl, token }) {
 
  const res = await fetch(`${API_URL}/recipe/session/image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ sessionId, imageUrl })
  });
  
  if (res.status === 401) {
    throw new Error("Token inválido ou expirado");
  }
  
  if (!res.ok) throw new Error("Erro ao enviar imagem");
  return res.json();
}
  */

export const sendStepImage = async ({ sessionId, imageUrl }) => {
  const response = await fetch("http://localhost:5000/api/recipe/session/image", {
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