const TransacaoModel = require('../models/TransacaoModel');
const UsuarioModel = require('../models/UsuarioModel');
const AlunoModel = require('../models/AlunoModel');
const ProfessorModel = require('../models/ProfessorModel');
class TransacaoController {
    static async listar(req, res) {
        try {
            const transacoes = await TransacaoModel.listar();
            return res.status(200).json(transacoes);
        } catch (error) {
            return res.status(500).json({ erro: 'Falha ao listar transações.' });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({ erro: 'ID de transação inválido' });
            }
            const transacao = await TransacaoModel.buscarPorId(id);
            if (!transacao) {
                return res.status(404).json({ erro: 'Transação não encontrada.' });
            }
            return res.status(200).json(transacao);
        } catch (error) {
            return res.status(500).json({ erro: 'Falha ao buscar transação.' });
        }
    }

static async criar(req, res) {
    try {
        const {quantidade, mensagem, origemId, destinoId, tipoTransacao } = req.body;
        
        // Garantir que quantidade seja tratada como número
        const quantidadeNum = parseFloat(quantidade);
        
        if (!quantidade || !origemId || !destinoId || !tipoTransacao || isNaN(quantidadeNum)) {
            return res.status(400).json({ erro: 'Campos obrigatórios: quantidade (numérica), origemId, destinoId, tipoTransacao' });
        }

        const id = await TransacaoModel.criar({
            quantidade: quantidadeNum, 
            mensagem, 
            origemId, 
            destinoId, 
            tipoTransacao 
        });
        
        const transacao = await TransacaoModel.buscarPorId(id);
        
        // Atualiza dados do usuario de origem 
        const usuarioOrigem = await UsuarioModel.buscarPorId(origemId);
        if (usuarioOrigem.tipo != 'empresa'){
            let usuarioOrigemDados;
            if (usuarioOrigem.tipo == 'professor') {
                usuarioOrigemDados = await ProfessorModel.buscarPorUsuarioId(origemId);
            } else if (usuarioOrigem.tipo == 'aluno') {
                usuarioOrigemDados = await AlunoModel.buscarPorUsuarioId(origemId);
            }
            
            // Garantir que o saldo atual seja tratado como número
            usuarioOrigemDados.saldo = parseFloat(usuarioOrigemDados.saldo || 0);
            usuarioOrigemDados.saldo -= quantidadeNum;

            if (usuarioOrigem.tipo == 'professor') {
                await ProfessorModel.atualizarSaldo(usuarioOrigemDados.id, usuarioOrigemDados.saldo);
            } else if (usuarioOrigem.tipo == 'aluno') {
                await AlunoModel.atualizarSaldo(usuarioOrigemDados.id, usuarioOrigemDados.saldo);
            }
        }

        // Atualizando dados do usuario de destino
        const usuarioDestino = await UsuarioModel.buscarPorId(destinoId);
        if (usuarioDestino.tipo != 'empresa'){
            let usuarioDestinoDados;
            if (usuarioDestino.tipo == 'professor') {
                usuarioDestinoDados = await ProfessorModel.buscarPorUsuarioId(destinoId);
            } else if (usuarioDestino.tipo == 'aluno') {
                usuarioDestinoDados = await AlunoModel.buscarPorUsuarioId(destinoId);
            }
            
            // Garantir que o saldo atual seja tratado como número
            usuarioDestinoDados.saldo = parseFloat(usuarioDestinoDados.saldo || 0);
            usuarioDestinoDados.saldo += quantidadeNum;

            if (usuarioDestino.tipo == 'professor') {
                await ProfessorModel.atualizarSaldo(usuarioDestinoDados.id, usuarioDestinoDados.saldo);
            } else if (usuarioDestino.tipo == 'aluno') {
                await AlunoModel.atualizarSaldo(usuarioDestinoDados.id, usuarioDestinoDados.saldo);
            }
        }
        
        return res.status(201).json({ mensagem: 'Transação criada com sucesso', transacao });
    } catch (error) {
        console.error('Erro ao criar transação:', error);
        return res.status(500).json({ erro: 'Erro ao criar transação.' });
    }
}

    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { quantidade, mensagem, origemId, destinoId, tipoTransacao } = req.body;
            const transacao = await TransacaoModel.buscarPorId(id);
            var usuarioOrigemDados, usuarioDestinoDados;
            if (!transacao) {
                return res.status(404).json({ erro: 'Transação não encontrada.' });
            }

            // Atualizando dados do usuario de origem 
            const usuarioOrigem = await UsuarioModel.buscarPorId(origemId);
            if (usuarioOrigem.tipoUsuario != 'empresa'){
                if (usuarioOrigem.tipoUsuario == 'professor') {
                    usuarioOrigemDados = await ProfessorModel.buscarPorUsuarioId(origemId);
                } else if (usuarioOrigem.tipoUsuario == 'aluno') {
                    usuarioOrigemDados = await AlunoModel.buscarPorUsuarioId(origemId);
                }
                usuarioOrigemDados.saldo += transacao.quantidade;
                usuarioOrigemDados.saldo += quantidade;

                if (usuarioOrigem.tipoUsuario == 'professor') {
                    usuarioOrigemDados = await ProfessorModel.atualizarSaldo(origemId, usuarioOrigemDados.saldo);
                } else if (usuarioOrigem.tipoUsuario == 'aluno') {
                    usuarioOrigemDados = await AlunoModel.atualizarSaldo(origemId, usuarioOrigemDados.saldo);
                }
            }

            // Atualizando dados do usuario de destino
            if (usuarioOrigem.tipoUsuario != 'empresa'){
                const usuarioDestino = await UsuarioModel.buscarPorId(destinoId);
                if (usuarioDestino.tipoUsuario == 'professor') {
                    usuarioDestinoDados = await ProfessorModel.buscarPorUsuarioId(destinoId);
                } else if (usuarioDestino.tipoUsuario == 'aluno') {
                    usuarioDestinoDados = await AlunoModel.buscarPorUsuarioId(destinoId);
                }
                usuarioDestinoDados.saldo -= transacao.quantidade;
                usuarioDestinoDados.saldo += quantidade;

                if (usuarioOrigem.tipoUsuario == 'professor') {
                    usuarioOrigemDados = await ProfessorModel.atualizarSaldo(origemId, usuarioOrigemDados.saldo);
                } else if (usuarioOrigem.tipoUsuario == 'aluno') {
                    usuarioOrigemDados = await AlunoModel.atualizarSaldo(origemId, usuarioOrigemDados.saldo);
                }
            }

            await TransacaoModel.atualizar(id, { quantidade, mensagem, origemId, destinoId, tipoTransacao });
            const transacaoAtualizada = await TransacaoModel.buscarPorId(id);
            return res.status(200).json({ mensagem: 'Transação atualizada com sucesso', transacao: transacaoAtualizada });
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao atualizar transação.' });
        }
    }

    static async excluir(req, res) {
        try {
            const { id } = req.params;
            const transacao = await TransacaoModel.buscarPorId(id);
            if (!transacao) {
                return res.status(404).json({ erro: 'Transação não encontrada.' });
            }
            await TransacaoModel.excluir(id);
            return res.status(200).json({ mensagem: 'Transação excluída com sucesso' });
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao excluir transação.' });
        }
    }

    static async renderTransacoes(req, res){
        if (!req.session.userId) {
            return res.redirect('/usuario/login');
        }
        const usuario = await UsuarioModel.buscarPorId(req.session.userId);
        if (usuario.tipo == 'empresa'){
            return res.redirect('/usuario/login');
        }
        res.render('historico-transacoes')
    }

    static async listarHistorico(req, res) {
        if (!req.session.userId) {
          return res.status(401).json({ erro: 'Usuário não autenticado' });
        }
        
        try {
          const usuario = await UsuarioModel.buscarPorId(req.session.userId);
          if (!usuario) {
            return res.status(403).json({ erro: 'Usuário não encontrado' });
          }
          
          // Busca transações onde o usuário é origem ou destino
          const transacoes = await TransacaoModel.buscarPorUsuario(req.session.userId);
          // Formata as transações para identificar ganhos e gastos
          const transacoesFormatadas = transacoes.map(transacao => {
            const isOrigem = transacao.origem_id === req.session.userId;
            return {
              ...transacao,
              tipo: isOrigem ? 'GASTO' : 'GANHO'
            };
          });
          console.log(transacoesFormatadas)
          
          res.json(transacoesFormatadas);
        } catch (error) {
          console.error('Erro ao listar histórico:', error);
          res.status(500).json({ erro: 'Erro ao buscar histórico de transações' });
        }
      }
}

module.exports = TransacaoController; 