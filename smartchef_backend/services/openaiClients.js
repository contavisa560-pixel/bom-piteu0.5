//const OpenAI = require("openai");

/**
 * Clientes separados por função
 */
/*const openaiText = new OpenAI({
  apiKey: process.env.OPENAI_TEXT_KEY,
});

const openaiImage = new OpenAI({
  apiKey: process.env.OPENAI_IMAGE_KEY,
});

const openaiVision = new OpenAI({
  apiKey: process.env.OPENAI_VISION_KEY,
});

/**
 * Prompt único e central do SmartChef
 */
/*const BASE_PROMPT = `
Tu és um assistente culinário inteligente.

Tarefa:
1. Analisa cuidadosamente os  fornecidos (texto, imagem ou áudio).
2. Assume que o utilizador quer cozinhar apenas ou principalmente com esses ingredientes.
3. Sugere exatamente 3 receitas possíveis.

Regras para as 3 receitas:
- Simples ingredientes
- Práticas
- Adequadas para cozinhar em casa
- Não inventes ingredientes complexos
- Mostra apenas:
  • Nome da receita
  • Descrição curta (1 linha)

No final pergunta exatamente:
"Qual receita queres preparar? Responde com 1, 2 ou 3."

---

Quando o utilizador escolher a receita:

Gera uma receita completa e organizada com:
1. Nome da receita
2. Tempo estimado
3. Lista de ingredientes
4. Passos numerados e claros (máximo 6)

Não comeces o passo a passo ainda.
No final pergunta:
"Queres começar a preparar agora? Responde: sim ou vamos."

---

Quando o utilizador disser "sim" ou "vamos":

Gere APENAS o passo atual da receita, de forma detalhada, clara e útil.

Requisitos obrigatórios:
- Descrever exatamente o que o utilizador deve fazer neste passo
- Explicar brevemente o porquê da ação quando isso evitar erro
- Incluir tempo aproximado, intensidade do fogo ou sinais visuais de controlo
- Linguagem profissional, simples e direta
- Não mencionar o nome da receita
- Não listar próximos passos
- Não repetir passos anteriores
- Não usar emojis
- Não usar listas ou numeração
- Texto em 4 a 8 frases no máximo

Formato:
Parágrafo único, focado apenas na execução correta deste passo.

Objetivo:
Garantir que qualquer pessoa consiga executar o passo com segurança, precisão e confiança, mesmo sem experiência culinária.

Contexto do passo:
{CONTEXTO_DO_PASSO}
`;

/**
 * 🔤 TEXTO (com ou sem imagem)
 */
/*async function callOpenAIText(userPrompt, imageBase64 = null) {
  const messages = [
    { role: "system", content: BASE_PROMPT },
  ];

  if (imageBase64) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: userPrompt },
        {
          type: "image_url",
          image_url: {
            url: imageBase64,
          },
        },
      ],
    });
  } else {
    messages.push({ role: "user", content: userPrompt });
  }

  const response = await openaiVision.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.6,
  });

  return parseAIResponse(response.choices[0].message.content);
}

/**
 *  IMAGEM (prato final ou passo)
 */
