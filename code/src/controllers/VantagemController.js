const VantagemModel = require('../models/VantagemModel');

class VantagemController {
    static async cadastrar(req, res){
        try {
            const { nome, descricao, foto, custoMoedas, empresaId} = req.body;

            if (!nome || !descricao || !foto || !custoMoedas || !empresaId){
                return res.status(400).json({
                    erro: 'Todos os campos são obrigatórios'
                });
            }

            const vantagem = await VantagemModel.criar({
                nome,
                descricao,
                foto,
                custoMoedas,
                empresaId
            });
            console.log(vantagem)

            return res.status(201).json({
                mensagem: 'Vantagem cadastrada com sucesso',
                vantagem: {
                    id: vantagem,
                    nome,
                    descricao,
                    foto,
                    custoMoedas,
                    empresaId
                }
            });
        } catch (error) {
            console.error('Erro ao cadastrar vantagem:', error);
            return res.status(500).json({
                erro: 'Falha ao cadastrar vantagem. Por favor, tente novamente mais tarde.'
            });
        }
    }
}

module.exports = VantagemController;
