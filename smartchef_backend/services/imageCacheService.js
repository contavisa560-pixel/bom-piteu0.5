
const crypto = require("crypto");
const ImageCache = require("../models/ImageCache");

// Normaliza o prompt para maximizar hits de cache
function normalizePrompt(raw) {
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    // Remove artigos e palavras de ligação que não afectam o significado visual
    .replace(/\b(de|da|do|com|e|em|o|a|os|as|um|uma|the|of|with|and)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function generateHash(normalizedPrompt) {
  return crypto.createHash("md5").update(normalizedPrompt).digest("hex");
}

// Extrai palavras-chave para busca por similaridade
function extractKeywords(prompt) {
  const stopWords = new Set([
    "de", "da", "do", "com", "e", "em", "o", "a", "os", "as",
    "um", "uma", "the", "of", "with", "and", "step", "passo",
    "ingredients", "ingredientes", "recipe", "receita"
  ]);
  return normalizePrompt(prompt)
    .split(" ")
    .filter(w => w.length > 3 && !stopWords.has(w));
}

async function getCachedImage(prompt, imageType = "recipe") {
  try {
    const normalized = normalizePrompt(prompt);
    const hash = generateHash(`${imageType}::${normalized}`);

    // Camada 1: hash exacto
    const exact = await ImageCache.findOne({ hash });
    if (exact) {
      ImageCache.findByIdAndUpdate(exact._id, {
        $inc: { hitCount: 1 },
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      }).exec().catch(() => {});
      console.log(`✅ Cache HIT exacto: ${imageType} — "${prompt.substring(0, 50)}"`);
      return exact.imageUrl;
    }

    // Camada 2: busca por palavras-chave (mesma categoria)
    const keywords = extractKeywords(prompt);
    if (keywords.length >= 2) {
      // Procura entradas que contenham pelo menos 2 palavras-chave no prompt
      const keywordRegex = keywords.slice(0, 3).map(k => new RegExp(k, "i"));
      const similar = await ImageCache.findOne({
        imageType,
        $and: keywordRegex.map(r => ({ prompt: r })),
        hitCount: { $gte: 1 } // só reutiliza se já foi validado antes
      }).sort({ hitCount: -1 });

      if (similar) {
        ImageCache.findByIdAndUpdate(similar._id, {
          $inc: { hitCount: 1 },
          lastUsedAt: new Date(),
        }).exec().catch(() => {});
        console.log(`✅ Cache HIT similar: ${imageType} — "${prompt.substring(0, 50)}"`);
        return similar.imageUrl;
      }
    }

    console.log(`📭 Cache MISS: ${imageType} — "${prompt.substring(0, 50)}"`);
    return null;
  } catch (error) {
    console.error("⚠️ Erro cache lookup:", error.message);
    return null;
  }
}

async function setCachedImage(prompt, imageType = "recipe", imageUrl) {
  try {
    const normalized = normalizePrompt(prompt);
    const hash = generateHash(`${imageType}::${normalized}`);

    await ImageCache.findOneAndUpdate(
      { hash },
      {
        hash,
        prompt: prompt.substring(0, 1000),
        imageType,
        imageUrl,
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      { upsert: true, new: true }
    );
    console.log(`💾 Cache GUARDADO: ${imageType} — "${prompt.substring(0, 50)}"`);
  } catch (error) {
    console.error("⚠️ Erro ao guardar cache:", error.message);
  }
}

async function getOrGenerateImage(prompt, imageType, generateFn) {
  const cached = await getCachedImage(prompt, imageType);
  if (cached) return cached;

  console.log(`🎨 Gerando nova imagem: ${imageType} — "${prompt.substring(0, 60)}"`);
  const imageUrl = await generateFn();

  // Guarda em background sem bloquear a resposta
  setCachedImage(prompt, imageType, imageUrl).catch(() => {});

  return imageUrl;
}

module.exports = { getOrGenerateImage, getCachedImage, setCachedImage };