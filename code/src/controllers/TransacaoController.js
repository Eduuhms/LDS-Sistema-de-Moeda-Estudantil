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
            if (!quantidade || !origemId || !destinoId || !tipoTransacao) {
                return res.status(400).json({ erro: 'Campos obrigatórios: quantidade, origemId, destinoId, tipoTransacao' });
            }
            const id = await TransacaoModel.criar({quantidade, mensagem, origemId, destinoId, tipoTransacao });
            const transacao = await TransacaoModel.buscarPorId(id);
            
            var usuarioOrigemDados, usuarioDestinoDados;

            // Atualiza dados do usuario de origem 
            const usuarioOrigem = await UsuarioModel.buscarPorId(origemId);
            if (usuarioOrigem.tipo != 'empresa'){
                if (usuarioOrigem.tipo == 'professor') {
                    usuarioOrigemDados = await ProfessorModel.buscarPorUsuarioId(origemId);
                } else if (usuarioOrigem.tipo == 'aluno') {
                    usuarioOrigemDados = await AlunoModel.buscarPorUsuarioId(origemId);
                }
                // console.log(usuarioOrigemDados)
                usuarioOrigemDados.saldo -= quantidade;

                if (usuarioOrigem.tipo == 'professor') {
                    usuarioOrigemDados = await ProfessorModel.atualizarSaldo(usuarioOrigemDados.id, usuarioOrigemDados.saldo);
                } else if (usuarioOrigem.tipo == 'aluno') {
                    usuarioOrigemDados = await AlunoModel.atualizarSaldo(usuarioOrigemDados.id, usuarioOrigemDados.saldo);
                }
            }

            // Atualizando dados do usuario de destino
            const usuarioDestino = await UsuarioModel.buscarPorId(destinoId);
            if (usuarioDestino.tipo != 'empresa'){
                if (usuarioDestino.tipo == 'professor') {
                    usuarioDestinoDados = await ProfessorModel.buscarPorUsuarioId(destinoId);
                } else if (usuarioDestino.tipo == 'aluno') {
                    usuarioDestinoDados = await AlunoModel.buscarPorUsuarioId(destinoId);
                }
                console.log(quantidade)
                usuarioDestinoDados.saldo += quantidade;
                console.log(usuarioDestinoDados)

                if (usuarioDestino.tipo == 'professor') {
                    usuarioDestinoDados = await ProfessorModel.atualizarSaldo(usuarioDestinoDados.id, usuarioDestinoDados.saldo);
                } else if (usuarioDestino.tipo == 'aluno') {
                    usuarioDestinoDados = await AlunoModel.atualizarSaldo(usuarioDestinoDados.id, usuarioDestinoDados.saldo);
                }
            }
            
            return res.status(201).json({ mensagem: 'Transação criada com sucesso', transacao });
        } catch (error) {
            console.log(error)
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
}

module.exports = TransacaoController; 