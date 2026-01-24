const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  type: { type: String, enum: ["personal_comment", "sensation"], default: "personal_comment" },
  emoji: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const ObservacaoSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  imageUrl: { type: String, required: true },
  imageType: { type: String, enum: ["recipe", "screenshot", "personal_photo"], default: "recipe" },
  tags: [{ type: String }],
  notes: [NoteSchema],
  favorite: { type: Boolean, default: false },
  readyToCook: { type: String, enum: ["now", "later", "false"], default: "false" },
  // Armazena o JSON que a IA extrair da foto
  recipeData: {
    title: String,
    ingredients: [String],
    steps: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Observacao", ObservacaoSchema);