const mongoose = require('mongoose');
const ICOPhase = require('../models/ICOPhase');
require('dotenv').config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB conectado com sucesso'))
.catch(err => {
  console.error('❌ Erro ao conectar MongoDB:', err);
  process.exit(1);
});

// Dados das fases da ICO
const phases = [
  {
    phase: 1,
    name: 'Fase 1 - Early Bird',
    description: 'Primeira fase da ICO com maior desconto',
    tokenPrice: 0.01,
    totalTokens: 1680000, // 8% de 21M
    percentageOfSupply: 8,
    bonusPercentage: 20,
    minPurchase: 0.01,
    maxPurchase: 1000,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-06-30'),
    isActive: true,
    isCompleted: false,
    tokensSold: 0,
    totalRaised: 0
  },
  {
    phase: 2,
    name: 'Fase 2 - Public Sale',
    description: 'Segunda fase da ICO para o público geral',
    tokenPrice: 0.05,
    totalTokens: 4200000, // 20% de 21M
    percentageOfSupply: 20,
    bonusPercentage: 10,
    minPurchase: 0.01,
    maxPurchase: 500,
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-12-31'),
    isActive: false,
    isCompleted: false,
    tokensSold: 0,
    totalRaised: 0
  },
  {
    phase: 3,
    name: 'Fase 3 - Final Sale',
    description: 'Fase final da ICO após lançamento',
    tokenPrice: 1.00,
    totalTokens: 2100000, // 10% de 21M
    percentageOfSupply: 10,
    bonusPercentage: 0,
    minPurchase: 0.01,
    maxPurchase: 100,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-06-30'),
    isActive: false,
    isCompleted: false,
    tokensSold: 0,
    totalRaised: 0
  }
];

async function initializeICOPhases() {
  try {
    console.log('🚀 Inicializando fases da ICO...');

    // Limpar fases existentes (opcional - remova se quiser manter dados existentes)
    await ICOPhase.deleteMany({});
    console.log('🗑️ Fases existentes removidas');

    // Criar novas fases
    for (const phaseData of phases) {
      const phase = new ICOPhase(phaseData);
      await phase.save();
      console.log(`✅ Fase ${phaseData.phase} criada: ${phaseData.name}`);
    }

    console.log('🎉 Todas as fases da ICO foram inicializadas com sucesso!');
    
    // Mostrar status atual
    const allPhases = await ICOPhase.find().sort({ phase: 1 });
    console.log('\n📊 Status das Fases:');
    allPhases.forEach(phase => {
      console.log(`Fase ${phase.phase}: ${phase.name} - ${phase.isActive ? 'ATIVA' : 'INATIVA'} - ${phase.isCompleted ? 'COMPLETA' : 'PENDENTE'}`);
    });

  } catch (error) {
    console.error('❌ Erro ao inicializar fases da ICO:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Conexão com MongoDB fechada');
  }
}

// Executar inicialização
initializeICOPhases();

