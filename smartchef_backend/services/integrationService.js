const Observacao = require("../models/Observacao");
const Profile = require("../models/Profile");
const Saude = require("../models/Saude");
const Alerta = require("../models/Alerta");

class IntegrationService {
    // Evento 1: Receita de Infantil → Saúde
    static async infantRecipeToHealth(profileId, recipeId, childAte = true) {
        try {
            const profile = await Profile.findById(profileId);
            const recipe = profile.recipes.id(recipeId);

            if (!profile || !recipe) {
                throw new Error("Perfil ou receita não encontrados");
            }

            // Para cada usuário associado ao perfil (pais/cuidadores)
            // Em produção, você teria relação usuário-perfil

            const userId = `test_user_${profileId}`;

            // Atualizar saúde do usuário (pai/cuidador)
            const saude = await Saude.findOne({ userId });
            if (saude) {
                // Contar como vegetais consumidos (se for receita com vegetais)
                if (this.containsVegetables(recipe)) {
                    // Verifique se monthlyStats existe
                    if (!saude.monthlyStats) {
                        saude.monthlyStats = {
                            vegetablesCount: 0,
                            fruitsCount: 0,
                            proteinsCount: 0
                        };
                    }
                    saude.monthlyStats.vegetablesCount += 1;
                }

                // Se criança gostou, pode ser adicionada aos favoritos
                if (childAte && recipe.notes?.some(n => n.emoji.includes("😍"))) {
                    // Adicionar aos favoritos da saúde (limite de 5)
                    if (saude.favoriteRecipes.length < 5) {
                        saude.favoriteRecipes.push({
                            recipeId: recipe._id,
                            title: `Receita infantil: ${profile.name}`,
                            imageUrl: recipe.imageUrl
                        });
                    }
                }

                await saude.save();
            }

            return { success: true, updatedHealth: true };
        } catch (error) {
            console.error("Erro integração infantil→saúde:", error);
            return { success: false, error: error.message };
        }
    }

    // Evento 2: Screenshot → Adaptar para perfil
    static async screenshotToProfile(observationId, targetProfileId) {
        try {
            const observation = await Observacao.findById(observationId);
            const profile = await Profile.findById(targetProfileId);

            if (!observation || !profile) {
                throw new Error("Observação ou perfil não encontrados");
            }

            // Se a observação tem dados de receita, adaptar para o perfil
            if (observation.recipeData) {
                const adaptedRecipe = await this.adaptRecipeForProfile(
                    observation.recipeData,
                    profile
                );

                // Adicionar receita adaptada ao perfil
                profile.recipes.push({
                    imageUrl: observation.imageUrl,
                    mealType: "lunch", // ou detectar automaticamente
                    notes: [{
                        content: `Adaptado de screenshot: ${observation.recipeData.title}`,
                        emoji: "🔄"
                    }],
                    generatedByAssistant: true,
                    readyToCook: "later"
                });

                await profile.save();

                return {
                    success: true,
                    adaptedRecipe,
                    addedToProfile: true,
                    message: `Receita adaptada para ${profile.name}`
                };
            }

            return { success: false, message: "Observação não contém dados de receita" };
        } catch (error) {
            console.error("Erro screenshot→perfil:", error);
            return { success: false, error: error.message };
        }
    }

    // Evento 3: Exportar relatório para médico
    static async generateMedicalReport(userId, period = "30d") {
        try {
            const saude = await Saude.findOne({ userId })
                .populate("mealHistory.recipeId");

            const profiles = await Profile.find({
                // Em produção: relação usuário-perfil
            });

            if (!saude) {
                throw new Error("Dados de saúde não encontrados");
            }

            // Calcular estatísticas
            const stats = {
                period: period,
                startDate: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)),
                endDate: new Date(),
                totalMeals: saude.mealHistory.length,
                vegetablesPerWeek: (saude.monthlyStats.vegetablesCount / 4.3).toFixed(1),
                averageSugar: "25g", // Em produção: calcular
                averageSalt: "4.2g",
                nutrientDeficiencies: saude.nutrientProgress.filter(n => n.percentage < 70)
            };

            // Recomendações baseadas nos dados
            const recommendations = [];
            if (saude.nutrientProgress.some(n => n.nutrient === "Vitamina C" && n.percentage < 80)) {
                recommendations.push("Aumentar consumo de frutas cítricas");
            }
            if (saude.monthlyStats.vegetablesCount < 20) {
                recommendations.push("Consumir mais vegetais (objetivo: 5 por dia)");
            }

            // Alertas nutricionais ativos
            const alertas = await Alerta.find({
                userId,
                active: true,
                type: { $in: ["sugar", "salt", "calories"] }
            });

