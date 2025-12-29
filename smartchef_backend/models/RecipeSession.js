const mongoose = require("mongoose");


const StepSchema = new mongoose.Schema({
  stepNumber: Number,

  objective: String,
  expectedAction: String,
  expectedVisual: String,
  warnings: [String],

  userText: String,
  userImageUrl: String,

  visionAnalysis: Object,

  validationStatus: {
    type: String,
    enum: ["PENDING", "VALID", "INVALID"],
    default: "PENDING"
  },

  chefFeedback: String,
  completedAt: Date
});

const recipeSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  sessionId: {
    type: String,
    unique: true,
    index: true,
    required: true
  },

  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe"
  },

  recipeTitle: String,

  status: {
    type: String,
    enum: ["IN_PROGRESS", "COMPLETED", "ABANDONED"],
    default: "IN_PROGRESS"
  },

  currentStepIndex: {
    type: Number,
    default: 0
  },

  mode: {
    type: String,
    enum: ["CHAT", "EXPLORATION", "RECIPE_ACTIVE"],
    default: "CHAT"
  },

  cookingConfirmed: {
    type: Boolean,
    default: false
  },

  steps: [StepSchema],

  startedAt: {
    type: Date,
    default: Date.now
  },

  finishedAt: Date
});

// Index para encontrar rapidamente a sessão ativa do utilizador
recipeSessionSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("RecipeSession", recipeSessionSchema);