const mongoose = require("mongoose");


const recipeSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipeTitle: {
      type: String,
      required: true,
    },
    // Guarda a lista completa de passos vinda da IA
    steps: [
      {
        stepNumber: Number,
        description: String,
        completed: { type: Boolean, default: false },
      },
    ],
    // O ponteiro para o passo atual
    currentStepIndex: {
      type: Number,
      default: 0,
    },
    // Status da sessão: 'active', 'completed', ou 'abandoned'
    status: {
      type: String,
      enum: ["active", "completed", "abandoned"],
      default: "active",
    },
    // Metadados úteis para o dashboard e métricas
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    
    // Armazena a receita completa em JSON para não ter de gerar novamente
    fullRecipeData: {
      type: Object,
      required: true,
    }
  },
  { timestamps: true }
);

// Index para encontrar rapidamente a sessão ativa do utilizador
recipeSessionSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("RecipeSession", recipeSessionSchema);

