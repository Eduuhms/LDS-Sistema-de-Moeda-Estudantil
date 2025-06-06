
const ProfessorModel = require('../models/ProfessorModel');
const TransacaoModel = require('../models/TransacaoModel');
const TipoTransacaoEnum = require('../models/TipoTransacaoEnum');
const cron = require('node-cron');
const logger = require('../config/logger');

class MoedasCron {
  static init() {
    // Agendando para rodar no primeiro dia de Janeiro e Julho às 00:00
    // Para testar, mude o '0 0 1 1,7 *' para '* * * * *' para rodar a cada minuto
    cron.schedule('0 0 1 1,7 *', this.executarAdicaoDeMoedas);
    
    logger.info('Agendador de moedas semestrais iniciado...');
  }

  static async executarAdicaoDeMoedas() {
    try {
      const now = new Date();
      const semestre = Math.ceil((now.getMonth() + 1) / 6); 
      
      logger.info(`Iniciando adição semestral de moedas (Semestre ${semestre} de ${now.getFullYear()})...`);
      
      // Primeiro obtemos todos os professores
      const professores = await ProfessorModel.listarIds();
      
      // Para cada professor, adicionamos moedas e criamos a transação
      for (const professor of professores) {
        try {
          // Adiciona as moedas
          await ProfessorModel.adicionarSaldo(professor.id, 1000);
          
          // Cria a transação
          await TransacaoModel.criar({
            quantidade: 1000,
            mensagem: 'Recebimento semestral de moedas',
            origemId: 1,
            destinoId: professor.usuario_id,
            tipoTransacao: TipoTransacaoEnum.RECEBIMENTO_SEMESTRAL
          });
        } catch (error) {
          logger.error(`Erro ao processar professor ID ${professor.id}:`, error);
        }
      }
      
      logger.info(`Moedas do semestre ${semestre} adicionadas com sucesso a todos os professores. Total: ${professores.length} professores.`);
    } catch (error) {
      logger.error('Erro ao adicionar moedas semestrais:', error);
    }
  }
}

module.exports = MoedasCron;







// const cron = require('node-cron');
// const ProfessorModel = require('../models/ProfessorModel');

// class MoedasCron {
//   static init() {
//     // Modifique para executar a cada minuto (apenas para teste)
//     cron.schedule('* * * * *', this.executarAdicaoDeMoedas);
    
//     console.log('⚠️ AGENDADOR EM MODO TESTE - Executando a cada minuto');
//   }

//   static async executarAdicaoDeMoedas() {
//     try {
//       console.log('🏦 TESTE: Adicionando moedas...');
//       await ProfessorModel.adicionarSaldoATodos(1000);
//       console.log('✅ Moedas adicionadas com sucesso (TESTE)');
//     } catch (error) {
//       console.error('❌ Erro no teste:', error);
//     }
//   }
// }

// // Execute imediatamente para teste (adicione estas linhas)
// console.log("🔹 Executando teste manual...");
// MoedasCron.executarAdicaoDeMoedas();

// module.exports = MoedasCron;
