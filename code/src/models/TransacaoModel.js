const db = require('../config/database');

class TransacaoModel {
    static async criar(transacao) {
        const { dataHora, quantidade, mensagem, origemId, destinoId, tipoTransacao } = transacao;
        const [result] = await db.query(
            'INSERT INTO transacoes (data_hora, quantidade, mensagem, origem_id, destino_id, tipo_transacao) VALUES (?, ?, ?, ?, ?, ?)',
            [dataHora || new Date(), quantidade, mensagem, origemId, destinoId, tipoTransacao]
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
        const { dataHora, quantidade, mensagem, origemId, destinoId, tipoTransacao } = novosDados;
        await db.query(
            'UPDATE transacoes SET data_hora = ?, quantidade = ?, mensagem = ?, origem_id = ?, destino_id = ?, tipo_transacao = ? WHERE id = ?',
            [dataHora, quantidade, mensagem, origemId, destinoId, tipoTransacao, id]
        );
    }

    static async excluir(id) {
        await db.query('DELETE FROM transacoes WHERE id = ?', [id]);
    }
}

module.exports = TransacaoModel;