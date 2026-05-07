import { internationalRecipes } from '@/data/internationalRecipes';

const ALLERGY_KEYWORDS = {
  'Amendoim': ['amendoim', 'peanut'],
  'Leite': ['leite', 'queijo', 'manteiga', 'natas', 'cream', 'butter', 'cheese', 'milk', 'iogurte', 'yogurt', 'lactose', 'creme', 'mozzarella', 'parmesão', 'ricotta', 'brie', 'gouda', 'bechamel'],
  'Ovo': ['ovo', 'ovos', 'egg', 'eggs', 'gema', 'clara', 'mayonnaise', 'maionese'],
  'Trigo': ['trigo', 'farinha', 'massa', 'pão', 'wheat', 'flour', 'macarrão', 'esparguete', 'noodles', 'tortilla', 'pita', 'cevada', 'centeio', 'aveia', 'couscous', 'bulgur', 'panko', 'semolina'],
  'Frutos Secos': ['noz', 'nozes', 'amêndoa', 'avelã', 'castanha', 'nuts', 'almond', 'pistácio', 'anacardo', 'caju', 'macadâmia', 'pecan'],
  'Marisco': ['camarão', 'caranguejo', 'lagosta', 'mexilhão', 'ameijoa', 'shrimp', 'shellfish', 'lula', 'polvo', 'berbigão', 'búzio', 'sapateira'],
  'Peixe': ['peixe', 'salmão', 'atum', 'bacalhau', 'fish', 'salmon', 'tuna', 'sardinhas', 'robalo', 'dourada', 'tilápia', 'anchova', 'garoupa', 'linguado', 'moreia', 'panga'],
  'Soja': ['soja', 'tofu', 'soy', 'edamame', 'molho de soja', 'miso', 'tempeh'],
  'Sésamo': ['sésamo', 'tahini', 'sesame', 'gergelim'],
  'Sulfitos': ['vinho', 'wine', 'vinagre', 'cerveja', 'beer'],
};

const DIET_FORBIDDEN = {
  'Vegana': [
    'carne', 'frango', 'peixe', 'camarão', 'ovo', 'ovos', 'leite', 'queijo',
    'manteiga', 'mel', 'pato', 'porco', 'bacon', 'salmão', 'atum', 'natas',
    'iogurte', 'bife', 'vitela', 'borrego', 'cordeiro', 'peru', 'linguiça',
    'chouriço', 'fiambre', 'presunto', 'marisco', 'lagosta', 'caranguejo',
    'lula', 'polvo', 'sardinhas', 'bacalhau', 'ghee', 'cream', 'butter',
    'cheese', 'milk', 'egg', 'chicken', 'beef', 'pork', 'fish', 'shrimp',
    'lobster', 'gelatina', 'gelatin', 'mozzarella', 'parmesão', 'ricotta',
    'bechamel', 'maionese', 'mayonnaise', 'frango', 'cabrito', 'coelho',
  ],
  'Vegetariana': [
    'carne', 'frango', 'peixe', 'camarão', 'pato', 'porco', 'bacon',
    'salmão', 'atum', 'bife', 'vitela', 'borrego', 'cordeiro', 'peru',
    'linguiça', 'chouriço', 'fiambre', 'presunto', 'marisco', 'lagosta',
    'caranguejo', 'lula', 'polvo', 'sardinhas', 'bacalhau', 'chicken',
    'beef', 'pork', 'fish', 'shrimp', 'lobster', 'cabrito', 'coelho',
    'frango', 'galinha', 'garoupa', 'moreia',
  ],
  'Sem Glúten': [
    'trigo', 'farinha', 'massa', 'pão', 'wheat', 'flour', 'macarrão',
    'esparguete', 'noodles', 'tortilla', 'cevada', 'centeio', 'aveia',
    'semolina', 'bulgur', 'couscous', 'panko', 'farinha de trigo',
    'pão ralado', 'molho de soja', 'cerveja',
  ],
  'Cetogênica (Keto)': [
    'arroz', 'massa', 'pão', 'batata', 'açúcar', 'mel', 'milho', 'feijão',
    'lentilha', 'grão', 'farinha', 'aveia', 'cevada', 'trigo', 'macarrão',
    'esparguete', 'noodles', 'couscous', 'quinoa', 'tapioca',
  ],
  'Low Carb': [
    'arroz', 'massa', 'pão', 'batata', 'milho', 'feijão', 'lentilha',
    'grão', 'macarrão', 'esparguete', 'noodles', 'couscous', 'tapioca',
  ],
  'Mediterrânica': [
    // Mediterrânica evita carnes processadas e açúcar refinado
    // NÃO elimina peixe, frango moderado, legumes, azeite
    'bacon', 'fiambre', 'presunto', 'salsichas', 'linguiça', 'chouriço',
    'refrigerante', 'açúcar refinado',
  ],
  'Paleo': [
    // Paleo elimina cereais, leguminosas, laticínios, açúcar processado
    'arroz', 'massa', 'pão', 'feijão', 'lentilha', 'grão', 'soja', 'tofu',
    'leite', 'queijo', 'manteiga', 'iogurte', 'natas', 'milho', 'aveia',
    'trigo', 'cevada', 'centeio', 'açúcar', 'mel processado', 'farinha',
    'macarrão', 'noodles',
  ],
  'Flexitariana': [
    // Flexitariana reduz (mas não elimina totalmente) carnes vermelhas
    // Só elimina carnes processadas pesadas
    'bacon', 'fiambre', 'presunto', 'salsichas', 'linguiça', 'chouriço',
  ],
};

