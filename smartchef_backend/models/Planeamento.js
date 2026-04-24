const mongoose = require('mongoose');

const PlaneamentoSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Observacao', required: true },
  recipeTitle: { type: String, required: true },
  date: { type: Date, required: true },
  mealType: {
    type: String,
    enum: ['pequeno-almoco', 'almoco', 'jantar', 'snack'],
    default: 'almoco'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Planeamento', PlaneamentoSchema);