/*async function callOpenAIImage(recipeName, stepDescription = "") {
  try {
    // Define o prompt
    const HUMAN_REALIST_PROMPT = stepDescription
      ? `Gerar a imagem APENAS do passo atual do preparo:
${stepDescription}

Requisitos visuais obrigatórios:
- Estilo limpo, moderno e instrucional
- Enquadramento de cima (top-down) ou ângulo de 45 graus
- Mostrar apenas mãos, utensílios e ingredientes (sem rostos)
- Foco exclusivo nos ingredientes usados neste passo
- Contexto culinário realista (cozinha doméstica)
- Estilo híbrido: ilustração minimalista + realismo suave
- Fundo neutro e sem distrações
- Iluminação suave e sombras leves
- Alta nitidez para uso educativo
- Nenhum texto dentro da imagem
- Sem logotipos ou marcas de água

Objetivo:
A imagem deve guiar visualmente o utilizador durante o preparo, de forma clara, intuitiva e segura.`
      : `Fotografia profissional do prato final: ${recipeName}

REALIDADE HUMANA:
• Luz natural dourada, sombras suaves
• Texturas hiper-realistas, vapor natural
• Molhos brilhantes, carne suculenta, vegetais crocantes
• Empratamento estilo restaurante, fundo desfocado
• Sem pessoas, sem logos, sem texto

1024x1024, qualidade DSLR profissional, estilo editorial revista gastronómica.`;

    // Gera a imagem
    const response = await openaiImage.images.generate({
      model: "gpt-image-1.5",
      prompt: HUMAN_REALIST_PROMPT,
      n: 1,
      size: stepDescription ? "1024x1024" : "1024x1024" // passo = 1024, prato final = 1024
    });

    let imageUrl = null;

    // primeiro tenta URL normal
    if (response?.data?.[0]?.url) {
      imageUrl = response.data[0].url;
    }
    // se não houver URL, pega Base64
    else if (response?.data?.[0]?.b64_json) {
      imageUrl = "data:image/png;base64," + response.data[0].b64_json;
    } else {
      console.log(" OpenAI não retornou imagem válida", response);
      return null;
    }

    return imageUrl;

  } catch (err) {
    console.log("Erro ao gerar imagem:", err.message);
    return null;
  }
}

/**
 *  Parser simples
 */
/*function parseAIResponse(text) {
  return {
    raw: text,
    options: extractOptions(text),
    recipe: text,
  };
}

function extractOptions(text) {
  const lines = text.split("\n").filter(Boolean);

  return lines
    .filter((l) => /^\d+[\).\s]/.test(l))
    .slice(0, 3)
    .map((l) => {
      const [title, desc] = l.replace(/^\d+[\).\s]/, "").split("–");
      return {
        title: title.trim(),
        description: desc ? desc.trim() : "",
      };
    });
}

module.exports = {
  callOpenAIText,
  callOpenAIImage,
};
*/
//--------------------------------------- clienteopenai de teste gratuito ------------------------------------
const axios = require("axios");

/**
 * 🎯 GROQ + STABILITY.AI - Versão Corrigida para Passos Específicos
 */

// Prompt base atualizado para GROQ
const BASE_PROMPT = `Você é um CHEF PROFISSIONAL especializado em cozinha Angolana e internacional.

ANÁLISE DE INGREDIENTES:
1. Examine cuidadosamente os ingredientes fornecidos (texto ou imagem)
2. Identifique TODOS os ingredientes visíveis/discutidos
3. Considere autenticidade, disponibilidade local e técnicas tradicionais

FORMATO DE RESPOSTA OBRIGATÓRIO:
{
  "ingredientsIdentified": ["lista de ingredientes"],
  "options": [
    {
      "title": "Nome ESPECÍFICO da receita",
      "description": "Descrição breve e realista",
      "ingredients": ["ingredientes principais"],
      "difficulty": "Fácil/Média/Difícil",
      "time": "XX min",
      "category": "Angolana/Internacional"
    }
  ]
}

NUNCA SUGIRA:
- "Omelete Simples"
- "Salada de Frutas"
- "Arroz com Legumes"
- Receitas genéricas sem identidade

EXEMPLOS CORRETOS:
- Moamba de Galinha com Quiabo e Óleo de Palma
- Calulu de Peixe Fresco com Tomate e Okra
- Mufete com Feijão de Óleo Vermelho e Farofa
- Cabrito Assado no Forno com Batata Doce`;

async function callOpenAIText(userPrompt, imageBase64 = null, systemMessage = null) {
  console.log("🤖 GROQ:", userPrompt.slice(0, 80));
  try {
    const messages = [];
    messages.push({ role: "system", content: systemMessage || BASE_PROMPT });
    if (imageBase64) {
      messages.push({ role: "user", content: [{ type: "text", text: userPrompt }, { type: "image_url", image_url: { url: imageBase64 } }] });
    } else {
      messages.push({ role: "user", content: userPrompt });
    }
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      { model: "llama-3.3-70b-versatile", messages, temperature: 0.7 },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" }, timeout: 30000 }
    );
    console.log("✅ GROQ sucesso");
    const aiResponse = response.data.choices[0].message.content;
    return { raw: aiResponse, options: extractOptionsFromJSON(aiResponse), usage: response.data.usage };
  } catch (err) {
    console.error("❌ GROQ erro:", err.message);
    return mockTextFallback(imageBase64);
  }
}

