// CORRIGIDO: Chef prompts melhorados para imagens ultra-realistas

function visionOptionsPrompt(imageUrl, category = null) {
  return `ANÁLISE DE IMAGEM DE INGREDIENTES - CHEF PROFISSIONAL

IMAGEM ANALISADA: ${imageUrl ? 'Imagem fornecida' : 'Sem imagem'}

INSTRUÇÕES ESPECÍFICAS:
1. Analise DETALHADAMENTE todos os ingredientes visíveis na imagem
2. Identifique quantidade, estado (fresco, congelado, processado) e qualidade
3. Sugira EXATAMENTE 3 receitas REALISTAS e ESPECÍFICAS usando PRINCIPALMENTE esses ingredientes

FORMATO DE RESPOSTA OBRIGATÓRIO:
{
  "ingredientsIdentified": ["ingrediente 1", "ingrediente 2"],
  "options": [
    {
      "title": "Nome ESPECÍFICO da receita (ex: 'Moamba de Galinha com Quiabo')",
      "description": "Descrição breve que explique PORQUE essa receita usa os ingredientes",
      "ingredients": ["lista de ingredientes principais"],
      "difficulty": "Fácil/Média/Difícil",
      "time": "XX min",
      "category": "${category || 'Angolana'}"
    },
    // ... mais 2 opções DISTINTAS
  ]
}

NUNCA USE estes títulos genéricos:
- Omelete Simples
- Salada de Frutas  
- Arroz com Legumes
- Frango Grelhado
- Sopa de Legumes

EXEMPLOS CORRETOS para ingredientes angolanos:
- Moamba de Galinha com Quiabo
- Calulu de Peixe Seco com Batata Doce
- Mufete de Feijão com Farinha de Bombó
- Cocada Amarela com Coco Ralado
`;
}

// CORREÇÃO: Prompts mais específicos e detalhados

function stepImagePrompt(recipeTitle, stepNumber, stepDescription, totalSteps, ingredients) {
  return `ULTRA-REALISTIC PROFESSIONAL COOKING INSTRUCTION PHOTOGRAPHY

RECIPE: "${recipeTitle}"
SPECIFIC STEP ${stepNumber}/${totalSteps}: "${stepDescription}"
INGREDIENTS BEING USED: ${ingredients.slice(0, 3).join(', ')}

PHOTO REQUIREMENTS:
1. EXTREMELY REALISTIC professional food photography
2. Focus SOLELY on the action described: ${stepDescription}
3. Professional chef's hands performing the action
4. Fresh, high-quality ingredients
5. Clean kitchen environment with natural lighting
6. Shallow depth of field (background softly blurred)
7. DSLR camera quality, ultra-high detail
8. Natural food textures and colors
9. Action shot - capture the movement
10. No faces, no text, no logos

VISUAL SPECIFICS FOR THIS STEP:
- If cutting/chopping: Show knife mid-cut through ingredient on cutting board
- If sautéing: Show ingredients sizzling in pan with visible oil bubbles
- If mixing: Show spoon/spatula mixing ingredients in bowl
- If boiling: Show pot with simmering liquid and steam
- If seasoning: Show hand sprinkling salt/herbs over food
- If plating: Show food being arranged on plate

TECHNICAL SPECIFICATIONS:
- Style: Documentary food photography
- Lighting: Natural window light or professional softbox
- Angle: Overhead or chef's perspective
- Composition: Tight crop on the action
- Colors: Vibrant but completely natural
- Quality: 8K resolution, photorealistic

NEVER INCLUDE:
- Finished dish (unless it's the final step)
- Cartoons or illustrations
- Unrealistic colors
- Plastic-looking food
- People's faces
- Text or watermarks
- Cluttered background`;
}

