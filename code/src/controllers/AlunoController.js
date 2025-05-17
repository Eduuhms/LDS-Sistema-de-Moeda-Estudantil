const UsuarioModel = require('../models/UsuarioModel');
const AlunoModel = require('../models/AlunoModel');
const db = require('../config/database');

class AlunoController {
  // Renderiza o formulário de cadastro
  static async exibirFormulario(req, res) {
    res.render('alunos/cadastro');
  }

  // Lista todos os alunos
  static async listar(req, res) {
    try {
      const alunos = await AlunoModel.listar();
      return res.status(200).json(alunos);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  }

  // Criar novo aluno
  static async cadastrar(req, res) {
    // Usamos transação manual para garantir consistência
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { nome, email, senha, cpf, rg, endereco, curso, instituicaoEnsinoId } = req.body;
      
      // Verificar se e-mail já existe
      const usuarioExistente = await UsuarioModel.buscarPorEmail(email);
      if (usuarioExistente) {
        return res.status(400).json({ erro: 'E-mail já cadastrado' });
      }
      
      // Criar o usuário primeiro
      const usuarioId = await UsuarioModel.criar({
        nome,
        email,
        senha,
        tipo: 'aluno'
      });
      
      // Criar o aluno associado ao usuário
      const alunoId = await AlunoModel.criar({
        usuarioId: usuarioId,
        cpf,
        rg,
        endereco,
        curso,
        instituicaoEnsinoId
      });
      
      await connection.commit();
      
      // Buscar o aluno completo para retornar
      const aluno = await AlunoModel.buscarPorId(alunoId);
      
      return res.status(201).json({
        mensagem: 'Aluno cadastrado com sucesso',
        aluno
      });
    } catch (error) {
      await connection.rollback();
      return res.status(400).json({ erro: error.message });
    } finally {
      connection.release();
    }
  }

  // Buscar um aluno por ID
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      
      const aluno = await AlunoModel.buscarPorId(id);
      
      if (!aluno) {
        return res.status(404).json({ erro: 'Aluno não encontrado' });
      }
      
      return res.status(200).json(aluno);
    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  }
}

module.exports = AlunoController;