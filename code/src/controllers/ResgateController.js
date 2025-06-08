const ResgateModel = require('../models/ResgateModel');
const AlunoModel = require('../models/AlunoModel');

class ResgateController {
    static async listarPorAluno(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ erro: 'Usuário não autenticado' });
            }

            // Verifica se o usuário é um aluno
            const aluno = await AlunoModel.buscarPorUsuarioId(req.session.userId);
            if (!aluno) {
                return res.status(403).json({ erro: 'Apenas alunos podem visualizar resgates' });
            }

            const resgates = await ResgateModel.buscarPorAluno(aluno.id);
            return res.status(200).json(resgates);
        } catch (error) {
            console.error('Erro ao listar resgates:', error);
            return res.status(500).json({
                erro: 'Falha ao listar resgates. Por favor, tente novamente mais tarde.'
            });
        }
    }
}

module.exports = ResgateController;