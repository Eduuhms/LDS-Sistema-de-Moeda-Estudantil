const ProfessorModel = require('../models/ProfessorModel');
const TransacaoModel = require('../models/TransacaoModel');
const TipoTransacaoEnum = require('../models/TipoTransacaoEnum');
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
      
      // Primeiro obtemos todos os professores
      const professores = await ProfessorModel.listarIds();
      
      // Para cada professor, adicionamos moedas e criamos a transação
      for (const professor of professores) {
        try {
          // Adiciona as moedas
          await ProfessorModel.atualizarSaldo(professor.id, 1000);
          
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