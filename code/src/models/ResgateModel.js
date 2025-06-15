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

        // Busca os dados do aluno para obter o e-mail e nome
        const [alunos] = await db.query(
            'SELECT u.email, u.nome FROM usuarios u JOIN alunos a ON u.id = a.usuario_id WHERE a.id = ?',
            [aluno_id]
        );

        // Busca os dados da vantagem e da empresa
        const [vantagens] = await db.query(
            'SELECT v.*, u.email as email_empresa FROM vantagens v ' +
            'JOIN empresas e ON v.empresa_id = e.id ' +
            'JOIN usuarios u ON e.usuario_id = u.id ' +
            'WHERE v.id = ?',
            [vantagem_id]
        );

        if (alunos.length > 0 && vantagens.length > 0) {
            const vantagem = vantagens[0];
            const aluno = alunos[0];

            // Envia o e-mail com o código para o aluno
            await emailService.enviarEmailResgate(aluno.email, codigo, vantagem);

            // Envia o e-mail com o código para a empresa
            await emailService.enviarEmailResgateEmpresa(vantagem.email_empresa, codigo, vantagem, aluno.nome);
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