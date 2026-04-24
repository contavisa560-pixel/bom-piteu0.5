const crypto = require("crypto");
const ImageCache = require("../models/ImageCache");

function normalizePrompt(prompt, imageType) {
  const normalized = prompt
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s\u00C0-\u024F]/g, "");

  return `${imageType}::${normalized}`;
}

function generateHash(prompt, imageType) {
  const key = normalizePrompt(prompt, imageType);
  return crypto.createHash("md5").update(key).digest("hex");
}

async function getCachedImage(prompt, imageType = "recipe") {
  try {
    const hash = generateHash(prompt, imageType);
    const cached = await ImageCache.findOne({ hash });

    if (!cached) {
      console.log(`📭 Cache MISS: ${imageType} — "${prompt.substring(0, 50)}..."`);
      return null;
    }

    // ✅ ALTERAÇÃO 2 — agora loga se falhar
    ImageCache.findByIdAndUpdate(cached._id, {
      $inc: { hitCount: 1 },
      lastUsedAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    }).exec().catch(err => console.error("⚠️ Cache hit update falhou:", err.message));

    console.log(
      `✅ Cache HIT: ${imageType} — "${prompt.substring(0, 50)}..." (usado ${cached.hitCount + 1}x)`
    );

    return cached.imageUrl;
  } catch (error) {
    console.error("⚠️ Erro ao consultar cache (continuando sem cache):", error.message);
    return null;
  }
}

async function setCachedImage(prompt, imageType = "recipe", imageUrl) {
  try {
    const hash = generateHash(prompt, imageType);

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

    console.log(`💾 Cache SALVO: ${imageType} — "${prompt.substring(0, 50)}..."`);
  } catch (error) {
    console.error("⚠️ Erro ao salvar no cache (imagem gerada normalmente):", error.message);
  }
}

async function getOrGenerateImage(prompt, imageType, generateFn) {
  const cached = await getCachedImage(prompt, imageType);
  if (cached) return cached;

  console.log(`🎨 Gerando nova imagem: ${imageType} — "${prompt.substring(0, 60)}..."`);
  const imageUrl = await generateFn();

  setCachedImage(prompt, imageType, imageUrl).catch(() => {});

  return imageUrl;
}

// ✅ ALTERAÇÃO 1 — getCacheStats completo
async function getCacheStats() {
  const COST_PER_IMAGE_USD = 0.04;

  const [total, byTypeRaw, topHits, recentSaved, globalAgg] = await Promise.all([
    ImageCache.countDocuments(),
    ImageCache.aggregate([
      {
        $group: {
          _id: "$imageType",
          count: { $sum: 1 },
          totalHits: { $sum: "$hitCount" },
          avgHits: { $avg: "$hitCount" },
        },
      },
      { $sort: { count: -1 } },
    ]),
    ImageCache.find()
      .sort({ hitCount: -1 })
      .limit(10)
      .select("prompt imageType hitCount lastUsedAt imageUrl"),
    ImageCache.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("prompt imageType hitCount createdAt imageUrl"),
    ImageCache.aggregate([
      { $group: { _id: null, totalReusos: { $sum: "$hitCount" } } },
    ]),
  ]);

  const totalReusos = globalAgg[0]?.totalReusos ?? 0;
  const estimatedSavingsUSD = (totalReusos * COST_PER_IMAGE_USD).toFixed(2);

  return {
    total,
    totalReusos,
    estimatedSavingsUSD,
    byType: byTypeRaw,
    topHits,
    recentSaved,
  };
}

module.exports = {
  getOrGenerateImage,
  getCachedImage,
  setCachedImage,
  getCacheStats,
};