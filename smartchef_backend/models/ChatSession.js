// models/ChatSession.js
const mongoose = require("mongoose");

// ============================================================
// MESSAGE SCHEMA COMPLETO
// Guarda TODOS os campos que o ChatBot.jsx usa nas mensagens
// ============================================================
const MessageSchema = new mongoose.Schema({
  // Tipo base da mensagem
  type: {
    type: String,
    default: "bot"
  },

  // Conteúdo textual
  content: {
    type: String,
    default: ""
  },

  // ── Imagens ──────────────────────────────────────────────
  image: String,          // imagem enviada pelo utilizador (câmara/galeria)
  imageUrl: String,       // imagem de um passo de cozinha
  thumbnailUrl: String,   // miniatura para listagens
  finalImage: String,     // imagem do prato final concluído

  // ── Passo de cozinha (type: "cooking-step") ───────────────
  step: {
    stepNumber: Number,
    description: String,
    imageUrl: String
  },

  // ── Opções de receita (type: "auto-recipe-options") ───────
  options: {
    type: mongoose.Schema.Types.Mixed,  // array de opções
    default: null
  },

  // ── Receita criada (type: "receita_criada") ───────────────
  receita: {
    type: mongoose.Schema.Types.Mixed,  // objeto completo da receita
    default: null
  },

  // Botão "Começar Passo a Passo"
  podeIniciarPassoAPasso: {
    type: Boolean,
    default: false
  },
  mensagemInicio: String,
  totalPassos: Number,

  // ── Progresso ─────────────────────────────────────────────
  progress: String,       // ex: "2/6"
  totalSteps: Number,

  // ── Receita concluída (type: "recipe-completed") ──────────
  recipeTitle: String,
  ingredientsUsed: [String],
  cookingTime: String,
  difficulty: String,
  showConfetti: Boolean,
  showRating: Boolean,
  showShare: Boolean,
  showFavorite: Boolean,
  showDownload: Boolean,

  // ── Outros campos contextuais ─────────────────────────────
  sessionId: String,
  ingredientesUtilizados: [String],
  ingredients: [String],   // ingredientes para type: "simple-recipe-start"
  isLoading: Boolean,

  // Metadata legacy (compatibilidade)
  metadata: {
    stepNumber: Number,
    recipeTitle: String,
    imageUrl: String,
    options: mongoose.Schema.Types.Mixed,
    totalSteps: Number,
    progress: String,
    stepDescription: String
  },

  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// ============================================================
// CHAT SESSION SCHEMA COMPLETO
// ============================================================
const ChatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  title: {
    type: String,
    required: true,
    default: "Nova Conversa Culinária"
  },

  category: {
    type: String,
    default: 'general'
  },

  // ── Mensagens completas ───────────────────────────────────
  messages: [MessageSchema],

  // ── Estado completo do chat ao momento de guardar ─────────
  // Guardado pelo ChatBot.jsx em saveToHistory → chatState
  chatState: {
    recipe: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    currentStep: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    options: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    },
    sessionId: String,
    loading: Boolean,
    isTyping: Boolean
  },

  // ── Estado da UI ao momento de guardar ────────────────────
  // Guardado pelo ChatBot.jsx em saveToHistory → uiState
  uiState: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // ── Dados da receita (atalho para acesso rápido) ──────────
  recipeData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  // ── Estatísticas ──────────────────────────────────────────
  statistics: {
    messageCount: { type: Number, default: 0 },
    imageCount:   { type: Number, default: 0 },
    recipeSteps:  { type: Number, default: 0 },
    duration:     { type: Number, default: 0 }
  },

  storageInfo: {
    totalImages:      { type: Number, default: 0 },
    estimatedStorage: { type: Number, default: 0 },
    cloudflareUrls:   [String]
  },

  // SEM enum — aceita 'active', 'completed', 'interrupted', 'archived' e outros
  status: {
    type:    String,
    default: 'active'
  },

  version: {
    type: String,
    default: '3.0'
  },

  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices compostos para queries eficientes
ChatSessionSchema.index({ userId: 1, lastActivity: -1 });
ChatSessionSchema.index({ userId: 1, category: 1 });
ChatSessionSchema.index({ userId: 1, status: 1 });
ChatSessionSchema.index({ title: 'text' });

module.exports = mongoose.model("ChatSession", ChatSessionSchema);