const COUNTRY_AFFINITY = {

  'Angola': ['Angola', 'Portugal', 'Brasil', 'Nigéria', 'República do Congo'],
  'Portugal': ['Portugal', 'Espanha', 'França', 'Brasil', 'Angola'],
  'Brasil': ['Brasil', 'Portugal', 'Argentina', 'Colômbia'],
  'Moçambique': ['Moçambique', 'Portugal', 'África do Sul', 'Quénia'],

  // --- Europa Ocidental / Mediterrâneo ---
  'Itália': ['Itália', 'Espanha', 'França', 'Grécia', 'Portugal'],
  'França': ['França', 'Espanha', 'Itália', 'Bélgica', 'Suíça', 'Canadá'],
  'Espanha': ['Espanha', 'Portugal', 'França', 'Itália', 'México', 'Argentina'],
  'Reino Unido': ['Reino Unido', 'EUA', 'Canadá', 'Irlanda', 'Austrália'],
  'Irlanda': ['Irlanda', 'Reino Unido', 'EUA', 'França'],
  'Escócia': ['Escócia', 'Reino Unido', 'Irlanda', 'EUA'],
  'Holanda': ['Holanda', 'Bélgica', 'França', 'Alemanha'],
  'Bélgica': ['Bélgica', 'França', 'Holanda', 'Alemanha'],
  'Suíça': ['Suíça', 'França', 'Alemanha', 'Itália', 'Áustria'],
  'Áustria': ['Áustria', 'Alemanha', 'Suíça', 'Hungria', 'República Checa'],
  'Alemanha': ['Alemanha', 'Áustria', 'Suíça', 'Holanda', 'Polónia'], // acrescentado
  'Grécia': ['Grécia', 'Itália', 'Espanha', 'Turquia', 'França'],
  'Turquia': ['Turquia', 'Alemanha', 'Grécia', 'Irão', 'Arábia Saudita'],

  // --- Europa Nórdica & Leste ---
  'Suécia': ['Suécia', 'Noruega', 'Dinamarca', 'Finlândia'],
  'Noruega': ['Noruega', 'Suécia', 'Dinamarca', 'Reino Unido'],
  'Dinamarca': ['Dinamarca', 'Suécia', 'Noruega', 'Alemanha'],
  'Finlândia': ['Finlândia', 'Suécia', 'Rússia', 'Noruega'],
  'Polónia': ['Polónia', 'Alemanha', 'República Checa', 'Ucrânia'],
  'República Checa': ['República Checa', 'Áustria', 'Polónia', 'Alemanha'],
  'Hungria': ['Hungria', 'Áustria', 'República Checa', 'Polónia', 'Sérvia'],
  'Ucrânia': ['Ucrânia', 'Rússia', 'Polónia', 'Turquia'],
  'Rússia': ['Rússia', 'Ucrânia', 'Cazaquistão', 'Geórgia'],
  'Bósnia': ['Bósnia', 'Sérvia', 'Turquia', 'Áustria'],
  'Sérvia': ['Sérvia', 'Bósnia', 'Rússia', 'Turquia'],

  // --- Américas ---
  'EUA': ['EUA', 'Canadá', 'Reino Unido', 'México', 'Brasil'],
  'Canadá': ['Canadá', 'EUA', 'França', 'Reino Unido'],
  'México': ['México', 'Espanha', 'EUA', 'Colômbia', 'Argentina'],
  'Argentina': ['Argentina', 'Brasil', 'Espanha', 'Itália', 'Uruguai'],
  'Uruguai': ['Uruguai', 'Argentina', 'Brasil', 'Espanha'],
  'Chile': ['Chile', 'Argentina', 'Peru', 'Espanha'],
  'Peru': ['Peru', 'Argentina', 'Chile', 'Brasil', 'Colômbia', 'Equador'],
  'Colômbia': ['Colômbia', 'Brasil', 'Argentina', 'Venezuela', 'Espanha'],
  'Venezuela': ['Venezuela', 'Colômbia', 'Brasil', 'Espanha'],
  'Equador': ['Equador', 'Peru', 'Colômbia', 'Espanha'],
  'Bolívia': ['Bolívia', 'Peru', 'Argentina', 'Brasil', 'Espanha'],
  'Cuba': ['Cuba', 'Espanha', 'EUA', 'México'],
  'Porto Rico': ['Porto Rico', 'EUA', 'Espanha', 'República Dominicana'],
  'Haiti': ['Haiti', 'França', 'EUA', 'República Dominicana'],
  'Trinidad e Tobago': ['Trinidad e Tobago', 'Reino Unido', 'EUA', 'Venezuela'],

  // --- África ---
  'África do Sul': ['África do Sul', 'Moçambique', 'Zimbabwe', 'Namíbia', 'Lesoto'],
  'África Do Sul': ['África do Sul', 'Moçambique', 'Zimbabwe', 'Namíbia', 'Lesoto'], // variação
  'Nigéria': ['Nigéria', 'Gâmbia', 'Camarões', 'GanFa', 'República do Congo'],
  'Senegal': ['Senegal', 'França', 'Mali', 'Gâmbia', 'Nigéria'],
  'Mali': ['Mali', 'França', 'Senegal', 'Nigéria'],
  'Gâmbia': ['Gâmbia', 'Senegal', 'Nigéria', 'Reino Unido'],
  'Camarões': ['Camarões', 'Nigéria', 'França', 'República do Congo'],
  'República do Congo': ['República do Congo', 'França', 'Angola', 'Camarões'],
  'Quénia': ['Quénia', 'Etiópia', 'África do Sul', 'Tanzânia'],
  'Etiópia': ['Etiópia', 'Quénia', 'Egito', 'Sudão'],
  'Egito': ['Egito', 'Arábia Saudita', 'Marrocos', 'França'],
  'Marrocos': ['Marrocos', 'França', 'Espanha', 'Argélia', 'Egito'],
  'Argélia': ['Argélia', 'França', 'Marrocos', 'Tunísia', 'Egito'],
  'Zimbabwe': ['Zimbabwe', 'África do Sul', 'Moçambique', 'Zâmbia'],
  'Lesoto': ['Lesoto', 'África do Sul'],
  'Madagáscar': ['Madagáscar', 'França', 'África do Sul', 'Moçambique'],
  'Cabo Verde': ['Cabo Verde', 'Portugal', 'Brasil', 'Angola'],

  // --- Ásia (Oriente, Sudeste, Sul) ---
  'China': ['China', 'Japão', 'Coreia do Sul', 'Vietname', 'Tailândia'],
  'Japão': ['Japão', 'Coreia do Sul', 'China', 'Tailândia'],
  'Coreia do Sul': ['Coreia do Sul', 'Japão', 'China', 'EUA'],
  'Tailândia': ['Tailândia', 'Vietname', 'Malásia', 'Japão', 'China'],
  'Vietname': ['Vietname', 'Tailândia', 'China', 'França'],
  'Malásia': ['Malásia', 'Singapura', 'Indonésia', 'Tailândia'],
  'Singapura': ['Singapura', 'Malásia', 'China', 'Reino Unido'],
  'Indonésia': ['Indonésia', 'Malásia', 'Tailândia', 'Holanda'],
  'Filipinas': ['Filipinas', 'Espanha', 'EUA', 'Japão'],
  'Índia': ['Índia', 'Paquistão', 'Nepal', 'Reino Unido', 'Tailândia'],
  'Paquistão': ['Paquistão', 'Índia', 'Irão', 'Reino Unido'],
  'Nepal': ['Nepal', 'Índia', 'China', 'Tibete'],
  'Tibete': ['Tibete', 'China', 'Nepal', 'Índia'],
  'Irão': ['Irão', 'Paquistão', 'Turquia', 'Iraque'],
  'Israel': ['Israel', 'EUA', 'França', 'Jordânia', 'Líbano'],
  'Jordânia': ['Jordânia', 'Arábia Saudita', 'Israel', 'Líbano'],
  'Líbano': ['Líbano', 'França', 'Síria', 'Jordânia'],
  'Arábia Saudita': ['Arábia Saudita', 'Egito', 'Jordânia', 'Emirados Árabes'],
  'Geórgia': ['Geórgia', 'Rússia', 'Turquia', 'Arménia'],
  'Arménia': ['Arménia', 'Rússia', 'Geórgia', 'Turquia'],
  'Usbequistão': ['Usbequistão', 'Cazaquistão', 'Rússia', 'Turquia'],
  'Cazaquistão': ['Cazaquistão', 'Rússia', 'Usbequistão', 'Turquia'],
};

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function guessDifficulty(tempo) {
  const mins = parseInt(tempo);
  if (isNaN(mins)) return 'Médio';
  if (mins <= 20) return 'Fácil';
  if (mins <= 60) return 'Médio';
  return 'Difícil';
}

