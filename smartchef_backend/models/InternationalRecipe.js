const mongoose = require("mongoose");

const InternationalRecipeSchema = new mongoose.Schema({
  nome_receita:    { type: String, required: true, trim: true },
  pais:            { type: String, required: true, trim: true },
  categoria:       { type: String, required: true },
  tempo_preparo:   { type: String, required: true },
  ingredientes:    { type: String, required: true },
  passo_passo:     { type: String, required: true },
  perfil_alimentar:{ type: String, required: true },
  imagem_url:      { type: String, default: "" },
  ativo:           { type: Boolean, default: true },
  ordem:           { type: Number, default: 0 },
  createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy:       { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

// Índices para pesquisa rápida
InternationalRecipeSchema.index({ pais: 1, ativo: 1 });
InternationalRecipeSchema.index({ nome_receita: "text" });

module.exports = mongoose.model("InternationalRecipe", InternationalRecipeSchema);