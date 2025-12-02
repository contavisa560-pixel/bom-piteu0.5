// routes/openaiChat.js
const express = require("express");
const router = express.Router();
const client = require("../services/openai"); // Cliente OpenAI

router.post("/chat", async (req, res) => {
try {
const { messages } = req.body; // Recebe array de mensagens do frontend


if (!messages || !Array.isArray(messages) || messages.length === 0) {
  return res.status(400).json({ error: "missing_message" });
}

const systemPrompt = `


Tu és o SmartChef IA — assistente de cozinha profissional, amigável e rápido.
Adapta-te ao utilizador se o perfil for fornecido.
`;


// Constrói array de mensagens para a OpenAI
const openaiMessages = [
  { role: "system", content: systemPrompt },
  ...messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }))
];

// Chama OpenAI
const completion = await client.chat.completions.create({
  model: "gpt-4.1-mini",
  messages: openaiMessages,
  max_tokens: 600,
  temperature: 0.7
});

const reply = completion.choices?.[0]?.message?.content || "Erro ao gerar resposta.";

res.json({ reply });


} catch (err) {
console.error("GPT ERROR:", err);
res.status(500).json({ error: "Erro GPT", details: err.message });
}
});

module.exports = router;
