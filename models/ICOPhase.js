const mongoose = require('mongoose');

const icoPhaseSchema = new mongoose.Schema({
  phase: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 3
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tokenPrice: {
    type: Number,
    required: true
  },
  totalTokens: {
    type: Number,
    required: true
  },
  tokensSold: {
    type: Number,
    default: 0
  },
  totalRaised: {
    type: Number,
    default: 0
  },
  percentageOfSupply: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  minPurchase: {
    type: Number,
    default: 0.01 // em MATIC
  },
  maxPurchase: {
    type: Number,
    default: 1000 // em MATIC
  },
  bonusPercentage: {
    type: Number,
    default: 0
  },
  contractAddress: {
    type: String,
    lowercase: true
  }
}, {
  timestamps: true
});

// Virtual para calcular tokens restantes
icoPhaseSchema.virtual('tokensRemaining').get(function() {
  return this.totalTokens - this.tokensSold;
});

// Método para verificar se a fase está ativa
icoPhaseSchema.methods.checkIfActive = function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate && !this.isCompleted;
};

// Método para calcular progresso da fase
icoPhaseSchema.methods.getProgress = function() {
  return this.totalTokens > 0 ? (this.tokensSold / this.totalTokens) * 100 : 0;
};

// Middleware para atualizar status antes de salvar
icoPhaseSchema.pre('save', function(next) {
  // Verificar se a fase deve estar ativa baseado na data
  const now = new Date();
  const shouldBeActive = now >= this.startDate && now <= this.endDate && !this.isCompleted;
  
  // Se a fase foi completada (todos os tokens vendidos)
  if (this.tokensSold >= this.totalTokens) {
    this.isCompleted = true;
    this.isActive = false;
  } else if (shouldBeActive && !this.isCompleted) {
    // Manter ativo se deve estar ativo e não foi completado
    // (mas não forçar ativação automática - isso deve ser controlado manualmente)
  }
  
  next();
});

// Incluir virtuals no JSON
icoPhaseSchema.set('toJSON', { virtuals: true });
icoPhaseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ICOPhase', icoPhaseSchema);

