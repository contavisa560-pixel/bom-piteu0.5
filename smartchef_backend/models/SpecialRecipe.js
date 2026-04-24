const mongoose = require("mongoose");

const SpecialRecipeSchema = new mongoose.Schema({
    // Tipo: 'petisco', 'doce', 'cocktail'
    tipo: {
        type: String,
        enum: ["petisco", "doce", "cocktail"],
        required: true,
        index: true,
    },

    // Campos comuns
    nome: { type: String, required: true, trim: true },
    pais: { type: String, required: true },
    categoria: { type: String, required: true },
    tempo: { type: String, required: true },
    dificuldade: { type: String, enum: ["Fácil", "Médio", "Difícil"], required: true },
    descricao: { type: String, required: true },
    tags: { type: [String], default: [] },
    imagem_url: { type: String, default: "" },
    ativo: { type: Boolean, default: true },
    ordem: { type: Number, default: 0 },

    // Campos específicos por tipo
    // Petiscos
    bebida_sugerida: { type: String, default: "" },

    // Doces
    vegano: { type: Boolean, default: false },

    // Cocktails
    perfil_alimentar: { type: String, default: "" }, // "Com Álcool" | "Sem Álcool"
    ingredientes: { type: String, default: "" },
    passo_passo: { type: String, default: "" },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

SpecialRecipeSchema.index({ tipo: 1, ativo: 1 });
SpecialRecipeSchema.index({ nome: "text" });

module.exports = mongoose.model("SpecialRecipe", SpecialRecipeSchema);