const UsuarioModel = require('../models/UsuarioModel');
const ProfessorModel = require('../models/ProfessorModel');
const InstituicaoEnsinoModel = require('../models/InstituicaoEnsinoModel');
const db = require('../config/database');

class ProfessorController {
  static async exibirFormulario(req, res) {
    res.render('professores/cadastro');
  }

  static async renderEnviarMoedas(req, res) {
    if (!req.session.userId) {
      return res.redirect('/usuario/login');
    }
    
    try {
      const usuario = await UsuarioModel.buscarPorId(req.session.userId);
      if (!usuario || usuario.tipo !== 'professor') {
        return res.status(403).render('error', { erro: 'Acesso negado. Apenas professores podem acessar esta página.' });
      }
      
      res.render('professor/enviar-moedas');
    } catch (error) {
      console.error('Erro ao renderizar página de envio de moedas:', error);
      res.status(500).render('error', { erro: 'Erro ao carregar página de envio de moedas' });
    }
  }

  static async listar(req, res) {
    try {
      const professores = await ProfessorModel.listar();
      return res.status(200).json(professores);
    } catch (error) {
      return res.status(500).json({ erro: 'Falha ao listar professores.' });
    }
  }

  static validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.length == 11;
  }

  static async cadastrar(req, res) {
    const { nome, email, senha, cpf, departamento, instituicaoEnsinoId } = req.body;
    
    try {
      if (!nome || !email || !senha || !cpf || !departamento || !instituicaoEnsinoId) {
        return res.status(400).json({ 
          erro: 'Todos os campos são obrigatórios',
          campos_faltantes: [
            !nome && 'nome',
            !email && 'email', 
            !senha && 'senha',
            !cpf && 'cpf',
            !departamento && 'departamento',
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
        return res.status(400).json({ erro: 'E-mail já cadastrado.' });
      }
      
      if (!ProfessorController.validarCPF(cpf)) {
        return res.status(400).json({ erro: 'CPF inválido.' });
      }
      
      const cpfLimpo = cpf.replace(/[^\d]/g, '');
      const professorComCPF = await ProfessorModel.buscarPorCPF(cpfLimpo);
      if (professorComCPF) {
        return res.status(400).json({ erro: 'CPF já cadastrado.' });
      }
      
      const instituicao = await InstituicaoEnsinoModel.buscarPorId(instituicaoEnsinoId);
      if (!instituicao) {
        return res.status(404).json({ erro: 'Instituição de ensino não encontrada.' });
      }
      
      const connection = await db.getConnection();
      await connection.beginTransaction();
      
      try {
        const usuarioId = await UsuarioModel.criar({
          nome,
          email,
          senha,
          tipo: 'professor'
        });
        
        const professorId = await ProfessorModel.criar({
          usuarioId,
          cpf: cpfLimpo,
          departamento,
          instituicaoEnsinoId
        });
        
        await connection.commit();
        
        const professor = await ProfessorModel.buscarPorId(professorId);
        
        return res.status(201).json({
          mensagem: 'Professor cadastrado com sucesso',
          professor
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ erro: 'Informação duplicada.' });
      }
      
      console.error('Erro no cadastro de professor:', error);
      return res.status(500).json({ erro: 'Erro ao cadastrar professor.' });
    }
  }

  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ erro: 'ID de professor inválido' });
      }
      
      const professor = await ProfessorModel.buscarPorId(id);
      
      if (!professor) {
        return res.status(404).json({ erro: 'Professor não encontrado.' });
      }
      
      return res.status(200).json(professor);
    } catch (error) {
      return res.status(500).json({ erro: 'Falha ao buscar professor.' });
    }
  }

  static async atualizar(req, res) {
    const { id } = req.params;
    const { nome, email, departamento, instituicaoEnsinoId } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ erro: 'ID de professor inválido' });
    }
    
    try {
      const professor = await ProfessorModel.buscarPorId(id);
      
      if (!professor) {
        return res.status(404).json({ erro: 'Professor não encontrado.' });
      }
      
      const usuarioId = professor.usuario_id;
      
      if (!nome || !email || !departamento || !instituicaoEnsinoId) {
        return res.status(400).json({ 
          erro: 'Todos os campos são obrigatórios',
          campos_faltantes: [
            !nome && 'nome',
            !email && 'email',
            !departamento && 'departamento',
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
        return res.status(404).json({ erro: 'Instituição de ensino não encontrada.' });
      }
      
      const connection = await db.getConnection();
      await connection.beginTransaction();
      
      try {
        await UsuarioModel.atualizar(usuarioId, { nome, email });
        
        await ProfessorModel.atualizar(id, {
          departamento,
          instituicaoEnsinoId
        });
        
        await connection.commit();
        
        const professorAtualizado = await ProfessorModel.buscarPorId(id);
        
        return res.status(200).json({
          mensagem: 'Professor atualizado com sucesso',
          professor: professorAtualizado
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Erro ao atualizar professor:', error);
      return res.status(500).json({ erro: 'Erro ao atualizar professor.' });
    }
  }

  static async excluir(req, res) {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ erro: 'ID de professor inválido' });
    }
    
    try {
      const professor = await ProfessorModel.buscarPorId(id);
      
      if (!professor) {
        return res.status(404).json({ erro: 'Professor não encontrado.' });
      }
      
      const usuarioId = professor.usuario_id;
      
      const connection = await db.getConnection();
      await connection.beginTransaction();
      
      try {
        await ProfessorModel.excluir(id);
        await UsuarioModel.excluir(usuarioId);
        
        await connection.commit();
        
        return res.status(200).json({
          mensagem: 'Professor excluído com sucesso'
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Erro ao excluir professor:', error);
      return res.status(500).json({ erro: 'Erro ao excluir professor.' });
    }
  }
  static async buscarPorUsuarioId(req, res) {
    try {
        const { usuarioId } = req.params;
        
        if (!usuarioId || isNaN(parseInt(usuarioId))) {
            return res.status(400).json({ erro: 'ID de usuário inválido' });
        }
        
        const professor = await ProfessorModel.buscarPorUsuarioId(usuarioId);
        
        if (!professor) {
            return res.status(404).json({ erro: 'Professor não encontrado para este usuário' });
        }
        
        return res.status(200).json(professor);
    } catch (error) {
        return res.status(500).json({ erro: 'Falha ao buscar professor. Por favor, tente novamente mais tarde.' });
    }
}

static async adicionarMoedasMensais(req, res) {
  try {
    // Verifica se o usuário é admin
    if (!req.session.userId || req.session.userType !== 'admin') {
      return res.status(403).json({ erro: 'Acesso negado. Apenas administradores podem executar esta ação.' });
    }

    const professores = await ProfessorModel.listarIds();
    
    // Para cada professor, adicionamos moedas e criamos a transação
    for (const professor of professores) {
      try {
        // Adiciona as moedas
        await ProfessorModel.atualizarSaldo(professor.id, 1000);
        
        // Cria a transação
        await TransacaoModel.criar({
          quantidade: 1000,
          mensagem: 'Recebimento semestral de moedas',
          origemId: 1, // ID da instituição
          destinoId: professor.usuario_id,
          tipoTransacao: TipoTransacaoEnum.RECEBIMENTO_SEMESTRAL
        });
      } catch (error) {
        console.error(`Erro ao processar professor ID ${professor.id}:`, error);
      }
    }
    
    return res.status(200).json({ 
      mensagem: `1000 moedas adicionadas a todos os professores com sucesso. Total: ${professores.length} professores.`
    });
  } catch (error) {
    console.error('Erro ao adicionar moedas mensais:', error);
    return res.status(500).json({ erro: 'Erro ao adicionar moedas mensais.' });
  }
}
}

module.exports = ProfessorController;