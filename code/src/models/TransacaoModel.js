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

    static async buscarPorUsuario(usuarioId) {
        try {
            const connection = await db.getConnection();
            const [rows] = await connection.execute(
                `SELECT t.*, 
                        u_origem.nome as nome_origem, 
                        u_destino.nome as nome_destino
                 FROM transacoes t
                 LEFT JOIN usuarios u_origem ON t.origem_id = u_origem.id
                 LEFT JOIN usuarios u_destino ON t.destino_id = u_destino.id
                 WHERE t.origem_id = ? OR t.destino_id = ?
                 ORDER BY t.created_at DESC`,
                [usuarioId, usuarioId]
            );
            connection.release();
            return rows;
        } catch (error) {
            console.error('Erro ao buscar transações do usuário:', error);
            throw error;
        }
    }
}

module.exports = TransacaoModel;