function finalDishImagePrompt(recipeTitle, description) {
  return `ULTIMATE PROFESSIONAL FOOD PHOTOGRAPHY - MICHELIN STAR QUALITY

DISH: "${recipeTitle}"
DESCRIPTION: ${description}

PHOTOGRAPHY BRIEF:
1. RESTAURANT-QUALITY final dish presentation
2. Professional food styling and plating
3. Ultra-realistic, mouth-watering appearance
4. Food looks freshly cooked and hot
5. Visible steam (if applicable)
6. Perfect lighting with soft shadows
7. Shallow depth of field
8. Textures are clearly visible (crispy, juicy, creamy, etc.)
9. Colors are vibrant but completely natural
10. Minimalist elegant background

COMPOSITION DETAILS:
- Primary focus: The dish itself
- Viewing angle: 45-degree or slight overhead
- Plate: Simple, elegant ceramic or porcelain
- Surface: Natural wood, marble, or dark slate
- Garnish: Minimal and purposeful
- Negative space: Balanced for visual appeal

TECHNICAL SPECS:
- Camera: Professional DSLR
- Resolution: 8K ultra-high definition
- Lighting: Natural diffused light
- Style: Editorial food magazine quality
- Post-processing: Minimal, natural enhancement only

CRITICAL REQUIREMENTS:
- ABSOLUTELY REALISTIC - no CGI, no 3D renders
- NO cartoon style, NO illustrations
- NO artificial colors or filters
- NO people in the frame
- NO text or logos
- Food must look genuinely appetizing and edible`;
}

function finalDishImagePrompt(recipeTitle, description) {
  return `ULTIMATE PROFESSIONAL FOOD PHOTOGRAPHY - RESTAURANT QUALITY

DISH: "${recipeTitle}"
DESCRIPTION: ${description}

IMAGE REQUIREMENTS:
1. ULTRA-REALISTIC final dish presentation
2. Restaurant-quality plating
3. Professional food styling
4. Natural lighting with soft shadows
5. Shallow depth of field
6. Mouth-watering textures and colors
7. Steam rising from hot food (if applicable)
8. Minimalist, elegant background

COMPOSITION:
- Center focus on the dish
- Slight overhead or 45-degree angle
- Simple, clean plate or bowl
- Natural wood or marble surface
- Minimal garnish for authenticity

TECHNICAL:
- Style: Editorial food photography
- Quality: 8K resolution, DSLR
- Lighting: Window light or studio softbox
- No filters, no excessive editing
- Natural food appearance

NEVER:
- Cartoon or digital art style
- Plastic-looking food
- Unnatural colors
- Crowded composition
- Text or watermarks`;
}

function recipePrompt(recipeName, ingredients = []) {
  return `PROFESSIONAL RECIPE GENERATION - CHEF'S SPECIFICATION

RECIPE REQUEST: "${recipeName}"
AVAILABLE INGREDIENTS: ${ingredients.join(', ')}

GENERATE COMPLETE RECIPE IN THIS EXACT JSON FORMAT:
{
  "title": "Specific descriptive name",
  "time": "Realistic cooking time (e.g., '45 min', '1h 30min')",
  "difficulty": "Fácil/Média/Difícil",
  "ingredients": [
    "500g de ingredient principal",
    "2 unidades de outro ingrediente",
    "Sal e pimenta a gosto"
  ],
  "steps": [
    {
      "stepNumber": 1,
      "description": "Clear, specific action with details",
      "tools": ["tool needed"],
      "time": "XX min"
    }
  ],
  "tips": ["Professional tip 1", "Professional tip 2"]
}

RULES:
1. Steps must be SEQUENTIAL and LOGICAL
2. Each step should be ONE specific action
3. Include specific quantities and techniques
4. Make it accessible for home cooks
5. Use authentic cooking methods
6. The recipe MUST contain NO MORE than 6 steps. Each step should be detailed but concise.`;
}

function stepValidationPrompt(step, extraContext = "") {
  return `CHEF'S QUALITY CONTROL VALIDATION

CURRENT STEP ANALYSIS:
Step ${step.stepNumber}: ${step.description}
Context: ${extraContext}

ANALYSIS CRITERIA:
1. Is the step correctly executed?
2. Are ingredients properly prepared?
3. Is the technique correct?
4. Safety considerations?

RESPOND IN EXACT JSON FORMAT:
{
  "state": "bom" | "aceitável" | "errado",
  "notes": "Specific technical feedback",
  "canAdvance": true | false,
  "correction": "What needs to be fixed if wrong"
}

BE SPECIFIC AND TECHNICAL IN FEEDBACK`;
}

module.exports = {
  visionOptionsPrompt,
  stepImagePrompt,
  finalDishImagePrompt,
  recipePrompt,
  stepValidationPrompt
};