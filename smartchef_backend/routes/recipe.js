const express = require("express");
const router = express.Router();
const openai = require("../services/openai");

router.post("/", async (req, res) => {
  try {
    const { ingredients, profile } = req.body;

    const prompt = `
Gere uma receita deliciosa baseada nestes ingredientes:
${ingredients.join(", ")}

Perfil do utilizador:
Dieta: ${profile.diet}
Alergias: ${profile.allergies}
Objetivo: ${profile.goal}
País: ${profile.country}

Formato:
- Título
- Ingredientes
- Modo de preparo
    `;

    const out = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "Tu és um chef especialista." },
        { role: "user", content: prompt }
      ]
    });

    res.json({
      recipe: out.choices[0].message.content
    });

  } catch (err) {
    console.error("RECIPE ERROR:", err);
    res.status(500).json({ error: "Erro IA Receitas" });
  }
});

module.exports = router;
