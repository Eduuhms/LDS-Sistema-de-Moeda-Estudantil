const TransacaoModel = require('../models/TransacaoModel');

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
            const { dataHora, quantidade, mensagem, origemId, destinoId, tipoTransacao } = req.body;
            if (!quantidade || !origemId || !destinoId || !tipoTransacao) {
                return res.status(400).json({ erro: 'Campos obrigatórios: quantidade, origemId, destinoId, tipoTransacao' });
            }
            const id = await TransacaoModel.criar({ dataHora, quantidade, mensagem, origemId, destinoId, tipoTransacao });
            const transacao = await TransacaoModel.buscarPorId(id);
            return res.status(201).json({ mensagem: 'Transação criada com sucesso', transacao });
        } catch (error) {
            return res.status(500).json({ erro: 'Erro ao criar transação.' });
        }
    }

    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { dataHora, quantidade, mensagem, origemId, destinoId, tipoTransacao } = req.body;
            const transacao = await TransacaoModel.buscarPorId(id);
            if (!transacao) {
                return res.status(404).json({ erro: 'Transação não encontrada.' });
            }
            await TransacaoModel.atualizar(id, { dataHora, quantidade, mensagem, origemId, destinoId, tipoTransacao });
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
}

module.exports = TransacaoController; 