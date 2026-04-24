require("dotenv").config();
const mongoose = require("mongoose");
const SpecialRecipe = require("../models/SpecialRecipe");

// Importa os dados estáticos diretamente
const petiscos = [
  { tipo: "petisco", nome: "Tábua de Queijos", pais: "Portugal", categoria: "Frios", tempo: "15 min", dificuldade: "Fácil", descricao: "Seleção de queijos portugueses com mel, nozes e frutos secos.", tags: ["Queijo", "Partilha"], bebida_sugerida: "Vinho Tinto" },
  { tipo: "petisco", nome: "Pataniscas de Bacalhau", pais: "Portugal", categoria: "Fritos", tempo: "35 min", dificuldade: "Médio", descricao: "Pataniscas estaladiças de bacalhau desfiado com salsa e cebola.", tags: ["Bacalhau", "Frito"], bebida_sugerida: "Cerveja Artesanal" },
  { tipo: "petisco", nome: "Croquetes de Carne", pais: "Portugal", categoria: "Fritos", tempo: "60 min", dificuldade: "Médio", descricao: "Croquetes estaladiços de carne estufada desfiada com noz-moscada.", tags: ["Carne", "Clássico"], bebida_sugerida: "Cerveja" },
  { tipo: "petisco", nome: "Camarões Piri-Piri", pais: "Portugal", categoria: "Grelhados", tempo: "20 min", dificuldade: "Fácil", descricao: "Camarões tigre marinados em piri-piri grelhados com alho e limão.", tags: ["Marisco", "Picante"], bebida_sugerida: "Vinho Verde" },
  { tipo: "petisco", nome: "Hummus com Pita", pais: "Líbano", categoria: "Frios", tempo: "15 min", dificuldade: "Fácil", descricao: "Hummus cremoso com tahini, limão e azeite sobre pão pita.", tags: ["Vegan", "Saudável"], bebida_sugerida: "Sem Bebida" },
  { tipo: "petisco", nome: "Bruschetta de Tomate", pais: "Itália", categoria: "Tostas", tempo: "15 min", dificuldade: "Fácil", descricao: "Pão rústico tostado com tomate cherry, manjericão fresco e azeite.", tags: ["Italiano", "Fresco"], bebida_sugerida: "Vinho Branco" },
  { tipo: "petisco", nome: "Gyozas de Porco", pais: "Japão", categoria: "Cozinhados", tempo: "40 min", dificuldade: "Médio", descricao: "Gyozas de carne de porco com repolho, grelhadas e a vapor.", tags: ["Japonês", "Carne"], bebida_sugerida: "Sake" },
  { tipo: "petisco", nome: "Patatas Bravas", pais: "Espanha", categoria: "Fritos", tempo: "30 min", dificuldade: "Fácil", descricao: "Batatas fritas crocantes com molho bravas picante e aioli.", tags: ["Batata", "Picante"], bebida_sugerida: "Cerveja" },
  { tipo: "petisco", nome: "Pão de Queijo", pais: "Brasil", categoria: "Assados", tempo: "25 min", dificuldade: "Fácil", descricao: "Pãezinhos de queijo crocantes por fora e macios por dentro.", tags: ["Queijo", "Sem Glúten"], bebida_sugerida: "Cerveja" },
  { tipo: "petisco", nome: "Nachos com Guacamole", pais: "México", categoria: "Assados", tempo: "25 min", dificuldade: "Fácil", descricao: "Nachos crocantes com queijo, jalapeños e guacamole caseiro.", tags: ["Mexicano", "Partilha"], bebida_sugerida: "Margarita" },
];

const doces = [
  { tipo: "doce", nome: "Pastel de Nata", pais: "Portugal", categoria: "Pastelaria", tempo: "45 min", dificuldade: "Médio", descricao: "O ícone da pastelaria portuguesa: creme de ovos e canela em massa folhada crocante.", tags: ["Clássico", "Forno"], vegano: false },
  { tipo: "doce", nome: "Mousse de Chocolate", pais: "Portugal", categoria: "Mousse", tempo: "20 min", dificuldade: "Fácil", descricao: "Mousse leve e cremosa de chocolate negro com chantilly.", tags: ["Chocolate", "Rápido"], vegano: false },
  { tipo: "doce", nome: "Tiramisù", pais: "Itália", categoria: "Sobremesa", tempo: "30 min", dificuldade: "Fácil", descricao: "Sobremesa italiana clássica com savoiardi, mascarpone, café e cacau.", tags: ["Café", "Sem Forno"], vegano: false },
  { tipo: "doce", nome: "Crème Brûlée", pais: "França", categoria: "Creme", tempo: "50 min", dificuldade: "Médio", descricao: "Creme de baunilha sedoso com crosta de açúcar caramelizado.", tags: ["Baunilha", "Queimado"], vegano: false },
  { tipo: "doce", nome: "Brigadeiro", pais: "Brasil", categoria: "Doce", tempo: "25 min", dificuldade: "Fácil", descricao: "Trufa brasileira de leite condensado e chocolate com granulado.", tags: ["Chocolate", "Rápido"], vegano: false },
  { tipo: "doce", nome: "Cheesecake de Nova Iorque", pais: "Estados Unidos", categoria: "Cheesecake", tempo: "80 min", dificuldade: "Médio", descricao: "Cheesecake denso e cremoso com base de bolacha e cobertura de frutos vermelhos.", tags: ["Queijo", "Forno"], vegano: false },
  { tipo: "doce", nome: "Churros com Chocolate", pais: "Espanha", categoria: "Frito", tempo: "30 min", dificuldade: "Fácil", descricao: "Churros crocantes com açúcar e canela mergulhados em chocolate quente.", tags: ["Chocolate", "Frito"], vegano: true },
  { tipo: "doce", nome: "Baklava", pais: "Turquia", categoria: "Pastelaria", tempo: "60 min", dificuldade: "Médio", descricao: "Camadas de massa filo crocante com pistácios e calda de mel.", tags: ["Pistácio", "Mel"], vegano: true },
  { tipo: "doce", nome: "Mochi de Morango", pais: "Japão", categoria: "Doce", tempo: "30 min", dificuldade: "Médio", descricao: "Bolas de massa de arroz glutinoso recheadas com pasta de feijão e morango.", tags: ["Arroz", "Fruta"], vegano: true },
  { tipo: "doce", nome: "Brownies de Chocolate", pais: "Estados Unidos", categoria: "Bolo", tempo: "40 min", dificuldade: "Fácil", descricao: "Brownies húmidos e densos com chocolate intenso e nozes.", tags: ["Chocolate", "Forno"], vegano: false },
];

