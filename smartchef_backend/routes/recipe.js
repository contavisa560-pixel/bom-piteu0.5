const express = require("express");
const router = express.Router();
const ai = require("../utils/openaiWrapper"); // Usando o seu wrapper central

router.post("/", async (req, res) => {
  try {
    const { ingredients, profile } = req.body;

    const prompt = `
      Crie uma receita baseada em: ${ingredients.join(", ")}.
      Perfil: Dieta ${profile.diet}, Alergias [${profile.allergies}], Objetivo ${profile.goal}, País ${profile.country}.

      RETORNE APENAS UM JSON com esta estrutura:
      {
        "title": "Nome da receita",
        "ingredients": [
          { "name": "alimento", "group": "vegetable|fruit|tuber|legume|protein|other", "vitamins": ["A", "C", "fiber"] }
        ],
        "steps": ["passo 1", "passo 2"],
        "nutrition": { "calories": 0, "fat": 0, "sugar": 0 },
        "healthAlert": "Aviso se houver algo fora do perfil"
      }
    `;

    const out = await ai.chat.completions.create({
      // Forçamos o modelo a responder em formato JSON
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Tu és um chef e nutricionista. Responde sempre em JSON." },
        { role: "user", content: prompt }
      ]
    });

    // Parse do conteúdo para enviar como objeto real, não como string
    const recipeData = JSON.parse(out.choices[0].message.content);

    res.json(recipeData);

  } catch (err) {
    console.error("RECIPE ERROR:", err);
    res.status(500).json({ error: "Erro ao gerar receita estruturada" });
  }
});

module.exports = router;