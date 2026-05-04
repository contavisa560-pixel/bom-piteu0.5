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
 * 🎯 GROQ + STABILITY.AI - Imagens de Passo Profissionais
 */

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
      messages.push({
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: imageBase64 } }
        ]
      });
    } else {
      messages.push({ role: "user", content: userPrompt });
    }
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      { model: "llama-3.3-70b-versatile", messages, temperature: 0.7 },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
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

Return ONLY a JSON array (max 4 ingredients, in English):
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
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 8000
      }
    );

    const raw = response.data.choices[0].message.content.trim();
    const match = raw.match(/\[[\s\S]*?\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log("✅ Ingredientes do passo:", parsed);
        return parsed.slice(0, 4);
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
  return found.length > 0 ? found.slice(0, 4) : allIngredients.slice(0, 2);
}

// ── NEGATIVO UNIVERSAL — aplicado em TODOS os prompts de passo ─────────────────
const UNIVERSAL_NEGATIVE = [
  // Humanos
  'human hands fingers arms person people chef cook woman man',
  'body parts skin flesh nails rings gloves kitchen worker',
  'human silhouette portrait face eyes mouth',
  // Erros visuais
  'illustration cartoon drawing anime sketch 3d render cgi digital art',
  'watermark text logo label signature overlay',
  'blurry out of focus dark underexposed overexposed noisy grainy',
  'plastic fake food artificial colors',
  // Contexto errado
  'empty pan no food unrelated objects furniture',
  'multiple dishes collage split screen',
  'raw uncooked ingredients when step requires cooking'
].join(', ');

// ── CONSTRÓI PROMPT VISUAL PROFISSIONAL DO PASSO ──────────────────────────────
// A chave da mudança: descreve o RESULTADO VISUAL do passo, não a acção humana.
// Ex: "golden onions in pan" em vez de "hands stirring onions"
function buildStepVisual(stepDescription, stepIngredients, recipeTitle, stepNumber, totalSteps) {
  const desc = stepDescription.toLowerCase();
  const ings = stepIngredients.length > 0 ? stepIngredients.join(', ') : 'ingredients';
  const ingsFull = stepIngredients.length > 0
    ? stepIngredients.join(' and ')
    : 'fresh ingredients';

  // ── CORTE / PICAGEM ────────────────────────────────────────────────────────
  if (/lav|wash|clean|rinse|limpar|enxaguar/.test(desc)) {
    return {
      subject: `${ingsFull} freshly washed`,
      state: `glistening with water droplets, wet surface, clean and vibrant colours`,
      vessel: `on clean white cutting board or colander, water drops visible`,
      angle: `close-up overhead shot`,
      lighting: `bright natural daylight, high key`
    };
  }

  if (/picar|cortar|chop|cut|slice|dice|mince|fatiar|descascar|peel|juliana/.test(desc)) {
    return {
      subject: `${ingsFull} neatly cut and prepared`,
      state: `thin uniform cucumber slices neatly arranged inside a tall clear glass, slightly overlapping, fresh moisture visible on surface, crisp texture`,
      vessel: `dark wooden cutting board surface`,
      angle: `45-degree angle shot showing all pieces clearly`,
      lighting: `warm natural side lighting casting gentle shadows`
    };
  }

  // ── REFOGAR / FRITAR ───────────────────────────────────────────────────────
  if (/refogar|fritar|fry|sauté|sautee|dourar|golden|brown|saltear|caramelizar/.test(desc)) {
    return {
      subject: `${ingsFull} sautéing in pan`,
      state: `golden-brown caramelised surface, edges crisping, light steam rising, oil glistening around ingredients`,
      vessel: `black cast iron skillet or stainless steel frying pan on stove, burner glow visible underneath`,
      angle: `overhead shot or 30-degree angle showing full pan interior`,
      lighting: `warm kitchen lighting with subtle steam haze`
    };
  }

  // ── FERVER / COZINHAR / GUISAR ─────────────────────────────────────────────
  if (/ferver|boil|simmer|cozinhar|cook|cozer|stew|guisar|rebuliçar/.test(desc)) {
    return {
      subject: `${ingsFull} simmering in pot`,
      state: `liquid gently bubbling around ingredients, rich colourful broth, ingredients partially submerged and cooked through`,
      vessel: `large ceramic or stainless steel pot on stove, steam rising naturally`,
      angle: `overhead shot looking down into pot showing full contents`,
      lighting: `warm ambient kitchen light, steam softening edges`
    };
  }

  // ── MISTURAR / INCORPORAR ──────────────────────────────────────────────────
  if (/misturar|mexer|stir|mix|blend|whisk|bater|incorporar|combinar|amassar/.test(desc)) {
    return {
      subject: `${ingsFull} mixed together`,
      state: `fully incorporated mixture with visible texture and colour contrast, smooth or chunky as appropriate, wooden spoon or whisk resting in bowl`,
      vessel: `large ceramic mixing bowl on kitchen counter`,
      angle: `45-degree angle showing depth of mixture`,
      lighting: `bright overhead light showing texture clearly`
    };
  }

  // ── TEMPERAR / ADICIONAR ───────────────────────────────────────────────────
  if (/temperar|season|salt|salgar|spice|herb|adicionar|juntar|colocar|verter|por/.test(desc)) {
    return {
      subject: `${ingsFull} being seasoned`,
      state: `spices or herbs visibly coating the surface, seasoning granules or herb flakes clearly visible against food surface, rich colours`,
      vessel: `pan or bowl with food below, seasoning scattered across surface`,
      angle: `close-up overhead macro shot`,
      lighting: `bright directional light showing seasoning texture`
    };
  }

  // ── MARINAR ────────────────────────────────────────────────────────────────
  if (/marinar|marinate|rest|descansar|macerar|repousar/.test(desc)) {
    return {
      subject: `${ingsFull} marinating`,
      state: `submerged in dark aromatic marinade, herbs and spices floating, surface glistening with liquid absorption`,
      vessel: `glass or ceramic bowl with marinade liquid covering ingredients`,
      angle: `45-degree angle shot showing marinade depth`,
      lighting: `natural daylight showing translucent marinade colour`
    };
  }

  // ── FORNO / ASSAR ──────────────────────────────────────────────────────────
  if (/forno|oven|bake|assar|roast|gratinar|tostar/.test(desc)) {
    return {
      subject: `${ingsFull || recipeTitle} roasting in oven`,
      state: `golden-brown caramelised surface with crispy edges, slight char marks, juices bubbling around edges, perfectly roasted`,
      vessel: `metal roasting tray or ceramic baking dish inside hot oven, rack visible`,
      angle: `front-facing shot through oven interior or close-up on dish`,
      lighting: `warm oven glow with golden tones`
    };
  }

  // ── GRELHAR ────────────────────────────────────────────────────────────────
  if (/grelhar|grill|barbecue|churrasco|brasa|grelhado/.test(desc)) {
    return {
      subject: `${ingsFull || recipeTitle} on grill`,
      state: `distinct char grill marks on surface, caramelised exterior, light smoke rising, juicy interior visible at edges`,
      vessel: `cast iron grill pan or outdoor grill grates, heat visible`,
      angle: `30-degree angle showing grill marks and full surface`,
      lighting: `dramatic warm backlighting with smoke haze`
    };
  }

  // ── SERVIR / EMPRATAR ─────────────────────────────────────────────────────
  if (/servir|serve|empratar|plate|garnish|decorar|apresentar|final/.test(desc) || stepNumber === totalSteps) {
    return {
      subject: `${recipeTitle} plated beautifully`,
      state: `complete dish fully plated with garnish, colours vibrant, textures visible, sauce or juices pooling elegantly`,
      vessel: `elegant white ceramic plate on dark wood or marble surface`,
      angle: `45-degree angle food photography shot`,
      lighting: `soft natural side lighting, professional food photography`
    };
  }

  // ── PREPARAR / MISE EN PLACE ───────────────────────────────────────────────
  if (/preparar|prepare|organizar|mise en place|separar|dispor|reunir/.test(desc)) {
    return {
      subject: `${ingsFull} mise en place`,
      state: `all ingredients measured and arranged in individual small bowls, colours contrasting beautifully, organised and ready`,
      vessel: `clean kitchen counter or marble surface with small prep bowls`,
      angle: `overhead flat-lay shot`,
      lighting: `bright even lighting showing all ingredients clearly`
    };
  }

  // ── AZEITE / MOLHO / LÍQUIDOS ─────────────────────────────────────────────
  if (/azeite|óleo|oil|molho|sauce|caldo|stock|broth|creme|cream/.test(desc)) {
    return {
      subject: `sauce or liquid with ${ingsFull}`,
      state: `rich glossy sauce or liquid, visible depth and colour, coating or surrounding other ingredients`,
      vessel: `pan or saucepan showing sauce consistency and colour`,
      angle: `overhead or 30-degree angle shot`,
      lighting: `warm lighting highlighting liquid gloss`
    };
  }

  // ── FALLBACK PROFISSIONAL ──────────────────────────────────────────────────
  return {
    subject: `${ingsFull} in cooking process for ${recipeTitle}`,
    state: `ingredients at correct stage of cooking, showing realistic colour and texture transformation`,
    vessel: `appropriate cooking vessel, clean and professional`,
    angle: `overhead or 30-degree angle showing full cooking stage`,
    lighting: `warm natural kitchen lighting, professional food photography`
  };
}

// ── CONSTRÓI PROMPT COMPLETO PARA STABILITY AI ────────────────────────────────
function buildStabilityPrompt(visual, recipeTitle, stepNumber, totalSteps) {
  const { subject, state, vessel, angle, lighting } = visual;

  return [
    `professional food photography, editorial cookbook style`,
    subject,
    state,
    `${vessel}, realistic kitchen environment`,
    `${angle}, subject centered`,
    `${lighting}`,
    `shallow depth of field, blurred background`,
    `natural imperfections, realistic cooking mess minimal`,
    `high detail textures, moisture, steam, oil sheen`,
    `sharp focus on food only`,
    `no people no hands no body parts`,
    `cookbook editorial quality`,
    `ultra-realistic food textures`,
    `vibrant natural colours`,
    `clean uncluttered composition`,
    `main subject centered and dominant in frame`,
    `Michelin star visual quality`,
    `shot on Canon EOS R5, 50mm lens, f1.8, ultra realistic, food magazine quality, natural light`
  ].join(', ');
}

// ── STABILITY AI ──────────────────────────────────────────────────────────────
async function callOpenAIImage(prompt, recipeTitle = "", stepDescription = "", isFinalDish = false, stepNumber = 0, totalSteps = 0) {
  console.log("🖼️ STABILITY.AI:", isFinalDish ? "PRATO FINAL" : `PASSO ${stepNumber}/${totalSteps}`);

  try {
    let stabilityPrompt;
    let negativePrompt;

    if (isFinalDish) {
      // ── IMAGEM FINAL DO PRATO ──────────────────────────────────────────────
      stabilityPrompt = [
        `Professional food photography of "${recipeTitle}"`,
        `beautifully plated complete finished dish`,
        `elegant presentation on white ceramic plate`,
        `rich vibrant colours showing all components`,
        `garnish and sauce visible`,
        `light steam rising naturally`,
        `dark wood or marble surface background`,
        `45-degree angle shot`,
        `soft natural window side lighting with bokeh background`,
        `no people no hands no body parts anywhere in frame`,
        `cookbook cover quality`,
        `ultra-realistic food textures`,
        `Michelin star editorial food magazine photography`,
        `Canon EOS R5 50mm f1.8 lens shallow depth of field`
      ].join(', ');

      negativePrompt = [
        UNIVERSAL_NEGATIVE,
        'unfinished incomplete raw ingredients',
        'multiple unrelated dishes',
        'messy cluttered presentation'
      ].join(', ');

    } else {
      // ── IMAGEM DO PASSO ────────────────────────────────────────────────────
      // Extrai ingredientes do marcador especial
      let stepIngredients = [];
      const ingMatch = stepDescription.match(/\[INGREDIENTS:(.*?)\]/);
      if (ingMatch) {
        stepIngredients = ingMatch[1].split(',').map(s => s.trim()).filter(Boolean);
      }
      const cleanDesc = stepDescription.replace(/\[INGREDIENTS:.*?\]/, '').trim();

      const visual = buildStepVisual(cleanDesc, stepIngredients, recipeTitle, stepNumber, totalSteps);
      stabilityPrompt = buildStabilityPrompt(visual, recipeTitle, stepNumber, totalSteps);

      negativePrompt = [
        UNIVERSAL_NEGATIVE,
        'wrong cooking stage',
        'burnt overcooked',
        'unrelated cooking utensils dominating frame'
      ].join(', ');
    }

    console.log(" Positive:", stabilityPrompt.substring(0, 150) + "...");
    console.log(" Negative:", negativePrompt.substring(0, 100) + "...");

    const response = await axios.post(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        text_prompts: [
          { text: stabilityPrompt, weight: 1 },
          { text: negativePrompt, weight: -2 }
        ],
        cfg_scale: 10,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 50,        
        style_preset: "photographic"
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`
        },
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
    .map(line => ({
      title: line.replace(/^\d+\.\s*|^[•\-]\s*/, '').trim(),
      description: "Receita tradicional",
      ingredients: [],
      difficulty: "Média",
      time: "45 min",
      category: "Angolana"
    }));
}

function mockTextFallback(imageBase64 = null) {
  const options = imageBase64
    ? [
      { title: "Moamba de Galinha", description: "Frango com óleo de palma", difficulty: "Média", time: "60 min" },
      { title: "Calulu de Peixe", description: "Peixe com legumes", difficulty: "Fácil", time: "45 min" },
      { title: "Mufete de Feijão", description: "Feijão com óleo vermelho", difficulty: "Difícil", time: "90 min" }
    ]
    : [
      { title: "Arroz de Galinha", description: "Arroz com frango", difficulty: "Média", time: "50 min" },
      { title: "Cabrito Assado", description: "Cabrito no forno", difficulty: "Difícil", time: "120 min" },
      { title: "Peixe Grelhado", description: "Peixe com limão", difficulty: "Fácil", time: "30 min" }
    ];
  return { raw: JSON.stringify({ ingredientsIdentified: [], options }), options };
}

module.exports = { callOpenAIText, callOpenAIImage, extractStepIngredients };