const cocktails = [
  { tipo: "cocktail", nome: "Mojito Clássico", pais: "Cuba", categoria: "Cocktail", tempo: "5 min", dificuldade: "Fácil", descricao: "Rum branco com hortelã, lima, açúcar e água com gás.", tags: ["Clássico", "Refrescante"], perfil_alimentar: "Com Álcool", ingredientes: "Rum branco, açúcar, sumo de lima, água com gás, folhas de hortelã", passo_passo: "1. Macerar hortelã com açúcar e lima; 2. Encher com gelo; 3. Adicionar rum; 4. Completar com água com gás." },
  { tipo: "cocktail", nome: "Caipirinha Brasileira", pais: "Brasil", categoria: "Cocktail", tempo: "5 min", dificuldade: "Fácil", descricao: "Cachaça com lima e açúcar, o cocktail mais famoso do Brasil.", tags: ["Brasileiro", "Cítrico"], perfil_alimentar: "Com Álcool", ingredientes: "Cachaça, lima, açúcar, gelo", passo_passo: "1. Cortar lima e macerar com açúcar; 2. Encher com gelo; 3. Adicionar cachaça e mexer." },
  { tipo: "cocktail", nome: "Gin Tónico com Pepino", pais: "Espanha", categoria: "Cocktail", tempo: "3 min", dificuldade: "Fácil", descricao: "Gin aromático com água tónica e pepino fresco.", tags: ["Gin", "Fresco"], perfil_alimentar: "Com Álcool", ingredientes: "Gin, água tónica, fatias de pepino, zimbro, gelo", passo_passo: "1. Encher copo balão com gelo; 2. Adicionar pepino e zimbro; 3. Verter gin e completar com tónica." },
  { tipo: "cocktail", nome: "Virgin Mojito", pais: "Cuba", categoria: "Mocktail", tempo: "5 min", dificuldade: "Fácil", descricao: "Versão sem álcool do Mojito clássico.", tags: ["Sem Álcool", "Fresco"], perfil_alimentar: "Sem Álcool", ingredientes: "Sumo de lima, açúcar, folhas de hortelã, água com gás, gelo", passo_passo: "1. Macerar hortelã com açúcar e lima; 2. Encher com gelo; 3. Completar com água com gás." },
  { tipo: "cocktail", nome: "Limonada Suíça", pais: "Brasil", categoria: "Refresco", tempo: "7 min", dificuldade: "Fácil", descricao: "Limas batidas com leite condensado para uma limonada cremosa.", tags: ["Sem Álcool", "Cremoso"], perfil_alimentar: "Sem Álcool", ingredientes: "Limas, água, açúcar, leite condensado", passo_passo: "1. Bater limas com casca no liquidificador com água; 2. Coar; 3. Adoçar e adicionar leite condensado." },
  { tipo: "cocktail", nome: "Margarita", pais: "México", categoria: "Cocktail", tempo: "5 min", dificuldade: "Fácil", descricao: "Tequila com licor de laranja e lima, servida com borda de sal.", tags: ["Mexicano", "Cítrico"], perfil_alimentar: "Com Álcool", ingredientes: "Tequila, licor de laranja, sumo de lima, sal", passo_passo: "1. Salgar a borda do copo; 2. Agitar tequila, licor e lima com gelo; 3. Coar para o copo." },
  { tipo: "cocktail", nome: "Aperol Spritz", pais: "Itália", categoria: "Spritz", tempo: "3 min", dificuldade: "Fácil", descricao: "Aperol com Prosecco e água com gás, o aperitivo italiano por excelência.", tags: ["Italiano", "Aperitivo"], perfil_alimentar: "Com Álcool", ingredientes: "Aperol, Prosecco, água com gás, rodela de laranja, gelo", passo_passo: "1. Encher copo com gelo; 2. Adicionar Aperol; 3. Completar com Prosecco e água com gás; 4. Decorar com laranja." },
  { tipo: "cocktail", nome: "Mango Lassi", pais: "Índia", categoria: "Batido", tempo: "5 min", dificuldade: "Fácil", descricao: "Iogurte batido com manga e cardamomo.", tags: ["Sem Álcool", "Tropical"], perfil_alimentar: "Sem Álcool", ingredientes: "Iogurte natural, polpa de manga, leite, açúcar, cardamomo", passo_passo: "1. Bater todos os ingredientes; 2. Ajustar consistência com leite; 3. Servir gelado." },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado ao MongoDB");

    const existing = await SpecialRecipe.countDocuments();
    if (existing > 0) {
      console.log(`⚠️  Já existem ${existing} receitas especiais. A sair.`);
      await mongoose.disconnect();
      process.exit(0);
    }

    const all = [...petiscos, ...doces, ...cocktails];
    const result = await SpecialRecipe.insertMany(all);
    console.log(`✅ ${result.length} receitas especiais importadas!`);

  } catch (err) {
    console.error("❌ Erro:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();