const axios = require("axios");
const cheerio = require("cheerio");

class WebScraper {
  // Extrair receita de qualquer URL
  static async extractRecipeFromUrl(url) {
    try {
      console.log(`Analisando URL: ${url}`);
      
      // 1. Buscar conteúdo da página
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(data);
      
      // 2. Tentar encontrar receita usando Schema.org (mais confiável)
      const schemaScript = $('script[type="application/ld+json"]').first().html();
      
      if (schemaScript) {
        try {
          const schema = JSON.parse(schemaScript);
          if (schema["@type"] && (schema["@type"].includes("Recipe") || schema["@type"] === "Recipe")) {
            console.log("Receita encontrada via Schema.org");
            return this.parseSchemaRecipe(schema);
          }
        } catch (e) {
          console.log("Schema inválido, tentando análise manual");
        }
      }
      
      // 3. Fallback: Análise heurística da página
      return this.heuristicAnalysis($, url);
      
    } catch (error) {
      console.error("Erro no scraping:", error.message);
      
      // 4. Fallback final: Usar OpenAI para analisar a URL
      return this.fallbackWithAI(url);
    }
  }
  
  // Parse de Schema.org
  static parseSchemaRecipe(schema) {
    // Schema pode ser array
    const recipe = Array.isArray(schema) ? 
      schema.find(item => item["@type"] === "Recipe") : schema;
    
    return {
      title: recipe.name || recipe.headline || "",
      ingredients: Array.isArray(recipe.recipeIngredient) ? 
        recipe.recipeIngredient : 
        (typeof recipe.recipeIngredient === 'string' ? [recipe.recipeIngredient] : []),
      steps: Array.isArray(recipe.recipeInstructions) ? 
        recipe.recipeInstructions.map(step => 
          typeof step === 'string' ? step : step.text || ""
        ) : [],
      image: recipe.image ? 
        (Array.isArray(recipe.image) ? recipe.image[0] : recipe.image) : "",
      author: recipe.author?.name || "",
      totalTime: recipe.totalTime || "",
      yield: recipe.recipeYield || "",
      sourceUrl: recipe.url || ""
    };
  }
  
  // Análise heurística (quando não tem schema)
  static heuristicAnalysis($, url) {
    const title = $('h1').first().text() || 
                  $('title').text() || 
                  url.split('/').pop().replace(/-/g, ' ');
    
    // Tentar encontrar ingredientes (procura por listas)
    let ingredients = [];
    $('ul, ol').each((i, elem) => {
      const text = $(elem).text().toLowerCase();
      if (text.includes('farinha') || text.includes('açúcar') || text.includes('sal') || 
          text.includes('ovo') || text.includes('leite') || text.includes('água')) {
        $(elem).find('li').each((j, li) => {
          ingredients.push($(li).text().trim());
        });
      }
    });
    
    // Fallback: usar OpenAI se não encontrou ingredientes
    if (ingredients.length === 0) {
      const pageText = $('body').text().substring(0, 5000);
      // Aqui você chamaria OpenAI para extrair do texto
    }
    
    return {
      title: title.trim(),
      ingredients: ingredients.slice(0, 20), // Limitar
      steps: ["Receita extraída automaticamente. Verifique a fonte original."],
      sourceUrl: url,
      note: "Extraído via análise automática - pode conter erros"
    };
  }
  
  // Fallback com OpenAI
  static async fallbackWithAI(url) {
    // Implementação com OpenAI (similar ao OCR)
    // Por enquanto retorna erro controlado
    throw new Error("Não foi possível extrair receita desta URL automaticamente");
  }
}

module.exports = WebScraper;