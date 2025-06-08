const db = require('../config/database');

class ResgateModel {
    static async criar(resgate) {
        const { aluno_id, vantagem_id, transacao_id } = resgate;

        const [result] = await db.query(
            'INSERT INTO resgates (aluno_id, vantagem_id, transacao_id) VALUES (?, ?, ?)',
            [aluno_id, vantagem_id, transacao_id]
        );

        return result.insertId;
    }

    static async buscarPorAluno(aluno_id) {
        const [resgates] = await db.query(
            `SELECT r.*, v.nome as vantagem_nome, v.descricao, v.foto, t.quantidade as custo_moedas
             FROM resgates r
             JOIN vantagens v ON r.vantagem_id = v.id
             JOIN transacoes t ON r.transacao_id = t.id
             WHERE r.aluno_id = ?`,
            [aluno_id]
        );
        return resgates;
    }
}

module.exports = ResgateModel;