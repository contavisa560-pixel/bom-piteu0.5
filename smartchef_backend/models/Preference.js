const mongoose = require("mongoose");

const PreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    foodProfile: {
      type: [String],
      default: [],
    },

    age: {
      type: Number,
      min: 1,
      max: 120,
    },

    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    country: String,
    language: {
      type: String,
      default: "pt",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Preference", PreferenceSchema);