function mapCategory(categoria) {
  if (!categoria) return 'Jantar';
  const c = categoria.toLowerCase();
  if (c.includes('pequeno') || c.includes('café') || c.includes('breakfast')) return 'Pequeno-almoço';
  if (c.includes('almoço') || c.includes('lunch')) return 'Almoço';
  return 'Jantar';
}

function getCategoryEmoji(categoria) {
  const c = (categoria || '').toLowerCase();
  if (c.includes('pequeno') || c.includes('café')) return '☀️';
  if (c.includes('almoço')) return '🌤️';
  if (c.includes('entrada')) return '🥗';
  return '🌙';
}

function isRecipeSafe(recipe, userAllergies, userDiets) {
  const ing = (recipe.ingredientes || '').toLowerCase();
  const perfil = (recipe.perfil_alimentar || '').toLowerCase();
  const nome = (recipe.nome_receita || '').toLowerCase();
  const texto = `${ing} ${perfil} ${nome}`;

  // ALERGIAS — elimina se keyword perigosa presente
  for (const allergy of userAllergies) {
    const keywords = ALLERGY_KEYWORDS[allergy] || [allergy.toLowerCase()];
    if (keywords.some(kw => texto.includes(kw))) {
      return false;
    }
  }

  // DIETAS — elimina se ingrediente proibido presente
  for (const diet of userDiets) {
    const forbidden = DIET_FORBIDDEN[diet];
    if (!forbidden) continue;
    if (forbidden.some(word => texto.includes(word))) {
      return false;
    }
  }

  return true;
}

