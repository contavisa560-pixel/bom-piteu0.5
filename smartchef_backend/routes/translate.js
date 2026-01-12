const express = require('express');
const router = express.Router();
const { callOpenAIText } = require('../services/openaiClients');

// POST /api/translate
router.post('/', async (req, res) => {
  try {
    const { text, targetLanguage = 'en' } = req.body;
    
    if (!text) return res.status(400).json({ error: 'Text required' });

    const prompt = `Traduza este texto culinário do português para inglês natural de receitas:

"${text}"

Responda APENAS com o texto traduzido, SEM explicações.`;

    const translation = await callOpenAIText(prompt);
    
    res.json({ 
      translatedText: translation.raw.trim(),
      original: text 
    });
    
  } catch (err) {
    console.error('Translate error:', err);
    res.status(500).json({ error: 'Translation failed' });
  }
});

module.exports = router;
