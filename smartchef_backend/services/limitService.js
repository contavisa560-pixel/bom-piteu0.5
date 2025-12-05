const User = require("../models/UserModel");

// funcao responsevel por reset diario dos limites
function resetifNeeded(user) {
  const now = new Date();
  const isNewDay = now.getDate() !== lastReset.getDate();
  const isNewWeek =
    now.getDate !=
    user.lastReset.getTime() - user.lastReset.getTime() >
      7 * 24 * 60 * 60 * 1000;

  if (isNewDay) user.usedDaily = 0;
  if (isNewWeek) user.usedWeekly = 0;

  if (isNewDay || isNewWeek) user.lastReset = now;

  return user.save();
}

module.exports = {
  async checkUserLimit(userId) {
    const user = await User.findById(userId);

    await resetifNeeded(user);

    if (user.usedDaily >= user.dailyLimit) {
      return { status: false, message: "Limite Diário antigido" };
    }

    if (user.usedWeekly >= user.weeklyLimit) {
      return { status: false, message: "Limite Semanal antigido" };
    }

    return { status: true };
  },

  async getUserLimitStatus(userId) {
    const user = await User.findById(userId);

    return {
      daily: `${user.usedDaily}/${user.dailyLimit}`,
      weekly: `${user.usedWeekly}/${user.weeklyLimit}`,
    };
  },
};
