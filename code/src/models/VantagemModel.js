const db = require('../config/database');

class VantagemModel {
    static async criar(vantagem) {
        const { nome, descricao, foto, custoMoedas, empresaId } = vantagem;

        const [result] = await db.query(
            'INSERT INTO vantagens (nome, descricao, foto, custo_moedas, empresa_id) VALUES (?,?,?,?,?)',
            [nome, descricao, foto, custoMoedas, empresaId]
        );

        return result.insertId;
    }

    static async atualizar(id, vantagem) {
        const { nome, descricao, foto, custoMoedas, empresaId } = vantagem;

        const [result] = await db.query(
            'UPDATE vantagens SET nome = ?, descricao = ?, foto = ?, custo_moedas = ?, empresa_id = ? WHERE id = ?',
            [nome, descricao, foto, custoMoedas, empresaId, id]
        );

        return result.affectedRows > 0;
    }

    static async deletar(id) {
        const [result] = await db.query(
            'DELETE FROM vantagens WHERE id = ?',
            [id]
        );

        return result.affectedRows > 0;
    }

    static async buscarTodos() {
        const [vantagens] = await db.query(
            'SELECT * FROM vantagens'
        );

        return vantagens;
    }

    static async buscarPorId(id) {
        const [vantagem] = await db.query(
            'SELECT * FROM vantagens WHERE id = ?',
            [id]
        );

        return vantagem[0] || null;
    }
}

module.exports = VantagemModel;