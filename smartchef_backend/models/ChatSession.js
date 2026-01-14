// models/ChatSession.js
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['user', 'bot', 'system'],
    required: true
  },
  content: {
    type: String,
    default: ""
  },
  imageUrl: String,
  thumbnailUrl: String,
  metadata: {
    stepNumber: Number,
    recipeTitle: String,
    imageUrl: String,
    fileSize: Number,
    dimensions: {
      width: Number,
      height: Number
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

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
    enum: ['angolan', 'international', 'general', 'dessert', 'vegetarian'],
    default: 'general'
  },
  
  messages: [MessageSchema],
  
  recipeData: {
    recipeId: String,
    title: String,
    ingredients: [String],
    steps: [{
      stepNumber: Number,
      description: String,
      imageUrl: String
    }],
    finalImage: String,
    completed: {
      type: Boolean,
      default: false
    }
  },
  
  statistics: {
    messageCount: {
      type: Number,
      default: 0
    },
    imageCount: {
      type: Number,
      default: 0
    },
    recipeSteps: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 0
    }
  },
  
  storageInfo: {
    totalImages: {
      type: Number,
      default: 0
    },
    estimatedStorage: {
      type: Number,
      default: 0
    },
    cloudflareUrls: [String]
  },
  
  status: {
    type: String,
    enum: ['active', 'completed', 'interrupted', 'archived'],
    default: 'active'
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

// Middleware para atualizar lastActivity automaticamente
ChatSessionSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

module.exports = mongoose.model("ChatSession", ChatSessionSchema);