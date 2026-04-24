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
    createdAt: { type: Date, default: Date.now },
    ingredients: [{ type: String }],
    steps: [{ type: String }],
    time: { type: String, default: "30 min" },
    difficulty: { type: String, default: "Média" }
});

// Esquema Principal do Perfil
const ProfileSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["infantil", "senior"], required: true },
    birthDate: { type: Date, required: true },
    profileImage: { type: String, default: "" },
    country: { type: String },
    allergies: [{ type: String }],
    intolerances: [{ type: String }],
    conditions: [{ type: String }],
    difficulties: [{ type: String }],
    emergencyInfo: { type: String },
    healthObservations: [{ type: String }],
    lembretes: {
        type: [{
            hora: { type: String, required: true },
            tipo: { type: String, required: true },
            ativo: { type: Boolean, default: true }
        }],
        default: [
            { hora: '08:00', tipo: 'Café da Manhã', ativo: true },
            { hora: '13:00', tipo: 'Almoço', ativo: true },
            { hora: '20:00', tipo: 'Jantar', ativo: true }
        ]
    },
    planejamentoSemanal: {
        type: {
            segunda: { cafe: { type: Boolean, default: true }, almoco: { type: Boolean, default: true }, jantar: { type: Boolean, default: true }, lanche: { type: Boolean, default: false } },
            terca: { cafe: { type: Boolean, default: true }, almoco: { type: Boolean, default: true }, jantar: { type: Boolean, default: true }, lanche: { type: Boolean, default: false } },
            quarta: { cafe: { type: Boolean, default: true }, almoco: { type: Boolean, default: true }, jantar: { type: Boolean, default: true }, lanche: { type: Boolean, default: false } },
            quinta: { cafe: { type: Boolean, default: true }, almoco: { type: Boolean, default: true }, jantar: { type: Boolean, default: true }, lanche: { type: Boolean, default: false } },
            sexta: { cafe: { type: Boolean, default: true }, almoco: { type: Boolean, default: true }, jantar: { type: Boolean, default: true }, lanche: { type: Boolean, default: false } },
            sabado: { cafe: { type: Boolean, default: false }, almoco: { type: Boolean, default: true }, jantar: { type: Boolean, default: true }, lanche: { type: Boolean, default: true } },
            domingo: { cafe: { type: Boolean, default: false }, almoco: { type: Boolean, default: true }, jantar: { type: Boolean, default: true }, lanche: { type: Boolean, default: true } }
        },
        default: {
            segunda: { cafe: true, almoco: true, jantar: true, lanche: false },
            terca: { cafe: true, almoco: true, jantar: true, lanche: false },
            quarta: { cafe: true, almoco: true, jantar: true, lanche: false },
            quinta: { cafe: true, almoco: true, jantar: true, lanche: false },
            sexta: { cafe: true, almoco: true, jantar: true, lanche: false },
            sabado: { cafe: false, almoco: true, jantar: true, lanche: true },
            domingo: { cafe: false, almoco: true, jantar: true, lanche: true }
        }
    },
    recipes: [RecipeSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Profile", ProfileSchema);