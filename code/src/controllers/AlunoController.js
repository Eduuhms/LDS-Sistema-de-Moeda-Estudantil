const UsuarioModel = require('../models/UsuarioModel');
const AlunoModel = require('../models/AlunoModel');
const InstituicaoEnsinoModel = require('../models/InstituicaoEnsinoModel');
const db = require('../config/database');

class AlunoController {
  static async exibirFormulario(req, res) {
    res.render('alunos/cadastro');
  }

  static async listar(req, res) {
    try {
      const alunos = await AlunoModel.listar();
      return res.status(200).json(alunos);
    } catch (error) {
      return res.status(500).json({ erro: 'Falha ao listar alunos. Por favor, tente novamente mais tarde.' });
    }
  }

  static validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.length == 11;
  }

  static validarRG(rg) {
    rg = rg.replace(/[^\w]/g, '');
    if (rg.length < 5 || rg.length > 14) {
      return false;
    }
    
    return true;
  }

  static async cadastrar(req, res) {
    const { nome, email, senha, cpf, rg, endereco, curso, instituicaoEnsinoId } = req.body;
    
    try {
      if (!nome || !email || !senha || !cpf || !rg || !endereco || !curso || !instituicaoEnsinoId) {
        return res.status(400).json({ 
          erro: 'Todos os campos são obrigatórios',
          campos_faltantes: [
            !nome && 'nome',
            !email && 'email', 
            !senha && 'senha',
            !cpf && 'cpf',
            !rg && 'rg',
            !endereco && 'endereco',
            !curso && 'curso',
            !instituicaoEnsinoId && 'instituição de ensino'
          ].filter(Boolean)
        });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ erro: 'Formato de e-mail inválido' });
      }
      
      const usuarioExistente = await UsuarioModel.buscarPorEmail(email);
      if (usuarioExistente) {
        return res.status(400).json({ erro: 'E-mail já cadastrado. Por favor, utilize outro e-mail ou recupere sua senha.' });
      }
      
      if (!AlunoController.validarCPF(cpf)) {
        return res.status(400).json({ erro: 'CPF inválido. Por favor, informe um CPF válido.' });
      }
      
      if (!AlunoController.validarRG(rg)) {
        return res.status(400).json({ erro: 'RG inválido. O RG deve ter entre 5 e 14 caracteres.' });
      }
      
      const cpfLimpo = cpf.replace(/[^\d]/g, '');
      const alunoComCPF = await AlunoModel.buscarPorCPF(cpfLimpo);
      if (alunoComCPF) {
        return res.status(400).json({ erro: 'CPF já cadastrado. Cada aluno deve ter um CPF único.' });
      }
      
      const rgLimpo = rg.replace(/[^\w]/g, '');
      const alunoComRG = await AlunoModel.buscarPorRG(rgLimpo);
      if (alunoComRG) {
        return res.status(400).json({ erro: 'RG já cadastrado. Cada aluno deve ter um RG único.' });
      }
      
      const instituicao = await InstituicaoEnsinoModel.buscarPorId(instituicaoEnsinoId);
      if (!instituicao) {
        return res.status(404).json({ 
          erro: 'Instituição de ensino não encontrada. Por favor, selecione uma instituição válida.' 
        });
      }
      
      const connection = await db.getConnection();
      await connection.beginTransaction();
      
      try {
        const usuarioId = await UsuarioModel.criar({
          nome,
          email,
          senha,
          tipo: 'aluno'
        });
        
        const alunoId = await AlunoModel.criar({
          usuarioId: usuarioId,
          cpf: cpfLimpo,
          rg: rgLimpo,
          endereco,
          curso,
          instituicaoEnsinoId
        });
        
        await connection.commit();
        
        const aluno = await AlunoModel.buscarPorId(alunoId);
        
        return res.status(201).json({
          mensagem: 'Aluno cadastrado com sucesso',
          aluno
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('cpf')) {
          return res.status(400).json({ erro: 'CPF já cadastrado. Cada aluno deve ter um CPF único.' });
        }
        if (error.message.includes('rg')) {
          return res.status(400).json({ erro: 'RG já cadastrado. Cada aluno deve ter um RG único.' });
        }
        return res.status(400).json({ erro: 'Informação duplicada. Verifique seus dados e tente novamente.' });
      }
      
      console.error('Erro no cadastro de aluno:', error);
      return res.status(500).json({ erro: 'Erro ao cadastrar aluno. Por favor, tente novamente mais tarde.' });
    }
  }

  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ erro: 'ID de aluno inválido' });
      }
      
      const aluno = await AlunoModel.buscarPorId(id);
      
      if (!aluno) {
        return res.status(404).json({ erro: 'Aluno não encontrado. Verifique o ID informado.' });
      }
      
      return res.status(200).json(aluno);
    } catch (error) {
      return res.status(500).json({ erro: 'Falha ao buscar aluno. Por favor, tente novamente mais tarde.' });
    }
  }

  static async atualizar(req, res) {
    const { id } = req.params;
    const { nome, email, endereco, curso, instituicaoEnsinoId } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ erro: 'ID de aluno inválido' });
    }
    
    try {
      const aluno = await AlunoModel.buscarPorId(id);
      
      if (!aluno) {
        return res.status(404).json({ erro: 'Aluno não encontrado. Verifique o ID informado.' });
      }
      
      const usuarioId = aluno.usuario_id;
      
      if (!nome || !email || !endereco || !curso || !instituicaoEnsinoId) {
        return res.status(400).json({ 
          erro: 'Todos os campos são obrigatórios',
          campos_faltantes: [
            !nome && 'nome',
            !email && 'email',
            !endereco && 'endereco',
            !curso && 'curso',
            !instituicaoEnsinoId && 'instituição de ensino'
          ].filter(Boolean)
        });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ erro: 'Formato de e-mail inválido' });
      }
      
      const usuarioExistente = await UsuarioModel.buscarPorEmail(email);
      if (usuarioExistente && usuarioExistente.id !== usuarioId) {
        return res.status(400).json({ erro: 'E-mail já cadastrado para outro usuário.' });
      }
      
      const instituicao = await InstituicaoEnsinoModel.buscarPorId(instituicaoEnsinoId);
      if (!instituicao) {
        return res.status(404).json({ 
          erro: 'Instituição de ensino não encontrada. Por favor, selecione uma instituição válida.' 
        });
      }
      
      const connection = await db.getConnection();
      await connection.beginTransaction();
      
      try {
        await UsuarioModel.atualizar(usuarioId, {
          nome,
          email
        });
        
        await AlunoModel.atualizar(id, {
          endereco,
          curso,
          instituicaoEnsinoId
        });
        
        await connection.commit();
        
        const alunoAtualizado = await AlunoModel.buscarPorId(id);
        
        return res.status(200).json({
          mensagem: 'Aluno atualizado com sucesso',
          aluno: alunoAtualizado
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      return res.status(500).json({ erro: 'Erro ao atualizar aluno. Por favor, tente novamente mais tarde.' });
    }
  }

  static async excluir(req, res) {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ erro: 'ID de aluno inválido' });
    }
    
    try {
      const aluno = await AlunoModel.buscarPorId(id);
      
      if (!aluno) {
        return res.status(404).json({ erro: 'Aluno não encontrado. Verifique o ID informado.' });
      }
      
      const usuarioId = aluno.usuario_id;
      
      const connection = await db.getConnection();
      await connection.beginTransaction();
      
      try {
        await AlunoModel.excluir(id);
        await UsuarioModel.excluir(usuarioId);
        
        await connection.commit();
        
        return res.status(200).json({
          mensagem: 'Aluno excluído com sucesso'
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Erro ao excluir aluno:', error);
      return res.status(500).json({ erro: 'Erro ao excluir aluno. Por favor, tente novamente mais tarde.' });
    }
  }
  static async buscarPorUsuarioId(req, res) {
    try {
        const { usuarioId } = req.params;
        
        if (!usuarioId || isNaN(parseInt(usuarioId))) {
            return res.status(400).json({ erro: 'ID de usuário inválido' });
        }
        
        const aluno = await AlunoModel.buscarPorUsuarioId(usuarioId);
        
        if (!aluno) {
            return res.status(404).json({ erro: 'Aluno não encontrado para este usuário' });
        }
        
        return res.status(200).json(aluno);
    } catch (error) {
        return res.status(500).json({ erro: 'Falha ao buscar aluno. Por favor, tente novamente mais tarde.' });
    }
}

}

module.exports = AlunoController;