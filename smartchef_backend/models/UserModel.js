const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  avatar: String,
  preferences: { type: mongoose.Schema.Types.ObjectId, ref: "Preference" },

  dailyLimit: { type: Number, default: 10 },
  weeklyLimit: { type: Number, default: 50 },
  usedDaily: { type: Number, default: 0 },
  usedWeekly: { type: Number, default: 0 },
  lastReset: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);