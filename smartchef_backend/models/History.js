// models/History.js
const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  type: {
    type: String,
    enum: ["text", "image", "vision"],
    required: true
  },

  prompt: {
    type: String,
    required: true
  },

  response: {
    type: mongoose.Schema.Types.Mixed
  },

  tokensUsed: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("History", HistorySchema);