// ── EXTRAI INGREDIENTES ESPECÍFICOS DO PASSO VIA GROQ ────────────────────────
async function extractStepIngredients(stepDescription, allIngredients, recipeTitle) {
  try {
    const prompt = `You are a culinary expert. Identify ONLY the ingredients actively used in THIS cooking step.
 
RECIPE: "${recipeTitle}"
ALL INGREDIENTS: ${allIngredients.join(', ')}
THIS STEP: "${stepDescription}"
 
Return ONLY a JSON array (max 3 ingredients, in English):
["ingredient1", "ingredient2", "ingredient3"]
 
RULES: Only ingredients touched in THIS step. Translate to English. No explanation.`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Extract ingredients from cooking steps. Respond ONLY with a JSON array." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 80
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" }, timeout: 8000 }
    );

    const raw = response.data.choices[0].message.content.trim();
    const match = raw.match(/\[[\s\S]*?\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log("✅ Ingredientes do passo:", parsed);
        return parsed.slice(0, 3);
      }
    }
    throw new Error("Formato inválido");
  } catch (err) {
    console.log("⚠️ GROQ ingredientes falhou, keyword fallback:", err.message);
    return extractIngredientsByKeyword(stepDescription, allIngredients);
  }
}

function extractIngredientsByKeyword(stepDescription, allIngredients) {
  const stepLower = stepDescription.toLowerCase();
  const found = allIngredients.filter(ing => {
    const clean = ing.toLowerCase()
      .replace(/^\d+[\.,]?\d*\s*(g|kg|ml|l|colher|xícara|unidade|dente|folha|pitada)?\s*(de\s+)?/i, '')
      .split(' ')[0];
    return clean.length > 2 && stepLower.includes(clean);
  });
  return found.length > 0 ? found.slice(0, 3) : allIngredients.slice(0, 2);
}

// ── CONSTRÓI CENA VISUAL ESPECÍFICA DO PASSO ──────────────────────────────────
function buildStepVisual(stepDescription, stepIngredients, recipeTitle) {
  const desc = stepDescription.toLowerCase();
  const ings = stepIngredients.length > 0 ? stepIngredients.join(' and ') : 'fresh ingredients';

  if (/lav|wash|clean|rinse|limpar/.test(desc))
    return { action: `hands washing ${ings} under cold running water in kitchen sink`, scene: `water flowing over produce, wet vegetables glistening, natural daylight` };

  if (/picar|cortar|chop|cut|slice|dice|mince|fatiar|descascar|peel/.test(desc))
    return { action: `chef hands using sharp kitchen knife to chop ${ings} on wooden cutting board, knife mid-cut`, scene: `knife blade cutting through ingredient, pieces separating, close-up` };

  if (/refogar|fritar|fry|sauté|sautee|dourar|golden|brown|saltear/.test(desc))
    return { action: `${ings} sizzling vigorously in hot oil inside frying pan on gas stove`, scene: `oil bubbles around ingredients, steam rising, edges turning golden brown` };

  if (/ferver|boil|simmer|cozinhar|cook|cozer|stew|guisar/.test(desc))
    return { action: `pot on lit gas stove with ${ings} simmering in bubbling liquid`, scene: `steam rising from pot, liquid gently bubbling, stove burner glowing` };

  if (/misturar|mexer|stir|mix|blend|whisk|bater|incorporar|combinar/.test(desc))
    return { action: `hands actively stirring ${ings} in large ceramic bowl using wooden spoon`, scene: `ingredients swirling together, spoon in motion, mixing action` };

  if (/temperar|season|salt|salgar|spice|herb|azeite|adicionar|add|juntar|colocar|pour|verter/.test(desc))
    return { action: `hand carefully adding ${ings} to pan, pouring or sprinkling in motion`, scene: `seasoning falling, close-up of hand and pan, steam visible` };

  if (/marinar|marinate|rest|descansar|macerar/.test(desc))
    return { action: `${ings} marinating in glass bowl with fresh herbs, spices and marinade liquid`, scene: `ingredients soaking in marinade, herbs and garlic visible` };

  if (/forno|oven|bake|assar|roast/.test(desc))
    return { action: `${ings || recipeTitle} roasting inside hot oven on metal rack, browning nicely`, scene: `oven interior with glowing heating elements, food surface browning` };

  if (/grelhar|grill|barbecue|churrasco|brasa/.test(desc))
    return { action: `${ings} grilling on hot grill grate with char marks and smoke`, scene: `grill marks forming, smoke rising, flames visible below` };

  if (/servir|serve|empratar|plate|garnish|decorar|apresentar/.test(desc))
    return { action: `plating ${recipeTitle} from pan onto white ceramic plate, final presentation`, scene: `serving spoon placing food, steam rising, garnish being added` };

  if (/preparar|prepare|organizar|mise en place|separar/.test(desc))
    return { action: `mise en place: ${ings} arranged in small bowls on kitchen counter ready for cooking`, scene: `organised ingredients, cutting board nearby, overhead view` };

  return { action: `cooking step for ${recipeTitle}: actively working with ${ings} in kitchen`, scene: `hands performing cooking action, natural kitchen lighting, close-up` };
}

