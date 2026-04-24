const axios = require("axios");

class NutritionAnalyzer {
  // Analisar receita e detectar problemas
  static async analyzeRecipe(recipeData, userLimits) {
    const alerts = [];
    
    // SIMULAÇÃO: Em produção, integrar com API nutricional real
    const estimatedValues = this.estimateNutrition(recipeData.ingredients);
    
    // Verificar açúcar
    if (estimatedValues.sugar > userLimits.sugar) {
      alerts.push({
        type: "sugar",
        severity: "high",
        title: "⚠️ Atenção: Açúcar elevado",
        message: `Esta receita contém ${estimatedValues.sugar}g de açúcar (seu limite é ${userLimits.sugar}g)`,
        threshold: userLimits.sugar,
        currentValue: estimatedValues.sugar,
        unit: "g",
        actions: [
          { label: "Ignorar e continuar", action: "ignore", endpoint: "/api/alertas/ignore" },
          { label: "Sugerir alternativa", action: "suggest_alternative", endpoint: "/api/alertas/suggest" },
          { label: "Ajustar meus limites", action: "adjust_limits", endpoint: "/api/saude/limits" }
        ]
      });
    }
    
    // Verificar sal
    if (estimatedValues.salt > userLimits.salt) {
      alerts.push({
        type: "salt",
        severity: "medium",
        title: "🧂 Sal acima do recomendado",
        message: `Receita com ${estimatedValues.salt}g de sal (limite: ${userLimits.salt}g)`,
        threshold: userLimits.salt,
        currentValue: estimatedValues.salt
      });
    }
    
    return alerts;
  }
  
  // Estimativa simplificada (em produção usar API como Nutritionix)
  static estimateNutrition(ingredients) {
    let sugar = 0;
    let salt = 0;
    let calories = 0;
    
    ingredients.forEach(ing => {
      const lowerIng = ing.toLowerCase();
      
      if (lowerIng.includes("açúcar") || lowerIng.includes("açucar") || lowerIng.includes("mel")) {
        sugar += 10; // Estimativa
      }
      if (lowerIng.includes("sal") || lowerIng.includes("molho de soja")) {
        salt += 1;
      }
      if (lowerIng.includes("óleo") || lowerIng.includes("azeite") || lowerIng.includes("manteiga")) {
        calories += 100;
      }
      if (lowerIng.includes("farinha") || lowerIng.includes("arroz") || lowerIng.includes("massa")) {
        calories += 200;
      }
    });
    
    return { sugar, salt, calories };
  }
  
  // Gerar alternativa com menos açúcar
  static async generateAlternative(recipeData) {
    // Chamar OpenAI para sugerir versão saudável
    const prompt = `
    Reescreva esta receita reduzindo o açúcar em 50% e mantendo o sabor:
    
    Título: ${recipeData.title}
    Ingredientes: ${recipeData.ingredients.join(", ")}
    Passos: ${recipeData.steps.join(" ")}
    
    Retorne APENAS JSON com novo título, ingredientes e passos.
    `;
    
    // (Aqui você integraria com sua OpenAI)
    return {
      title: `${recipeData.title} (versão light)`,
      ingredients: recipeData.ingredients.map(ing => 
        ing.replace("açúcar", "adoçante natural")
           .replace("200g", "100g")
      ),
      steps: recipeData.steps
    };
  }
}

module.exports = NutritionAnalyzer;