export async function sendChatMessage({ message, token }) {
  const response = await fetch("http://localhost:5000/api/chat/text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Fetch error from /api/chat:", data);
    throw new Error(data.error || "Erro ao enviar mensagem");
  }

  return data;
}
