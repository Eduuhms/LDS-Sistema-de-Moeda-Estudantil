const ProfessorModel = require('../models/ProfessorModel');
const cron = require('node-cron');
const logger = require('../config/logger');

class MoedasCron {
  static init() {
    // Agendando para rodar no primeiro dia de Janeiro e Julho às 00:00
    cron.schedule('0 0 1 1,7 *', this.executarAdicaoDeMoedas);
    
    logger.info('Agendador de moedas semestrais iniciado...');
  }

  static async executarAdicaoDeMoedas() {
    try {
      const now = new Date();
      const semestre = Math.ceil((now.getMonth() + 1) / 6); // 1 ou 2
      
      logger.info(`Iniciando adição semestral de moedas (Semestre ${semestre} de ${now.getFullYear()})...`);
      
      await ProfessorModel.adicionarSaldoATodos(1000);
      
      logger.info(`Moedas do semestre ${semestre} adicionadas com sucesso a todos os professores.`);
    } catch (error) {
      logger.error('Erro ao adicionar moedas semestrais:', error);
    }
  }
}

module.exports = MoedasCron;

/* 

TESTE PARA ADICIONAR MOEDAS A CADA MINUTO

const cron = require('node-cron');
const ProfessorModel = require('../models/ProfessorModel');

class MoedasCron {
  static init() {
    // Modifique para executar a cada minuto (apenas para teste)
    cron.schedule('* * * * *', this.executarAdicaoDeMoedas);
    
    console.log('⚠️ AGENDADOR EM MODO TESTE - Executando a cada minuto');
  }

  static async executarAdicaoDeMoedas() {
    try {
      console.log('🏦 TESTE: Adicionando moedas...');
      await ProfessorModel.adicionarSaldoATodos(1000);
      console.log('✅ Moedas adicionadas com sucesso (TESTE)');
    } catch (error) {
      console.error('❌ Erro no teste:', error);
    }
  }
}

// Execute imediatamente para teste (adicione estas linhas)
console.log("🔹 Executando teste manual...");
MoedasCron.executarAdicaoDeMoedas();

module.exports = MoedasCron;
*/