            return {
                success: true,
                report: {
                    patientId: userId,
                    generatedAt: new Date(),
                    period: stats.period,
                    summary: stats,
                    recentMeals: saude.mealHistory.slice(0, 10),
                    activeAlerts: alertas,
                    recommendations,
                    profilesSummary: profiles.map(p => ({
                        name: p.name,
                        age: p.age,
                        conditions: p.healthObservations
                    })),
                    notes: "Relatório gerado automaticamente pelo Bom Piteu"
                }
            };
        } catch (error) {
            console.error("Erro gerando relatório:", error);
            return { success: false, error: error.message };
        }
    }

    // Evento 4: Alerta durante planejamento
    static async checkMealPlan(profileId, plannedMeals) {
        const alerts = [];

        // Verificar 3 dias sem vegetais
        const daysWithoutVeggies = this.countDaysWithout(plannedMeals, "vegetables");
        if (daysWithoutVeggies >= 3) {
            alerts.push({
                type: "balance",
                severity: "medium",
                title: "🥦 Menu desequilibrado",
                message: `Menu tem ${daysWithoutVeggies} dias seguidos sem vegetais`,
                actions: [
                    { label: "Ver sugestões", action: "suggest", endpoint: "/api/integration/suggest-vegetables" }
                ]
            });
        }

        // Verificar alergias nos pratos planejados
        const profile = await Profile.findById(profileId);
        if (profile?.allergies?.length > 0) {
            const hasAllergens = this.checkAllergens(plannedMeals, profile.allergies);
            if (hasAllergens) {
                alerts.push({
                    type: "allergy",
                    severity: "high",
                    title: "⚠️ Alerta de alergia",
                    message: `Menu contém ${hasAllergens.join(", ")}`,
                    actions: [
                        { label: "Substituir pratos", action: "replace", endpoint: "/api/integration/replace-meals" }
                    ]
                });
            }
        }

        return alerts;
    }

    // Métodos auxiliares
    static containsVegetables(recipe) {
        const vegKeywords = ["cenoura", "batata", "cebola", "alho", "tomate", "espinafre", "brócolis", "abóbora", "couve", "alface", "pepino"];

        // Verificar ingredientes (se existirem)
        if (recipe.recipeData?.ingredients) {
            const allIngredients = recipe.recipeData.ingredients.join(' ').toLowerCase();
            return vegKeywords.some(veg => allIngredients.includes(veg));
        }

        // Fallback para o modelo antigo
        const ingredients = recipe.notes?.[0]?.content || "";
        return vegKeywords.some(veg => ingredients.toLowerCase().includes(veg));
    }

    static async adaptRecipeForProfile(recipeData, profile) {
        // Adapta receita baseada no perfil (idade, restrições)
        let adapted = { ...recipeData };

        // Para crianças: simplificar passos
        if (profile.type === "infantil") {
            adapted.steps = adapted.steps.map(step =>
                step.replace("cozinhe", "cozinhe em fogo baixo")
                    .replace("corte", "corte em pedaços pequenos")
            );
        }

        // Para sênior: reduzir sal, açúcar
        if (profile.type === "senior") {
            adapted.title += " (adaptado)";
            adapted.ingredients = adapted.ingredients.map(ing =>
                ing.replace("1 colher de sal", "½ colher de sal")
                    .replace("açúcar", "adoçante")
            );
        }

        return adapted;
    }

    static countDaysWithout(meals, foodGroup) {
        // Implementação simplificada
        return 3; // Exemplo
    }

    static checkAllergens(meals, allergies) {
        // Implementação simplificada
        return []; // Exemplo
    }
    // ===== REGISTAR CONSUMO DE RECEITA (UTILIZADOR ADULTO) =====
    static async registerRecipeConsumption({ userId, recipeData, ate = true }) {
        try {
            const saude = await Saude.findOne({ userId });
            if (!saude) {
                // Se não existir registo de saúde, podes criar um automaticamente
                // ou simplesmente ignorar
                console.log("Perfil de saúde não encontrado para o utilizador", userId);
                return { success: false, message: "Perfil de saúde não encontrado" };
            }

            // Contar vegetais (se a receita contiver vegetais)
            if (ate && this.containsVegetables({ notes: [{ content: recipeData?.ingredients?.join(' ') }] })) {
                if (!saude.monthlyStats) {
                    saude.monthlyStats = {
                        vegetablesCount: 0,
                        fruitsCount: 0,
                        proteinsCount: 0
                    };
                }
                saude.monthlyStats.vegetablesCount += 1;
            }

            // Adicionar ao histórico de refeições
            if (!saude.mealHistory) saude.mealHistory = [];
            saude.mealHistory.push({
                recipeId: null, // podes associar se quiseres
                recipeTitle: recipeData?.title || "Receita",
                consumedAt: new Date(),
                ate: ate
            });

            // Limitar tamanho do histórico (ex: últimos 100)
            if (saude.mealHistory.length > 100) {
                saude.mealHistory = saude.mealHistory.slice(-100);
            }

            await saude.save();

            return {
                success: true,
                message: "Consumo registado com sucesso",
                vegetablesCount: saude.monthlyStats.vegetablesCount
            };
        } catch (error) {
            console.error("Erro ao registar consumo:", error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = IntegrationService;