const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  description: String,

  totalSteps: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "ACTIVE"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Recipe", RecipeSchema);
