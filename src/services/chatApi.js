export async function sendChatMessage({ message, userId }) {
  const response = await fetch("http://localhost:5000/api/chat/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, userId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Fetch error from http://localhost:5000/api/chat:", errorData);
    throw new Error(errorData.error || "Erro ao enviar mensagem");
  }

  return await response.json();
}
