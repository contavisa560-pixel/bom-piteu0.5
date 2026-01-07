const limitService = require("../services/limitService");

function checkLimitsMiddleware(type) {
  return async (req, res, next) => {
    const userId = req.body.userId || req.query.userId;

    if (!userId) return res.status(400).json({ error: "userId_missing" });

    try {
      const result = await limitService.checkLimits(userId, type);

      if (!result.allowed) {
        return res.status(403).json({
          error: "limit_reached",
          message: result.message,
        });
      }

      req.limitType = type;
      next();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "limit_check_failed" });
    }
  };
}

module.exports = { checkLimitsMiddleware };


module.exports = { checkLimitsMiddleware };
