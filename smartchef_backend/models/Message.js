const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  role: {
    type: String,
    enum: ["user", "assistant", "system"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  // Para guardar imagens
  imageUrl: {
    type: String
  },
  imageBase64: {
    type: String // Para imagens pequenas
  },
  // Para referenciar sessões
  sessionId: {
    type: String,
    index: true
  },
  //  Metadados específicos
  metadata: {
    recipeStep: Number,
    recipeTitle: String,
    imageGenerated: Boolean,
    messageType: String // 'text', 'image', 'recipe_step', 'recipe_complete'
  },
  model: {
    type: String,
  },
  tokens: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model("Message", MessageSchema);