const User = require("../models/User");

exports.getGlobalMetrics = async (req, res) => {
  try {
    // 1. Contagem de utilizadores por plano
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ isPremium: true });
    const freeUsers = totalUsers - premiumUsers;

    // 2. Soma do uso diário de IA (Ponto 4 do roteiro)
    const usageData = await User.aggregate([
      {
        $group: {
          _id: null,
          totalText: { $sum: "$usage.dailyTextRequests" },
          totalImages: { $sum: "$usage.dailyImageGenerations" },
          totalAnalysis: { $sum: "$usage.dailyImageAnalysis" }
        }
      }
    ]);

    const metrics = usageData[0] || { totalText: 0, totalImages: 0, totalAnalysis: 0 };

    // 3. Estimativa de custo (Valores exemplo da OpenAI/Cloudflare)
    // Ex: 0.01$ por cada 1k tokens ou imagem gerada
    const estimatedCost = (metrics.totalText * 0.002) + (metrics.totalImages * 0.04);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, premium: premiumUsers, free: freeUsers },
        dailyUsage: metrics,
        estimatedCostUSD: estimatedCost.toFixed(2),
        activeToday: await User.countDocuments({ lastReset: { $gte: new Date().setHours(0,0,0,0) } })
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao gerar métricas: " + err.message });
  }
};