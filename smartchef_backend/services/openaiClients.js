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
const BASE_PROMPT = `
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
const fal = require("@fal-ai/serverless-client");
fal.config({
  credentials: process.env.FAL_AI_KEY,  // ← FAL_AI_KEY (não FAL_KEY)
});
/**
 * 🎯 GROQ + FAL.AI - GRATUITO REAL!
 */
async function callOpenAIText(userPrompt, imageBase64 = null) {
  console.log("🤖 GROQ:", userPrompt.slice(0, 50));

  const messages = imageBase64
    ? [
      { role: "system", content: BASE_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: imageBase64 } }
        ]
      }
    ]
    : [
      { role: "system", content: BASE_PROMPT },
      { role: "user", content: userPrompt }
    ];


  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: imageBase64 ? "llava-v1.5-7b-4096-preview" : "llama-3.3-70b-versatile",
        messages,
        temperature: 0.6,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );
    return parseAIResponse(response.data.choices[0].message.content);
  } catch (err) {
    console.error("GROQ ERROR:", err.message);
    return mockTextFallback(imageBase64);
  }
}


async function callOpenAIImage(recipeName, stepDescription = "") {
  console.log("🖼️ FAL.AI:", recipeName);

  const prompt = stepDescription
    ? `Cooking step: ${stepDescription}. Realistic home kitchen, hands only, no faces`
    : `Professional food photography of ${recipeName}, ultra realistic, restaurant style`;

  try {
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: "Banana frita angolana",
        image_size: "square",
      },
    });

    console.log(result.images[0].url);

    return result.images[0].url;
  } catch (err) {
    console.error("FAL.AI ERROR:", err.message);
    return "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800";
  }
}

// Fallback se APIs falharem
function mockTextFallback(imageBase64 = null) {
  return imageBase64 ? {
    raw: `1. Sopa de Peixe - sopa com peixe e legumes da foto.
2. Ensopado de Peixe - peixe com legumes em caldo.
3. Peixe Grelhado - peixe simples com ervas.`,
    options: [
      { title: "Sopa de Peixe", description: "sopa com peixe e legumes" },
      { title: "Ensopado de Peixe", description: "peixe com legumes caldo" },
      { title: "Peixe Grelhado", description: "peixe simples ervas" }
    ]
  } : {
    raw: `1. Arroz de Frango - arroz com frango cebola alho.
2. Frango Grelhado - peitos com arroz temperado.
3. Arroz Valenciana - frango arroz juntos.`,
    options: [
      { title: "Arroz de Frango", description: "arroz com frango cebola alho" },
      { title: "Frango Grelhado", description: "peitos com arroz temperado" },
      { title: "Arroz Valenciana", description: "frango arroz juntos" }
    ]
  };
}

function parseAIResponse(text) {
  return { raw: text, options: extractOptions(text), recipe: text };
}

function extractOptions(text) {
  const lines = text.split("\n").filter(Boolean);
  return lines
    .filter(l => /^\d+[\).\s]/.test(l))
    .slice(0, 3)
    .map(l => {
      const clean = l.replace(/^\d+[\).\s]/, "");
      const parts = clean.split(" - ");
      return {
        title: parts[0].trim(),
        description: parts.slice(1).join(" - ").trim(),
      };
    });
}

module.exports = { callOpenAIText, callOpenAIImage };
