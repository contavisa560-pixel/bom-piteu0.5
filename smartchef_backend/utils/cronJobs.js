const cron = require("node-cron");
const User = require("./models/User");
const limitService = require("./services/limitService");

module.exports.start = function() {
  // Reset diário à meia-noite
  cron.schedule("0 0 * * *", async () => {
    const users = await User.find();
    for (const u of users) await limitService.resetIfNeeded(u);
    console.log("✅ Limites diários resetados");
  });

  // Reset semanal domingo à meia-noite
  cron.schedule("0 0 * * 0", async () => {
    const users = await User.find();
    for (const u of users) {
      u.usedWeekly = { text:0, gen:0, vision:0 };
      await u.save();
    }
    console.log("✅ Limites semanais resetados");
  });
};