export function getPersonalizedSuggestions(user, preferences, recipeHistory, externalPool = null) {
  const safeHistory = Array.isArray(recipeHistory) ? recipeHistory : [];

  let pool = externalPool ? [...externalPool] : [...internationalRecipes];

  pool = pool.map(r => ({
    ...r,
    nome_receita: r.nome_receita || r.name || '',
  }));

  // Normalizar formato das alergias e dietas
  const userAllergies = (preferences?.allergies || [])
    .map(a => a.name || a.label || a)
    .filter(Boolean);

  const userDiets = (preferences?.diets || [])
    .map(d => d.name || d.label || d)
    .filter(Boolean);

  console.log('🔒 Alergias activas:', userAllergies);
  console.log('🥗 Dietas activas:', userDiets);

  // Filtrar pool com restrições
  const safePool = pool.filter(r => isRecipeSafe(r, userAllergies, userDiets));

  console.log(`✅ Receitas seguras: ${safePool.length} de ${pool.length}`);

  // Fallback se ficou com menos de 3
  const workingPool = safePool.length >= 3 ? safePool : (() => {
    console.warn('⚠️ Menos de 3 receitas seguras, usando pool completo');
    return pool;
  })();

  // PONTUAÇÃO
  const userCountry = user?.country || 'Angola';
  const affineCountries = COUNTRY_AFFINITY[userCountry] || [];
  const todayStr = new Date().toISOString().split('T')[0];
  const userId = user?._id || user?.id || 'guest';
  const dailySeed = hashCode(`${todayStr}-${userId}`);

  const countryClicks = {};
  const categoryClicks = {};
  safeHistory.forEach(item => {
    if (item.pais) countryClicks[item.pais] = (countryClicks[item.pais] || 0) + 1;
    if (item.categoria) categoryClicks[item.categoria] = (categoryClicks[item.categoria] || 0) + 1;
  });

  const scored = workingPool.map(recipe => {
    let score = 0;

    if (recipe.pais === userCountry) score += 50;
    else if (affineCountries.includes(recipe.pais)) score += 30;

    if (countryClicks[recipe.pais]) score += Math.min(countryClicks[recipe.pais] * 15, 60);
    if (categoryClicks[recipe.categoria]) score += Math.min(categoryClicks[recipe.categoria] * 10, 40);

    const perfil = (recipe.perfil_alimentar || '').toLowerCase();
    if (applyRestrictions) {
      diets.forEach(diet => {
        if (diet === 'Vegana' && perfil.includes('vegan')) score += 35;
        if (diet === 'Vegetariana' && perfil.includes('vegetar')) score += 30;
        if (diet === 'Sem Glúten' && perfil.includes('sem glúten')) score += 25;
        if (diet === 'Mediterrânica' && perfil.includes('mediterr')) score += 25;
        if (diet === 'Paleo' && perfil.includes('paleo')) score += 25;
        if (diet === 'Cetogênica (Keto)' && perfil.includes('keto')) score += 25;
      });
    }

    score += hashCode(`${recipe.nome_receita}-${dailySeed}`) % 20;

    return { ...recipe, _score: score };
  });

  scored.sort((a, b) => b._score - a._score);

  // Separar por categoria
  const byCategory = {
    'Pequeno-almoço': [],
    'Almoço': [],
    'Jantar': [],
  };

  for (const recipe of scored) {
    const cat = mapCategory(recipe.categoria);
    if (byCategory[cat]) byCategory[cat].push(recipe);
  }

  const selected = [
    byCategory['Pequeno-almoço'][0],
    byCategory['Almoço'][0],
    byCategory['Jantar'][0],
  ].filter(Boolean);

  // Completar se ficou com menos de 3
  if (selected.length < 3) {
    for (const recipe of scored) {
      if (selected.length >= 3) break;
      if (!selected.find(s => s?.nome_receita === recipe.nome_receita)) {
        selected.push(recipe);
      }
    }
  }

  console.log('🍽️ Seleccionadas:', selected.map(r => `${r.nome_receita} (${r.pais})`));

  return selected.map(recipe => ({
    name: recipe.nome_receita,
    pais: recipe.pais,
    category: mapCategory(recipe.categoria),
    time: recipe.tempo_preparo,
    difficulty: guessDifficulty(recipe.tempo_preparo),
    description: (recipe.ingredientes || '').substring(0, 100) + '...',
    tags: (recipe.perfil_alimentar || '').split(',').map(t => t.trim()).filter(Boolean),
    emoji: getCategoryEmoji(recipe.categoria),
    imagem_url: recipe.imagem_url || null,
    ingredientes: recipe.ingredientes,
    perfil_alimentar: recipe.perfil_alimentar,
    _score: recipe._score,
    _isPersonalized: true,
  }));
}