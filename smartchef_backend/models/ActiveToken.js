const mongoose = require("mongoose");

const activeTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    
    token: {
      type: String,
      required: true,
      unique: true
    },
    
    device: {
      type: String,
      default: "Dispositivo desconhecido"
    },
    
    browser: {
      type: String,
      default: "Navegador desconhecido"
    },
    
    os: {
      type: String,
      default: "Sistema desconhecido"
    },
    
    ip: {
      type: String,
      default: "127.0.0.1"
    },
    
    isActive: {
      type: Boolean,
      default: true
    },
    
    lastUsed: {
      type: Date,
      default: Date.now
    },
    
    createdAt: {
      type: Date,
      default: Date.now
    },
    
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Método para verificar se está expirado 
activeTokenSchema.methods.isTokenExpired = function () {
  return new Date() > this.expiresAt;
};

// Método estático para limpar tokens expirados
activeTokenSchema.statics.cleanExpiredTokens = async function () {
  try {
    const result = await this.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    console.log(` Limpados ${result.deletedCount} tokens expirados`);
    return result;
  } catch (error) {
    console.error(" Erro ao limpar tokens expirados:", error);
    return null;
  }
};

// Criar índice para melhor performance
activeTokenSchema.index({ userId: 1, isActive: 1 });
activeTokenSchema.index({ expiresAt: 1 });
activeTokenSchema.index({ lastUsed: -1 });

module.exports = mongoose.model("ActiveToken", activeTokenSchema);