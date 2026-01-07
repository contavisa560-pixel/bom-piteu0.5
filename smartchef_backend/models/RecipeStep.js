const mongoose = require("mongoose");

const RecipeStepSchema = new mongoose.Schema({
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe",
    required: true
  },

  stepNumber: {
    type: Number,
    required: true
  },

  objective: {
    type: String,
    required: true
  },

  expectedAction: {
    type: String,
    required: true
  },

  expectedVisual: {
    type: String,
    required: true
  },

  warnings: [String]

}, {
  timestamps: true
});

RecipeStepSchema.index({ recipeId: 1, stepNumber: 1 }, { unique: true });

module.exports = mongoose.model("RecipeStep", RecipeStepSchema);
