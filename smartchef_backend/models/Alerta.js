  const mongoose = require("mongoose");

  const AlertaSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Observacao" },
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" }, // Para infantil/sênior
    
    // Tipo de alerta
    type: {
      type: String,
      enum: ["sugar", "salt", "calories", "allergy", "nutrient", "balance", "schedule"],
      required: true
    },
    
    // Dados do alerta
    severity: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    
    // Valores relacionados
    threshold: { type: Number }, // Limite (ex: 25g)
    currentValue: { type: Number }, // Valor atual (ex: 35g)
    unit: { type: String }, // "g", "mg", etc.
    
    // Ações possíveis
    actions: [{
      label: String, // "Ignorar e continuar", "Sugerir alternativa"
      action: String, // "ignore", "suggest_alternative", "adjust_limits"
      endpoint: String // Rota para chamar
    }],
    
    // Estado
    active: { type: Boolean, default: true },
    dismissed: { type: Boolean, default: false },
    triggeredAt: { type: Date, default: Date.now },
    
    // Dados da receita que causou o alerta
    recipeData: {
      title: String,
      ingredients: [String],
      totalSugar: Number,
      totalSalt: Number,
      totalCalories: Number
    }
  });

  module.exports = mongoose.model("Alerta", AlertaSchema);