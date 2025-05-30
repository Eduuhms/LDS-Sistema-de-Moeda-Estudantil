const UsuarioModel = require('../models/UsuarioModel');
const AlunoModel = require('../models/AlunoModel');
const ProfessorModel = require('../models/ProfessorModel');
const EmpresaModel = require('../models/EmpresaModel');
const InstituicaoEnsinoModel = require('../models/InstituicaoEnsinoModel');
const bcrypt = require('bcrypt');

class UsuarioController {
    static async login(req, res) {
        const { email, senha } = req.body;
        try {
            const usuario = await UsuarioModel.buscarPorEmail(email);
            if (!usuario) {
                return res.status(401).json({ erro: 'Credenciais inválidas' });
            }
            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) {
                return res.status(401).json({ erro: 'Credenciais inválidas' });
            }
            req.session.userId = usuario.id;
            res.json({ sucesso: true });
        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ erro: 'Erro ao processar login' });
        }
    }

    static async logout(req, res) {
        req.session.destroy();
        res.redirect('/usuario/login');
    }

    static async userData(req, res) {
        if (!req.session.userId) {
            return res.status(401).json({ erro: 'Não autorizado' });
        }
        try {
            const usuario = await UsuarioModel.buscarPorId(req.session.userId);
            if (!usuario) {
                return res.status(404).json({ erro: 'Usuário não encontrado' });
            }
            let userData = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo
            };
            if (usuario.tipo === 'aluno') {
                const aluno = await AlunoModel.buscarPorUsuarioId(usuario.id);
                const instituicao = await InstituicaoEnsinoModel.buscarPorId(aluno.instituicao_ensino_id);
                userData = {
                    ...userData,
                    cpf: aluno.cpf,
                    curso: aluno.curso,
                    saldo: aluno.saldo,
                    instituicao: instituicao?.nome
                };
            } else if (usuario.tipo === 'professor') {
                const professor = await ProfessorModel.buscarPorUsuarioId(usuario.id);
                const instituicao = await InstituicaoEnsinoModel.buscarPorId(professor.instituicao_ensino_id);
                userData = {
                    ...userData,
                    cpf: professor.cpf,
                    departamento: professor.departamento,
                    instituicao: instituicao?.nome,
                    saldo: professor.saldo
                };
            } else if (usuario.tipo === 'empresa') {
                const empresa = await EmpresaModel.buscarPorUsuarioId(usuario.id);
                userData = {
                    ...userData,
                    cnpj: empresa.cnpj,
                    endereco: empresa.endereco,
                    descricao: empresa.descricao
                };
            }
            res.json(userData);
        } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
            res.status(500).json({ erro: 'Erro ao buscar dados do usuário' });
        }
    }

    static renderTelaInicial(req, res) {
        if (!req.session.userId) {
            return res.redirect('/usuario/login');
        }
        res.render('telaInicial');
    }

    static renderCadastro(req, res) {
        res.render('cadastro');
    }

    static renderLogin(req, res) {
        if (req.session.userId) {
            return res.redirect('/');
        }
        res.render('login');
    }

    static renderEditarConta(req, res) {
        if (!req.session.userId) {
            return res.redirect('/usuario/login');
        }
        res.render('editarConta');
    }
}

module.exports = UsuarioController; 