// ── STABILITY AI ──────────────────────────────────────────────────────────────
async function callOpenAIImage(prompt, recipeTitle = "", stepDescription = "", isFinalDish = false) {
  console.log("🖼️ STABILITY.AI:", isFinalDish ? "PRATO FINAL" : "PASSO");

  try {
    let stabilityPrompt;
    let negativePrompt;

    if (isFinalDish) {
      stabilityPrompt = [
        `Professional food photography of "${recipeTitle}"`,
        `Beautifully plated complete dish on elegant white ceramic plate`,
        `Canon EOS DSLR 50mm f/1.8 lens shallow depth of field bokeh`,
        `Soft natural window light warm golden tones`,
        `Restaurant quality presentation with garnish`,
        `Light steam rising glistening sauces visible food textures`,
        `Clean marble or dark wood surface background`,
        `Michelin star editorial food magazine quality`,
        `Vibrant natural colors crispy juicy textures`,
        `Appetizing mouth-watering ultra-realistic photograph`
      ].join(', ');

      negativePrompt = [
        'illustration cartoon drawing painting anime comic sketch',
        '3d render cgi unreal engine digital art concept art',
        'plastic food fake food artificial colors oversaturated',
        'text watermark logo signature label',
        'blurry dark underexposed overexposed',
        'people hands faces fingers',
        'empty plate no food'
      ].join(', ');

    } else {
      // Extrai ingredientes do marcador especial no stepDescription
      // Formato: "descrição do passo [INGREDIENTS: onion, garlic, oil]"
      let stepIngredients = [];
      const ingMatch = stepDescription.match(/\[INGREDIENTS:(.*?)\]/);
      if (ingMatch) {
        stepIngredients = ingMatch[1].split(',').map(s => s.trim()).filter(Boolean);
      }

      const cleanDesc = stepDescription.replace(/\[INGREDIENTS:.*?\]/, '').trim();
      const { action, scene } = buildStepVisual(cleanDesc, stepIngredients, recipeTitle);

      stabilityPrompt = [
        `Instructional cooking photography documentary style`,
        action,
        scene,
        `Tight close-up shot hands and ingredients fill the frame`,
        `Warm natural kitchen lighting wooden counter or stove background`,
        `Sharp focus on the action being performed`,
        `Realistic food textures natural colors`,
        `Educational cooking tutorial photography`,
        `DSLR camera 35mm lens f2.8 aperture`
      ].join(', ');

      negativePrompt = [
        'illustration cartoon drawing anime digital art 3d render cgi',
        'finished plated dish final meal restaurant presentation',
        'empty kitchen no action happening',
        'text watermark logo labels',
        'full body faces portraits',
        'blurry overexposed dark noisy',
        'generic stock photo staged studio'
      ].join(', ');
    }

    console.log("📝 Prompt:", stabilityPrompt.substring(0, 120));

    const response = await axios.post(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        text_prompts: [
          { text: stabilityPrompt, weight: 1 },
          { text: negativePrompt, weight: -1.5 }
        ],
        cfg_scale: 8,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 35,
        style_preset: "photographic"
      },
      {
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${process.env.STABILITY_API_KEY}` },
        timeout: 60000
      }
    );

    if (response.data?.artifacts?.[0]?.base64) {
      console.log("✅ STABILITY.AI SUCCESS");
      return `data:image/png;base64,${response.data.artifacts[0].base64}`;
    }

    console.warn("⚠️ Stability sem imagem");
    return getFallbackImage(recipeTitle, stepDescription, isFinalDish);

  } catch (err) {
    console.error("❌ STABILITY.AI ERROR:", err.response?.data || err.message);
    return getFallbackImage(recipeTitle, stepDescription, isFinalDish);
  }
}

function getFallbackImage(recipeTitle, stepDescription, isFinalDish) {
  const r = (recipeTitle || '').toLowerCase();
  const s = (stepDescription || '').toLowerCase();
  if (isFinalDish) {
    if (r.includes('moamba') || r.includes('muamba')) return "https://images.unsplash.com/photo-1563379091339-03246963d9d6?auto=format&fit=crop&w=1024&q=80";
    if (r.includes('calulu')) return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1024&q=80";
    if (r.includes('mufete')) return "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1024&q=80";
    if (r.includes('peixe') || r.includes('fish')) return "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1024&q=80";
    if (r.includes('frango') || r.includes('chicken')) return "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1024&q=80";
    return "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=1024&q=80";
  }
  if (/cortar|picar|cut|chop/.test(s)) return "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1024&q=80";
  if (/refogar|fritar|fry|sauté/.test(s)) return "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1024&q=80";
  if (/misturar|mexer|stir|mix/.test(s)) return "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1024&q=80";
  if (/cozinhar|ferver|boil|cook/.test(s)) return "https://images.unsplash.com/photo-1556909114-b6f4a5d5a1e6?auto=format&fit=crop&w=1024&q=80";
  if (/temperar|season/.test(s)) return "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1024&q=80";
  if (/assar|forno|oven/.test(s)) return "https://images.unsplash.com/photo-1585511543716-5b37b86f73e2?auto=format&fit=crop&w=1024&q=80";
  if (/servir|serve/.test(s)) return "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1024&q=80";
  return "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1024&q=80";
}

function extractOptionsFromJSON(jsonText) {
  try {
    const parsed = JSON.parse(jsonText);
    if (parsed.options && Array.isArray(parsed.options)) return parsed.options;
  } catch (e) { }
  return jsonText.split('\n').filter(l => l.trim())
    .filter(l => /^\d+\./.test(l) || /^[•\-]/.test(l))
    .slice(0, 3)
    .map(line => ({ title: line.replace(/^\d+\.\s*|^[•\-]\s*/, '').trim(), description: "Receita tradicional", ingredients: [], difficulty: "Média", time: "45 min", category: "Angolana" }));
}

function mockTextFallback(imageBase64 = null) {
  const options = imageBase64
    ? [{ title: "Moamba de Galinha", description: "Frango com óleo de palma", difficulty: "Média", time: "60 min" }, { title: "Calulu de Peixe", description: "Peixe com legumes", difficulty: "Fácil", time: "45 min" }, { title: "Mufete de Feijão", description: "Feijão com óleo vermelho", difficulty: "Difícil", time: "90 min" }]
    : [{ title: "Arroz de Galinha", description: "Arroz com frango", difficulty: "Média", time: "50 min" }, { title: "Cabrito Assado", description: "Cabrito no forno", difficulty: "Difícil", time: "120 min" }, { title: "Peixe Grelhado", description: "Peixe com limão", difficulty: "Fácil", time: "30 min" }];
  return { raw: JSON.stringify({ ingredientsIdentified: [], options }), options };
}

module.exports = { callOpenAIText, callOpenAIImage, extractStepIngredients };