const db = require('../config/database');

class TransacaoModel {
    static async criar(transacao) {
        const { quantidade, mensagem, origemId, destinoId, tipoTransacao } = transacao;

        const [result] = await db.query(
            'INSERT INTO transacoes (quantidade, mensagem, origem_id, destino_id, tipo_transacao) VALUES (?, ?, ?, ?, ?)',
            [quantidade, mensagem, origemId, destinoId, tipoTransacao]
        );
        return result.insertId;
    }

    static async buscarPorId(id) {
        const [transacoes] = await db.query(
            'SELECT * FROM transacoes WHERE id = ?',
            [id]
        );
        return transacoes[0];
    }

    static async listar() {
        const [transacoes] = await db.query('SELECT * FROM transacoes');
        return transacoes;
    }

    static async atualizar(id, novosDados) {
        const { quantidade, mensagem, origemId, destinoId, tipoTransacao } = novosDados;
        await db.query(
            'UPDATE transacoes SET quantidade = ?, mensagem = ?, origem_id = ?, destino_id = ?, tipo_transacao = ? WHERE id = ?',
            [quantidade, mensagem, origemId, destinoId, tipoTransacao, id]
        );
    }

    static async excluir(id) {
        await db.query('DELETE FROM transacoes WHERE id = ?', [id]);
    }
}

module.exports = TransacaoModel;