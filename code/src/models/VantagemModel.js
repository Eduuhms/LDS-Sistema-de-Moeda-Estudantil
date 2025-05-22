const db = require('../config/database');

class VantagemModel {
    static async criar(vantagem){
        const { nome, descricao, foto, custoMoedas, empresaId} = vantagem;

        const [result] = await db.query(
            'INSERT INTO vantagens (nome, descricao, foto, custo_moedas, empresa_id) VALUES (?,?,?,?,?)',
            [nome, descricao, foto, custoMoedas, empresaId]
        );

        return result.insertId;
    }
    
}

module.exports = VantagemModel;
