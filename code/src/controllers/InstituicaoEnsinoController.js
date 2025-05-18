const InstituicaoEnsinoModel = require('../models/InstituicaoEnsinoModel');

class InstituicaoEnsinoController {
  static async exibirListagem(req, res) {
    try {
      const instituicoes = await InstituicaoEnsinoModel.listar();
      res.render('admin/instituicoes/listar', { instituicoes });
    } catch (error) {
      res.status(500).render('error', { 
        message: 'Erro ao carregar instituições de ensino', 
        error 
      });
    }
  }

  static async listar(req, res) {
    try {
      const instituicoes = await InstituicaoEnsinoModel.listar();
      return res.status(200).json(instituicoes);
    } catch (error) {
      return res.status(500).json({ 
        erro: 'Falha ao listar instituições de ensino. Por favor, tente novamente mais tarde.' 
      });
    }
  }

  static async cadastrar(req, res) {
    try {
      const { nome, endereco, cnpj, telefone } = req.body;
      
      if (!nome || !endereco || !cnpj) {
        return res.status(400).json({ 
          erro: 'Nome, endereço e CNPJ são campos obrigatórios',
          campos_faltantes: [
            !nome && 'nome',
            !endereco && 'endereço',
            !cnpj && 'cnpj'
          ].filter(Boolean)
        });
      }
      
      const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
      if (cnpjLimpo.length !== 14) {
        return res.status(400).json({ erro: 'CNPJ inválido. Um CNPJ válido deve conter 14 dígitos.' });
      }
      
      const instituicaoExistente = await InstituicaoEnsinoModel.buscarPorCnpj(cnpj);
      if (instituicaoExistente) {
        return res.status(400).json({ 
          erro: 'CNPJ já cadastrado. Já existe uma instituição com este CNPJ.',
          instituicao_existente: {
            id: instituicaoExistente.id,
            nome: instituicaoExistente.nome
          }
        });
      }
      
      const instituicaoId = await InstituicaoEnsinoModel.criar({
        nome,
        endereco,
        cnpj,
        telefone
      });
      
      const instituicao = await InstituicaoEnsinoModel.buscarPorId(instituicaoId);
      
      return res.status(201).json({
        mensagem: 'Instituição de ensino cadastrada com sucesso',
        instituicao
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ erro: 'Informação duplicada. Verifique os dados e tente novamente.' });
      }
      
      return res.status(500).json({ 
        erro: 'Falha ao cadastrar instituição de ensino. Por favor, tente novamente mais tarde.' 
      });
    }
  }

  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ erro: 'ID de instituição inválido' });
      }
      
      const instituicao = await InstituicaoEnsinoModel.buscarPorId(id);
      
      if (!instituicao) {
        return res.status(404).json({ erro: 'Instituição de ensino não encontrada. Verifique o ID informado.' });
      }
      
      return res.status(200).json(instituicao);
    } catch (error) {
      return res.status(500).json({ 
        erro: 'Falha ao buscar instituição de ensino. Por favor, tente novamente mais tarde.' 
      });
    }
  }
  
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, endereco, cnpj, telefone } = req.body;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ erro: 'ID de instituição inválido' });
      }
      
      if (!nome || !endereco || !cnpj) {
        return res.status(400).json({ 
          erro: 'Nome, endereço e CNPJ são campos obrigatórios',
          campos_faltantes: [
            !nome && 'nome',
            !endereco && 'endereço',
            !cnpj && 'cnpj'
          ].filter(Boolean)
        });
      }
      
      const instituicaoExistente = await InstituicaoEnsinoModel.buscarPorId(id);
      if (!instituicaoExistente) {
        return res.status(404).json({ 
          erro: 'Instituição de ensino não encontrada. Impossível atualizar uma instituição inexistente.' 
        });
      }
      
      if (cnpj !== instituicaoExistente.cnpj) {
        const cnpjExistente = await InstituicaoEnsinoModel.buscarPorCnpj(cnpj);
        if (cnpjExistente) {
          return res.status(400).json({ 
            erro: 'CNPJ já cadastrado para outra instituição. Cada instituição deve ter um CNPJ único.' 
          });
        }
      }
      
      await InstituicaoEnsinoModel.atualizar(id, {
        nome,
        endereco,
        cnpj,
        telefone
      });
      
      const instituicaoAtualizada = await InstituicaoEnsinoModel.buscarPorId(id);
      
      return res.status(200).json({
        mensagem: 'Instituição de ensino atualizada com sucesso',
        instituicao: instituicaoAtualizada
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ erro: 'Informação duplicada. Verifique os dados e tente novamente.' });
      }
      
      return res.status(500).json({ 
        erro: 'Falha ao atualizar instituição de ensino. Por favor, tente novamente mais tarde.' 
      });
    }
  }
  
  static async excluir(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ erro: 'ID de instituição inválido' });
      }
      
      const instituicaoExistente = await InstituicaoEnsinoModel.buscarPorId(id);
      if (!instituicaoExistente) {
        return res.status(404).json({ 
          erro: 'Instituição de ensino não encontrada. Impossível excluir uma instituição inexistente.' 
        });
      }
      
      await InstituicaoEnsinoModel.excluir(id);
      
      return res.status(200).json({
        mensagem: 'Instituição de ensino excluída com sucesso'
      });
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ 
          erro: 'Esta instituição não pode ser excluída porque existem alunos vinculados a ela.' +
                ' Transfira os alunos para outra instituição primeiro.'
        });
      }
      
      return res.status(500).json({ 
        erro: 'Falha ao excluir instituição de ensino. Por favor, tente novamente mais tarde.' 
      });
    }
  }
}

module.exports = InstituicaoEnsinoController; 