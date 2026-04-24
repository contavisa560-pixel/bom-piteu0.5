    const mongoose = require("mongoose");

    const HealthAlertSchema = new mongoose.Schema({
        type: {
            type: String,
            enum: ["sugar", "salt", "calories", "allergy", "nutrient"],
            required: true
        },
        message: { type: String, required: true },
        threshold: { type: Number }, // Ex: 25g de açúcar
        currentValue: { type: Number }, // Ex: 35g
        active: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now }
    });

    const NutrientProgressSchema = new mongoose.Schema({
        nutrient: { type: String, required: true }, // "Vitamina C", "Ferro", etc.
        percentage: { type: Number, default: 0 }, // 80%
        unit: { type: String }, // "mg", "UI", etc.
        dailyGoal: { type: Number },
        currentIntake: { type: Number },
        updatedAt: { type: Date, default: Date.now }
    });

    const FavoriteRecipeSchema = new mongoose.Schema({
        recipeId: { type: String, required: true },
        title: String,
        imageUrl: String,
        addedAt: { type: Date, default: Date.now }
    });

    const SaudeSchema = new mongoose.Schema({
        userId: {
            type: String,
            required: true,
        },

        // Estatísticas do mês atual
        monthlyStats: {
            vegetablesCount: { type: Number, default: 0 }, 
            fruitsCount: { type: Number, default: 0 },
            proteinsCount: { type: Number, default: 0 },
            startDate: { type: Date, default: Date.now }
        },

        // Limites pessoais
        limits: {
            sugar: { type: Number, default: 25 },
            salt: { type: Number, default: 5 },
            calories: { type: Number, default: 2000 },
            fat: { type: Number, default: 20 },  
            sugarAlert: { type: Boolean, default: false },
            fatAlert: { type: Boolean, default: false },
            caloriesAlert: { type: Boolean, default: false }
        },

        // 5 bolos favoritos 
        favoriteRecipes: [FavoriteRecipeSchema],

        // Progresso nutricional
        nutrientProgress: [NutrientProgressSchema],

        // Alertas ativos
        activeAlerts: [HealthAlertSchema],

        mealHistory: [{
            date: { type: Date, default: Date.now },
            recipeId: { type: String },
            recipeTitle: String,
            mealType: {
                type: String,
                enum: ["breakfast", "lunch", "dinner", "snack"],
                default: "lunch"
            },
            ingredients: [String],
            notes: String,
            mood: String,
            rating: { type: Number, min: 1, max: 5 },
            nutritionalInfo: {
                calories: String,
                protein: String,
                carbs: String,
                fat: String
            },
            source: {
                type: String,
                enum: ["manual", "recipe", "favorite", "imported"],
                default: "manual"
            },
            isDetailed: { type: Boolean, default: false },
            imageUrl: String
        }],

        lastUpdated: { type: Date, default: Date.now }
    });

    module.exports = mongoose.model("Saude", SaudeSchema);