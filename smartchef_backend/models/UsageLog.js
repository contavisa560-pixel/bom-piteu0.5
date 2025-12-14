const mongoose = require("mongoose");

const UsageLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["text", "image", "vision"],
      required: true,
    },

    model: {
      type: String,
      required: true,
    },

    tokens: {
      type: Number,
      default: 0,
    },

    costUSD: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UsageLog", UsageLogSchema);
