// routes/saude.js - CORREÇÃO COMPLETA
const express = require("express");
const router = express.Router();
const Saude = require("../models/Saude");
const multer = require('multer');
const { uploadToCloudflare } = require('../services/storageService');
// Configuração do multer para upload de imagens
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
// 1. GET - Obter dashboard de saúde completo
router.get("/:userId", async (req, res) => {
    try {
        let saude = await Saude.findOne({ userId: req.params.userId });

        if (!saude) {
            // CRIAR NOVO DASHBOARD REAL
            saude = new Saude({
                userId: req.params.userId,
                monthlyStats: {
                    vegetablesCount: 0,
                    fruitsCount: 0,
                    proteinsCount: 0,
                    startDate: new Date()
                },
                limits: {
                    sugar: 25,
                    salt: 5,
                    calories: 2000,
                    sugarAlert: false,
                    fatAlert: false,
                    caloriesAlert: false
                },
                favoriteRecipes: [],
                nutrientProgress: [],
                activeAlerts: [],
                mealHistory: []
            });
            await saude.save();
        }

        res.json(saude);
    } catch (err) {
        console.error("❌ ERRO dashboard saúde:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. POST - Adicionar refeição REAL (com suporte a imagem)
router.post("/:userId/meal", upload.single('image'), async (req, res) => {
    try {
        console.log('📥 Recebendo dados da refeição:', req.body);
        console.log('🖼️ Ficheiro recebido:', req.file ? req.file.originalname : 'nenhum');

        let saude = await Saude.findOne({ userId: req.params.userId });
        if (!saude) {
            saude = new Saude({ userId: req.params.userId });
        }

        // Processar os campos do formulário
        let title, mealType, notes, mood, rating, isDetailed, ingredients, nutritionalInfo;
        let imageUrl = null;

        // Se for multipart/form-data (com imagem)
        if (req.file) {
            // Fazer upload da imagem para Cloudflare R2
            imageUrl = await uploadToCloudflare(req.file.buffer, req.file.originalname, 'meals');

            // Campos enviados pelo FormData
            title = req.body.title;
            mealType = req.body.mealType;
            notes = req.body.notes;
            mood = req.body.mood;
            rating = req.body.rating ? parseInt(req.body.rating) : 3;
            isDetailed = req.body.isDetailed === 'true';

            // Ingredientes: podem vir como array ou string
            if (req.body.ingredients) {
                if (Array.isArray(req.body.ingredients)) {
                    ingredients = req.body.ingredients;
                } else {
                    ingredients = [req.body.ingredients];
                }
            } else {
                ingredients = [];
            }

            // Informação nutricional (string JSON)
            if (req.body.nutritionalInfo) {
                nutritionalInfo = JSON.parse(req.body.nutritionalInfo);
            } else {
                nutritionalInfo = {};
            }
        } else {
            // Se for JSON (sem imagem)
            title = req.body.title;
            mealType = req.body.mealType;
            ingredients = req.body.ingredients || [];
            notes = req.body.notes || "";
            mood = req.body.mood || "😊";
            rating = req.body.rating || 3;
            nutritionalInfo = req.body.nutritionalInfo || {};
            isDetailed = req.body.isDetailed || false;
        }

        // Criar o objeto da refeição
        const newMeal = {
            recipeId: "meal_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
            recipeTitle: title || "Refeição " + new Date().toLocaleDateString(),
            mealType: mealType || "lunch",
            ingredients: ingredients || [],
            notes: notes || "",
            mood: mood || "😊",
            rating: rating || 3,
            nutritionalInfo: nutritionalInfo || {},
            source: "manual",
            isDetailed: isDetailed || false,
            date: new Date(),
            imageUrl: imageUrl   // pode ser null (sem imagem) ou URL
        };

        saude.mealHistory.unshift(newMeal);

        // Atualizar estatísticas (vegetais)
        if (ingredients && ingredients.length > 0) {
            const vegWords = ["alface", "tomate", "cenoura", "brócolos", "espinafre", "legume", "vegetal"];
            const hasVeg = ingredients.some(ing =>
                vegWords.some(word => ing.toLowerCase().includes(word))
            );
            if (hasVeg) {
                saude.monthlyStats.vegetablesCount += 1;
            }
        }

        // Limitar histórico
        if (saude.mealHistory.length > 100) {
            saude.mealHistory = saude.mealHistory.slice(0, 100);
        }

        await saude.save();
        res.json({ success: true, meal: newMeal });

    } catch (err) {
        console.error("❌ ERRO adicionar refeição:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. POST - Adicionar refeição REAL (com suporte a imagem)
router.post("/:userId/meal", upload.single('image'), async (req, res) => {
    try {
        console.log(' Recebendo dados da refeição:', req.body);
        console.log(' Ficheiro recebido:', req.file ? req.file.originalname : 'nenhum');

        let saude = await Saude.findOne({ userId: req.params.userId });
        if (!saude) {
            saude = new Saude({ userId: req.params.userId });
        }

        // Processar os campos do formulário
        let title, mealType, notes, mood, rating, isDetailed, ingredients, nutritionalInfo;
        let imageUrl = null;

        // Se for multipart/form-data (com imagem)
        if (req.file) {
            // Fazer upload da imagem para Cloudflare R2
            imageUrl = await uploadToCloudflare(req.file.buffer, req.file.originalname, 'meals');

            // Campos enviados pelo FormData
            title = req.body.title;
            mealType = req.body.mealType;
            notes = req.body.notes;
            mood = req.body.mood;
            rating = req.body.rating ? parseInt(req.body.rating) : 3;
            isDetailed = req.body.isDetailed === 'true';

            // Ingredientes: podem vir como array ou string
            if (req.body.ingredients) {
                if (Array.isArray(req.body.ingredients)) {
                    ingredients = req.body.ingredients;
                } else {
                    ingredients = [req.body.ingredients];
                }
            } else {
                ingredients = [];
            }

            // Informação nutricional (string JSON)
            if (req.body.nutritionalInfo) {
                nutritionalInfo = JSON.parse(req.body.nutritionalInfo);
            } else {
                nutritionalInfo = {};
            }
        } else {
            // Se for JSON (sem imagem)
            title = req.body.title;
            mealType = req.body.mealType;
            ingredients = req.body.ingredients || [];
            notes = req.body.notes || "";
            mood = req.body.mood || "😊";
            rating = req.body.rating || 3;
            nutritionalInfo = req.body.nutritionalInfo || {};
            isDetailed = req.body.isDetailed || false;
        }

        // Criar o objeto da refeição
        const newMeal = {
            recipeId: "meal_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
            recipeTitle: title || "Refeição " + new Date().toLocaleDateString(),
            mealType: mealType || "lunch",
            ingredients: ingredients || [],
            notes: notes || "",
            mood: mood || "😊",
            rating: rating || 3,
            nutritionalInfo: nutritionalInfo || {},
            source: "manual",
            isDetailed: isDetailed || false,
            date: new Date(),
            imageUrl: imageUrl   // pode ser null (sem imagem) ou URL
        };

        saude.mealHistory.unshift(newMeal);

        // Atualizar estatísticas (vegetais)
        if (ingredients && ingredients.length > 0) {
            const vegWords = ["alface", "tomate", "cenoura", "brócolos", "espinafre", "legume", "vegetal"];
            const hasVeg = ingredients.some(ing =>
                vegWords.some(word => ing.toLowerCase().includes(word))
            );
            if (hasVeg) {
                saude.monthlyStats.vegetablesCount += 1;
            }
        }

        // Limitar histórico
        if (saude.mealHistory.length > 100) {
            saude.mealHistory = saude.mealHistory.slice(0, 100);
        }

        await saude.save();
        res.json({ success: true, meal: newMeal });

    } catch (err) {
        console.error("❌ ERRO adicionar refeição:", err);
        res.status(500).json({ error: err.message });
    }
});

// 3. PUT - Atualizar limites PESSOAIS REAIS
router.put("/:userId/limits", async (req, res) => {
    try {
        const {
            sugar, salt, calories,
            sugarAlert, fatAlert, caloriesAlert,
            favoriteRecipes // ← importante para quando adiciona favorito via esta rota
        } = req.body;

        let saude = await Saude.findOne({ userId: req.params.userId });
        if (!saude) {
            saude = new Saude({ userId: req.params.userId });
        }

        // Se existir saude.limits, usa como base; senão, defaults
        const currentLimits = saude.limits || {};

        // Atualiza limites preservando valores existentes se não enviados
        saude.limits = {
            sugar: sugar !== undefined ? sugar : currentLimits.sugar ?? 25,
            salt: salt !== undefined ? salt : currentLimits.salt ?? 5,
            calories: calories !== undefined ? calories : currentLimits.calories ?? 2000,
            sugarAlert: sugarAlert !== undefined ? sugarAlert : currentLimits.sugarAlert ?? false,
            fatAlert: fatAlert !== undefined ? fatAlert : currentLimits.fatAlert ?? false,
            caloriesAlert: caloriesAlert !== undefined ? caloriesAlert : currentLimits.caloriesAlert ?? false
        };

        // Se favoriteRecipes for enviado, atualiza (usado na função adicionarFavoritoSaude)
        if (favoriteRecipes !== undefined) {
            saude.favoriteRecipes = favoriteRecipes;
        }

        await saude.save();
        res.json({ success: true, limits: saude.limits, favoriteRecipes: saude.favoriteRecipes });
    } catch (err) {
        console.error("❌ ERRO atualizar limites:", err);
        res.status(500).json({ error: err.message });
    }
});

// 4. POST - Adicionar favorito REAL
router.post("/:userId/favorite", async (req, res) => {
    try {
        const { recipeId, title, imageUrl } = req.body;

        if (!recipeId || !title) {
            return res.status(400).json({ error: "recipeId e title são obrigatórios" });
        }

        let saude = await Saude.findOne({ userId: req.params.userId });
        if (!saude) {
            saude = new Saude({ userId: req.params.userId });
        }

        // VERIFICAR SE JÁ É FAVORITO
        const jaFavorito = saude.favoriteRecipes.some(fav => fav.recipeId === recipeId);
        if (jaFavorito) {
            return res.status(400).json({ error: "Já está nos favoritos" });
        }

        // LIMITAR A 5 FAVORITOS REAIS
        if (saude.favoriteRecipes.length >= 5) {
            saude.favoriteRecipes.shift(); // Remove o mais antigo
        }

        // ADICIONAR FAVORITO REAL
        saude.favoriteRecipes.push({
            recipeId,
            title,
            imageUrl: imageUrl || "/uploads/default-recipe.jpg"
        });

        await saude.save();
        res.json({ success: true, favorites: saude.favoriteRecipes });
    } catch (err) {
        console.error("❌ ERRO adicionar favorito:", err);
        res.status(500).json({ error: err.message });
    }
});

// 5. GET - Relatório médico REAL
router.get("/:userId/report", async (req, res) => {
    try {
        const saude = await Saude.findOne({ userId: req.params.userId });

        if (!saude) {
            return res.status(404).json({ error: "Perfil não encontrado" });
        }

        // RELATÓRIO REAL
        const report = {
            user: req.params.userId,
            period: "Últimos 30 dias",
            stats: {
                totalMeals: saude.mealHistory.length,
                vegetables: saude.monthlyStats.vegetablesCount,
                favorites: saude.favoriteRecipes.length,
                lastUpdate: saude.lastUpdated
            },
            limits: saude.limits,
            fat: saude.limits?.fat || 20 ,
            recentMeals: saude.mealHistory.slice(0, 10),
            generatedAt: new Date(),
            note: "Relatório gerado pelo Bom Piteu"
        };

        res.json(report);
    } catch (err) {
        console.error("❌ ERRO gerar relatório:", err);
        res.status(500).json({ error: err.message });
    }
});

// 6. POST - Progresso nutricional REAL
router.post("/:userId/nutrients", async (req, res) => {
    try {
        const { nutrient, percentage, unit, dailyGoal, currentIntake } = req.body;

        let saude = await Saude.findOne({ userId: req.params.userId });
        if (!saude) {
            saude = new Saude({ userId: req.params.userId });
        }

        // ATUALIZAR OU ADICIONAR NUTRIENTE REAL
        const index = saude.nutrientProgress.findIndex(n => n.nutrient === nutrient);

        if (index >= 0) {
            saude.nutrientProgress[index] = {
                nutrient,
                percentage: percentage || 0,
                unit: unit || "mg",
                dailyGoal: dailyGoal || 100,
                currentIntake: currentIntake || 0,
                updatedAt: new Date()
            };
        } else {
            saude.nutrientProgress.push({
                nutrient,
                percentage: percentage || 0,
                unit: unit || "mg",
                dailyGoal: dailyGoal || 100,
                currentIntake: currentIntake || 0,
                updatedAt: new Date()
            });
        }

        await saude.save();
        res.json({ success: true, nutrients: saude.nutrientProgress });
    } catch (err) {
        console.error("❌ ERRO atualizar nutrientes:", err);
        res.status(500).json({ error: err.message });
    }
});

// 7. GET - Buscar receita favorita específica
router.get("/favorites/:recipeId", async (req, res) => {
    try {
        const { recipeId } = req.params;
        const userId = req.query.userId;

        console.log('🔍 Buscando favorito:', { recipeId, userId });

        // Buscar em todos os perfis de saúde
        const saude = await Saude.findOne({
            'favoriteRecipes.recipeId': recipeId
        });

        if (!saude) {
            console.log('❌ Favorito não encontrado');
            return res.status(404).json({
                error: "Receita favorita não encontrada",
                recipeId,
                availableFavorites: []
            });
        }

        const favoriteRecipe = saude.favoriteRecipes.find(fav => fav.recipeId === recipeId);

        if (!favoriteRecipe) {
            return res.status(404).json({ error: "Favorito não encontrado" });
        }

        console.log('✅ Favorito encontrado:', favoriteRecipe.title);

        // Retornar dados enriquecidos
        res.json({
            success: true,
            ...favoriteRecipe,
            belongsTo: saude.userId,
            addedAt: favoriteRecipe.addedAt,
            // Campos adicionais para compatibilidade
            ingredients: favoriteRecipe.ingredients || ["Ingredientes a definir"],
            steps: favoriteRecipe.steps || ["Passos a definir"],
            healthScore: favoriteRecipe.healthScore || 8,
            difficulty: favoriteRecipe.difficulty || "Média"
        });

    } catch (err) {
        console.error("❌ ERRO buscar favorito:", err);
        res.status(500).json({ error: err.message });
    }
});
// 8. DELETE - Remover favorito REAL
router.delete("/:userId/favorite/:recipeId", async (req, res) => {
    try {
        const { userId, recipeId } = req.params;

        console.log('🗑️ Removendo favorito:', { userId, recipeId });

        const saude = await Saude.findOne({ userId });

        if (!saude) {
            return res.status(404).json({ error: "Perfil não encontrado" });
        }

        // Filtrar para remover o favorito específico
        const initialLength = saude.favoriteRecipes.length;
        saude.favoriteRecipes = saude.favoriteRecipes.filter(
            fav => fav.recipeId !== recipeId
        );

        if (initialLength === saude.favoriteRecipes.length) {
            return res.status(404).json({
                error: "Favorito não encontrado",
                recipeId
            });
        }

        await saude.save();

        res.json({
            success: true,
            message: "Favorito removido com sucesso",
            remainingFavorites: saude.favoriteRecipes.length
        });

    } catch (err) {
        console.error("❌ ERRO remover favorito:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;