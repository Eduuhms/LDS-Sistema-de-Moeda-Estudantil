const TransacaoModel = require('../models/TransacaoModel');
const UsuarioModel = require('../models/UsuarioModel');

class TransacaoController {
static async listar(req, res) {
    try {
        const transacoes = await TransacaoModel.listar();

        const resultadoFiltrado = transacoes.map(transacao => ({
            id: transacao.id,
            data: transacao.data,
            origem: transacao.origem_nome || transacao.origem_id,
            destino: transacao.destino_nome || transacao.destino_id,
            quantidade: transacao.quantidade,
            tipoTransacao: transacao.tipoTransacao
        }));

        return res.status(200).json(resultadoFiltrado);
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
            const { quantidade, mensagem, origemId, destinoId, tipoTransacao } = req.body;
            const quantidadeNum = parseFloat(quantidade);
    
            if (!quantidade || !origemId || !destinoId || !tipoTransacao || isNaN(quantidadeNum)) {
                return res.status(400).json({ erro: 'Campos obrigatórios: quantidade (numérica), origemId, destinoId, tipoTransacao' });
            }
    
            const transacao = await TransacaoModel.criar({
                quantidade: quantidadeNum,
                mensagem,
                origemId,
                destinoId,
                tipoTransacao
            });
            console.log("transacao")
            console.log(transacao)
    
            // const transacao = await TransacaoModel.buscarPorId(id);
    
            // Atualiza saldo do usuário de origem
            const usuarioOrigem = await UsuarioModel.buscarPorId(origemId);
            console.log("usuarioOrigem")
            console.log(usuarioOrigem)
            if (usuarioOrigem.tipo !== 'empresa') {
                const dadosOrigem = await UsuarioModel.buscarDadosUsuario(usuarioOrigem);
                console.log("dadosOrigem")
                console.log(dadosOrigem)
                const novoSaldoOrigem = parseFloat(dadosOrigem.saldo || 0) - quantidadeNum;
                await UsuarioModel.atualizarSaldoUsuario(usuarioOrigem, novoSaldoOrigem);
            }
    
            
            // Atualiza saldo do usuário de destino
            const usuarioDestino = await UsuarioModel.buscarPorId(destinoId);
            console.log("usuarioDestino")
            console.log(usuarioDestino)
            if (usuarioDestino.tipo !== 'empresa') {
                const dadosDestino = await UsuarioModel.buscarDadosUsuario(usuarioDestino);
                console.log("dadosDestino")
                console.log(dadosDestino)
                const novoSaldoDestino = parseFloat(dadosDestino.saldo || 0) + quantidadeNum;
                await UsuarioModel.atualizarSaldoUsuario(usuarioDestino, novoSaldoDestino);
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
    
            if (!transacao) {
                return res.status(404).json({ erro: 'Transação não encontrada.' });
            }
    
            // Reverte saldos antigos
            const usuarioOrigem = await UsuarioModel.buscarPorId(origemId);
            const usuarioDestino = await UsuarioModel.buscarPorId(destinoId);
    
            if (usuarioOrigem.tipo !== 'empresa') {
                const dadosOrigem = await UsuarioModel.buscarDadosUsuario(usuarioOrigem);
                const saldoRevertido = parseFloat(dadosOrigem.saldo || 0) + transacao.quantidade;
                await UsuarioModel.atualizarSaldoUsuario(usuarioOrigem, saldoRevertido);
            }
            if (usuarioDestino.tipo !== 'empresa') {
                const dadosDestino = await UsuarioModel.buscarDadosUsuario(usuarioDestino);
                const saldoRevertido = parseFloat(dadosDestino.saldo || 0) - transacao.quantidade;
                await UsuarioModel.atualizarSaldoUsuario(usuarioDestino, saldoRevertido);
            }
    
            // Aplica novos saldos
            const quantidadeNum = parseFloat(quantidade);
            if (usuarioOrigem.tipo !== 'empresa') {
                const dadosOrigem = await UsuarioModel.buscarDadosUsuario(usuarioOrigem);
                const novoSaldoOrigem = parseFloat(dadosOrigem.saldo || 0) - quantidadeNum;
                await UsuarioModel.atualizarSaldoUsuario(usuarioOrigem, novoSaldoOrigem);
            }
            if (usuarioDestino.tipo !== 'empresa') {
                const dadosDestino = await UsuarioModel.buscarDadosUsuario(usuarioDestino);
                const novoSaldoDestino = parseFloat(dadosDestino.saldo || 0) + quantidadeNum;
                await UsuarioModel.atualizarSaldoUsuario(usuarioDestino, novoSaldoDestino);
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