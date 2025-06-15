const db = require('../config/database');
const emailService = require('../services/EmailService');
const UsuarioModel = require('./UsuarioModel');

class ResgateModel {
    static gerarCodigoAleatorio() {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let codigo = '';
        for (let i = 0; i < 6; i++) {
            codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        return codigo;
    }

    static async criar(resgate) {
        const { aluno_id, vantagem_id, transacao_id } = resgate;
        console.log('Criando resgate:', resgate);

        // Gera o código aleatório
        const codigo = this.gerarCodigoAleatorio();

        const [result] = await db.query(
            'INSERT INTO resgates (aluno_id, vantagem_id, transacao_id, codigo) VALUES (?, ?, ?, ?)',
            [aluno_id, vantagem_id, transacao_id.id, codigo]
        );

        // Busca os dados do aluno para obter o e-mail
        const [alunos] = await db.query(
            'SELECT u.email FROM usuarios u JOIN alunos a ON u.id = a.usuario_id WHERE a.id = ?',
            [aluno_id]
        );

        // Busca os dados da vantagem
        const [vantagens] = await db.query(
            'SELECT * FROM vantagens WHERE id = ?',
            [vantagem_id]
        );

        if (alunos.length > 0 && vantagens.length > 0) {
            // Envia o e-mail com o código
            await emailService.enviarEmailResgate(alunos[0].email, codigo, vantagens[0]);
        }

        return result.insertId;
    }

    static async buscarPorAluno(aluno_id) {
        const [resgates] = await db.query(
            `SELECT r.*, v.nome as vantagem_nome, v.descricao, v.foto, t.quantidade as custo_moedas, r.codigo
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