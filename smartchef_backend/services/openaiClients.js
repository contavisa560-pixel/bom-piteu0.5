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

    // Usa system message personalizada ou a base
    if (systemMessage) {
      messages.push({ role: "system", content: systemMessage });
    } else {
      messages.push({ role: "system", content: BASE_PROMPT });
    }

    if (imageBase64) {
      // Modo Vision com imagem
      messages.push({
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          {
            type: "image_url",
            image_url: { url: imageBase64 }
          }
        ]
      });
    } else {
      // Modo texto apenas
      messages.push({ role: "user", content: userPrompt });
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.7,

      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    console.log("✅ GROQ Response:", aiResponse.slice(0, 100));

    return {
      raw: aiResponse,
      options: extractOptionsFromJSON(aiResponse),
      usage: response.data.usage
    };

  } catch (err) {
    console.error("❌ GROQ ERROR:", err.response?.status, err.message);
    return mockTextFallback(imageBase64);
  }
}

/**
 * 🖼️ STABILITY.AI - IMAGENS ESPECÍFICAS POR PASSO
 */
async function callOpenAIImage(prompt, recipeTitle = "", stepDescription = "", isFinalDish = false) {
  console.log("🖼️ STABILITY.AI Image Generation");

  try {
    let stabilityPrompt;

    if (isFinalDish) {
      stabilityPrompt = `REAL PHOTOGRAPH OF FOOD, NOT ILLUSTRATION

A real, unedited photograph of a freshly cooked dish:
${recipeTitle}

CRITICAL REALISM REQUIREMENTS:
- This must look like a real photograph taken with a camera
- Natural imperfections (uneven textures, real food shapes)
- Natural lighting, not studio illustration lighting
- No painterly style
- No smooth plastic textures
- No artistic exaggeration
- Real shadows and reflections
- Looks like a photo from a restaurant or food magazine

CAMERA DETAILS:
- DSLR photograph
- 50mm lens look
- f/2.8 shallow depth of field
- Slight grain, natural noise
- Realistic color balance
- Editorial food photography

ABSOLUTELY NOT:
- illustration
- cartoon
- drawing
- painting
- CGI
- 3D render
- digital art
`;
    } else {
      stabilityPrompt = `ULTRA-REALISTIC COOKING ACTION PHOTOGRAPHY - DOCUMENTARY STYLE

SPECIFIC COOKING ACTION: ${stepDescription}
RECIPE CONTEXT: ${recipeTitle}

IMAGE REQUIREMENTS:
- Show ONLY this specific cooking action in progress
- Focus on HANDS performing the action
- Ingredients in MID-PREPARATION (not finished)
- Real kitchen environment
- Natural kitchen lighting
- Documentary photography style
- Instructional, educational feel
- No faces visible
- No text or logos
- NOT the final dish - DO NOT show completed food

ACTION-SPECIFIC EXAMPLES:
- "Cortar cebola" → Show hands chopping onion on cutting board with knife
- "Refogar alho" → Show garlic sizzling in pan with visible oil bubbles
- "Misturar massa" → Show hands mixing dough in a bowl
- "Temperar carne" → Show hands seasoning raw meat
- "Cozinhar arroz" → Show pot with rice and steam, NOT finished rice

COMPOSITION:
- Close-up on the action
- Hands and ingredients clearly visible
- Kitchen utensils in use
- Natural, slightly blurred background
- Realistic food textures

CRITICAL: This is a MID-PROCESS step, NOT the final result!
NEVER show: Plated food, finished dish, serving presentation`;
    }
    console.log("📸 Prompt para:", isFinalDish ? "Prato Final" : "Passo");
    console.log("📝 Prompt excerpt:", stabilityPrompt.substring(0, 200));

    const response = await axios.post(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        text_prompts: [
          { text: stabilityPrompt, weight: 1 },
          {
            text: `
illustration, cartoon, drawing, painting, anime, comic,
3d, cgi, render, unreal engine,
plastic, toy, fake food,
smooth surfaces, stylized,
digital art, concept art,
oversaturated colors,
fake lighting, studio illustration,
text, watermark, logo
`,
            weight: -2
          }

        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 40,
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

    console.warn("⚠️ Stability returned no image");
    return getFallbackImage(recipeTitle, stepDescription, isFinalDish);

  } catch (err) {
    console.error("❌ STABILITY.AI ERROR:", err.response?.data || err.message);
    return getFallbackImage(recipeTitle, stepDescription, isFinalDish);
  }
}


// Funções auxiliares
function extractOptionsFromJSON(jsonText) {
  try {
    const parsed = JSON.parse(jsonText);
    if (parsed.options && Array.isArray(parsed.options)) {
      return parsed.options;
    }
  } catch (e) {
    console.log("JSON parse failed, extracting manually");
  }

  // Fallback manual
  const lines = jsonText.split('\n').filter(l => l.trim());
  return lines
    .filter(l => /^\d+\./.test(l) || /^[•\-]/.test(l))
    .slice(0, 3)
    .map((line, i) => ({
      title: line.replace(/^\d+\.\s*|^[•\-]\s*/, '').trim(),
      description: "Receita tradicional",
      ingredients: [],
      difficulty: "Média",
      time: "45 min",
      category: "Angolana"
    }));
}

function mockTextFallback(imageBase64 = null) {
  const options = imageBase64 ? [
    { title: "Moamba de Galinha", description: "Frango cozido com óleo de palma e quiabo", difficulty: "Média", time: "60 min" },
    { title: "Calulu de Peixe", description: "Peixe com legumes em molho de tomate", difficulty: "Fácil", time: "45 min" },
    { title: "Mufete de Feijão", description: "Feijão com óleo vermelho e farinha", difficulty: "Difícil", time: "90 min" }
  ] : [
    { title: "Arroz de Galinha", description: "Arroz com frango e legumes", difficulty: "Média", time: "50 min" },
    { title: "Cabrito Assado", description: "Cabrito temperado assado no forno", difficulty: "Difícil", time: "120 min" },
    { title: "Peixe Grelhado", description: "Peixe fresco grelhado com limão", difficulty: "Fácil", time: "30 min" }
  ];

  return {
    raw: JSON.stringify({ ingredientsIdentified: [], options }),
    options: options
  };
}

function getFallbackImage(recipeTitle, stepDescription, isFinalDish) {
  // Mapeamento inteligente de fallback baseado no conteúdo
  const recipeLower = recipeTitle.toLowerCase();
  const stepLower = stepDescription.toLowerCase();

  if (isFinalDish) {
    // Imagens finais por tipo de prato
    if (recipeLower.includes('moamba') || recipeLower.includes('muamba')) {
      return "https://images.unsplash.com/photo-1563379091339-03246963d9d6?auto=format&fit=crop&w=1024&q=80";
    } else if (recipeLower.includes('calulu')) {
      return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1024&q=80";
    } else if (recipeLower.includes('mufete')) {
      return "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1024&q=80";
    } else if (recipeLower.includes('peixe') || recipeLower.includes('fish')) {
      return "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1024&q=80";
    } else {
      return "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=1024&q=80";
    }
  } else {
    // Imagens de passos baseadas na ação
    if (stepLower.includes('cortar') || stepLower.includes('picar') || stepLower.includes('corta')) {
      return "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1024&q=80";
    } else if (stepLower.includes('refogar') || stepLower.includes('fritar') || stepLower.includes('frita')) {
      return "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1024&q=80";
    } else if (stepLower.includes('misturar') || stepLower.includes('mexer') || stepLower.includes('mistura')) {
      return "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1024&q=80";
    } else if (stepLower.includes('assar') || stepLower.includes('forno')) {
      return "https://images.unsplash.com/photo-1556909114-b6f4a5d5a1e6?auto=format&fit=crop&w=1024&q=80";
    } else {
      return "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1024&q=80";
    }
  }
}

module.exports = {
  callOpenAIText,
  callOpenAIImage
};