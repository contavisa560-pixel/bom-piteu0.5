const express = require("express");
const router = express.Router();
const multer = require("multer");
const OpenAI = require("openai");

const upload = multer();

router.post("/", upload.single("audio"), async (req, res) => {
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 1 — Transcrever áudio
    const transcription = await client.audio.transcriptions.create({
      file: req.file.buffer,
      model: "gpt-4o-audio",
    });

    const text = transcription.text;

    // 2 — Enviar texto transcrito ao ChatGPT
    const chat = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: text }
      ],
    });

    res.json({
      success: true,
      transcript: text,
      reply: chat.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    res.json({ success: false, reply: "Erro ao processar o áudio." });
  }
});

module.exports = router;
