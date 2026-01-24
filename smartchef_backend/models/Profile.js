const mongoose = require("mongoose");

// Sub-esquema para Notas/Emojis
const NoteSchema = new mongoose.Schema({
    content: { type: String, required: true },
    emoji: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

// Sub-esquema para Receitas
const RecipeSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    mealType: { type: String, enum: ["breakfast", "lunch", "dinner", "snack"], required: true },
    quantity: { type: Number, default: 1 },
    notes: [NoteSchema],
    generatedByAssistant: { type: Boolean, default: false },
    readyToCook: { type: String, enum: ["now", "later", "false"], default: "false" },
    createdAt: { type: Date, default: Date.now }
});

// Esquema Principal do Perfil
const ProfileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ["infantil", "senior"], required: true },
    age: { type: Number, required: true },
    country: { type: String },
    allergies: [{ type: String }],
    intolerances: [{ type: String }],
    healthObservations: [{ type: String }],
    recipes: [RecipeSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Profile", ProfileSchema);