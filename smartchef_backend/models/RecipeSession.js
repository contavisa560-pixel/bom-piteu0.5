const mongoose = require("mongoose");

const RecipeStepSchema = new mongoose.Schema(
  {
    stepNumber: Number,
    title: String,
    description: String,
    imageUrl: String,
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const RecipeSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // imagem enviada pelo utilizador
    sourceImage: {
      type: String,  // ← SEM required: true
    },


    // opções sugeridas pela IA
    recipeOptions: [
      {
        title: String,
        description: String,
      },
    ],
    
    recipeFinalImage: {
      type: String,
      default: null
    },

    // receita escolhida
    selectedRecipe: {
      title: String,
      ingredients: [String],
      steps: [RecipeStepSchema],
    },

    currentStep: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["OPTIONS", "SELECTED", "IN_PROGRESS", "COMPLETED"],
      default: "OPTIONS",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RecipeSession", RecipeSessionSchema);
