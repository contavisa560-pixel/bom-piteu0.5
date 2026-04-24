// models/Preference.js
const mongoose = require("mongoose");

/**
 * PREFERENCE MODEL - Preferências Alimentares
 * 
 * RESPONSABILIDADE:
 * - Dietas (Vegana, Keto, etc)
 * - Alergias e Intolerâncias
 * - Objetivos nutricionais
 * - Restrições alimentares
 * 
 * RELAÇÃO: 1-para-1 com User
 */

const PreferenceSchema = new mongoose.Schema(
  {
    // ==================== RELAÇÃO COM USUÁRIO ====================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Um usuário = uma preferência
      index: true,
    },

    // ==================== DIETAS ====================
    diets: {
      type: [String],
      enum: [
        // Estilo de Vida
        "Vegana",
        "Vegetariana",
        "Flexitariana",
        "Macrobiótica",
        "Crudivorismo",
        
        // Controle Calórico
        "Cetogênica (Keto)",
        "Atkins",
        "Low Carb",
        "South Beach",
        "Zone",
        
        // Terapêuticas
        "DASH",
        "Sem Glúten",
        "FODMAP",
        "Anti-inflamatória",
        "Detox",
        
        // Tradicionais
        "Mediterrânica",
        "Paleo",
        "Whole30",
        "Carnívora",
        "Jejum Intermitente"
      ],
      default: []
    },

    // ==================== ALERGIAS ====================
    allergies: [
      {
        name: {
          type: String,
          enum: [
            "Amendoim",
            "Leite",
            "Ovo",
            "Trigo",
            "Frutos Secos",
            "Marisco",
            "Peixe",
            "Soja",
            "Sésamo",
            "Sulfitos",
            "Outro"
          ],
          required: true
        },
        severity: {
          type: String,
          enum: ["leve", "moderada", "grave"],
          default: "moderada"
        },
        customName: String // Para "Outro"
      }
    ],

    // ==================== INTOLERÂNCIAS ====================
    intolerances: [
      {
        name: {
          type: String,
          enum: [
            "Lactose",
            "Glúten (Celíaca)",
            "Glúten (Sensibilidade)",
            "Frutose",
            "Histamina",
            "Sacarose",
            "Álcool",
            "Sorbitol",
            "FODMAP",
            "Outro"
          ],
          required: true
        },
        customName: String
      }
    ],

    // ==================== OBJETIVOS NUTRICIONAIS ====================
    goals: [
      {
        name: {
          type: String,
          enum: [
            "Aumentar Massa Muscular",
            "Perder Peso (Caloria)",
            "Aumentar Força",
            "Aumentar Proteínas",
            "Melhorar Saúde Mental",
            "Aumentar Hidratação",
            "Pós-Cirurgia",
            "Apoio à Menopausa",
            "Performance Desportiva",
            "Aumentar Imunidade",
            "Equilíbrio Hormonal",
            "Gestação ou Pré-Gravidez",
            "Saúde Intestinal",
            "Qualidade do Sono",
            "Reduzir Colesterol",
            "Outro"
          ],
          required: true
        },
        intensity: {
          type: String,
          enum: ["leve", "moderado", "intenso"],
          default: "moderado"
        },
        customName: String
      }
    ],

    // ==================== MACROS & CALORIAS ====================
    calorieTarget: {
      type: Number,
      min: 800,
      max: 5000,
      default: null
    },
    
    macros: {
      carb: { type: Number, min: 0, max: 100, default: 50 },
      protein: { type: Number, min: 0, max: 100, default: 25 },
      fat: { type: Number, min: 0, max: 100, default: 25 }
    },

    // ==================== TIPO SANGUÍNEO ====================
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    // ==================== PERFIL ALIMENTAR (LEGACY - para migração) ====================
    foodProfile: {
      type: [String],
      default: [],
    },
  },
  { 
    timestamps: true 
  }
);

// ==================== VALIDAÇÕES ====================

// Garante que macros somam 100% (ou próximo)
PreferenceSchema.pre('save', function(next) {
  const total = this.macros.carb + this.macros.protein + this.macros.fat;
  
  if (total > 0 && Math.abs(total - 100) > 5) {
    // Normaliza automaticamente
    const factor = 100 / total;
    this.macros.carb = Math.round(this.macros.carb * factor);
    this.macros.protein = Math.round(this.macros.protein * factor);
    this.macros.fat = 100 - this.macros.carb - this.macros.protein;
  }
  
  next();
});

// ==================== MÉTODOS DE INSTÂNCIA ====================

/**
 * Verifica se usuário tem uma alergia específica
 */
PreferenceSchema.methods.hasAllergy = function(allergyName) {
  return this.allergies.some(a => 
    a.name === allergyName || a.customName === allergyName
  );
};

/**
 * Verifica se usuário tem uma intolerância
 */
PreferenceSchema.methods.hasIntolerance = function(intoleranceName) {
  return this.intolerances.some(i => 
    i.name === intoleranceName || i.customName === intoleranceName
  );
};

/**
 * Retorna lista simplificada de restrições para IA
 */
PreferenceSchema.methods.getRestrictionsForAI = function() {
  const restrictions = [];
  
  // Dietas
  if (this.diets.length > 0) {
    restrictions.push(`Dietas: ${this.diets.join(', ')}`);
  }
  
  // Alergias
  if (this.allergies.length > 0) {
    const allergyNames = this.allergies.map(a => a.customName || a.name);
    restrictions.push(`Alergias: ${allergyNames.join(', ')}`);
  }
  
  // Intolerâncias
  if (this.intolerances.length > 0) {
    const intNames = this.intolerances.map(i => i.customName || i.name);
    restrictions.push(`Intolerâncias: ${intNames.join(', ')}`);
  }
  
  // Objetivos
  if (this.goals.length > 0) {
    const goalNames = this.goals.map(g => g.customName || g.name);
    restrictions.push(`Objetivos: ${goalNames.join(', ')}`);
  }
  
  return restrictions.join(' | ');
};

module.exports = mongoose.model("Preference", PreferenceSchema);