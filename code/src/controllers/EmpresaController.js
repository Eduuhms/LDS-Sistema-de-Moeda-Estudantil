const EmpresaModel = require('../models/EmpresaModel');

class EmpresaController {
  static async listar(req, res) {
    try {
      const empresas = await EmpresaModel.listar();
      return res.status(200).json(empresas);
    } catch (error) {
      console.error('Erro ao listar empresas:', error);
      return res.status(500).json({ 
        erro: 'Falha ao listar empresas. Por favor, tente novamente mais tarde.' 
      });
    }
  }

  static async cadastrar(req, res) {
    try {
      const { nome, cnpj, endereco, telefone, email, senha, descricao } = req.body;
      
      if (!nome || !cnpj || !endereco || !email || !senha) {
        return res.status(400).json({ 
          erro: 'Nome, CNPJ, endereço, e-mail e senha são campos obrigatórios',
          campos_faltantes: [
            !nome && 'nome',
            !cnpj && 'cnpj',
            !endereco && 'endereço',
            !email && 'e-mail',
            !senha && 'senha'
          ].filter(Boolean)
        });
      }
      
      const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
      if (cnpjLimpo.length !== 14) {
        return res.status(400).json({ erro: 'CNPJ inválido. Um CNPJ válido deve conter 14 dígitos.' });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ erro: 'Formato de e-mail inválido' });
      }
      
      const empresaExistente = await EmpresaModel.buscarPorCnpj(cnpj);
      if (empresaExistente) {
        return res.status(400).json({ 
          erro: 'CNPJ já cadastrado. Já existe uma empresa com este CNPJ.',
          empresa_existente: {
            id: empresaExistente.id,
            nome: empresaExistente.nome
          }
        });
      }
      
      // Verifica se já existe um usuário com este e-mail
      const usuarioExistente = await EmpresaModel.buscarPorEmail(email);
      if (usuarioExistente) {
        return res.status(400).json({ 
          erro: 'E-mail já cadastrado. Já existe um usuário com este e-mail.' 
        });
      }
      
      const empresaId = await EmpresaModel.criar({
        nome,
        cnpj,
        endereco,
        telefone,
        email,
        senha,
        descricao
      });
      
      const empresa = await EmpresaModel.buscarPorId(empresaId);
      
      return res.status(201).json({
        mensagem: 'Empresa cadastrada com sucesso',
        empresa: {
          id: empresa.id,
          nome: empresa.nome,
          email: empresa.email,
          cnpj: empresa.cnpj,
          endereco: empresa.endereco,
          telefone: empresa.telefone,
          descricao: empresa.descricao
        }
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ erro: 'Informação duplicada. Verifique os dados e tente novamente.' });
      }
      
      console.error('Erro ao cadastrar empresa:', error);
      return res.status(500).json({ 
        erro: 'Falha ao cadastrar empresa. Por favor, tente novamente mais tarde.' 
      });
    }
  }

  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ erro: 'ID de empresa inválido' });
      }
      
      const empresa = await EmpresaModel.buscarPorId(id);
      
      if (!empresa) {
        return res.status(404).json({ erro: 'Empresa não encontrada. Verifique o ID informado.' });
      }
      
      return res.status(200).json({
        id: empresa.id,
        nome: empresa.nome,
        email: empresa.email,
        cnpj: empresa.cnpj,
        endereco: empresa.endereco,
        telefone: empresa.telefone,
        descricao: empresa.descricao
      });
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      return res.status(500).json({ 
        erro: 'Falha ao buscar empresa. Por favor, tente novamente mais tarde.' 
      });
    }
  }
  
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, cnpj, endereco, telefone, email, senha, descricao } = req.body;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ erro: 'ID de empresa inválido' });
      }
      
      if (!nome || !cnpj || !endereco || !email) {
        return res.status(400).json({ 
          erro: 'Nome, CNPJ, endereço e e-mail são campos obrigatórios',
          campos_faltantes: [
            !nome && 'nome',
            !cnpj && 'cnpj',
            !endereco && 'endereço',
            !email && 'e-mail'
          ].filter(Boolean)
        });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ erro: 'Formato de e-mail inválido' });
      }
      
      const empresaExistente = await EmpresaModel.buscarPorId(id);
      if (!empresaExistente) {
        return res.status(404).json({ 
          erro: 'Empresa não encontrada. Impossível atualizar uma empresa inexistente.' 
        });
      }
      
      if (cnpj !== empresaExistente.cnpj) {
        const cnpjExistente = await EmpresaModel.buscarPorCnpj(cnpj);
        if (cnpjExistente && cnpjExistente.id !== parseInt(id)) {
          return res.status(400).json({ 
            erro: 'CNPJ já cadastrado para outra empresa. Cada empresa deve ter um CNPJ único.' 
          });
        }
      }
      
      if (email !== empresaExistente.email) {
        const emailExistente = await EmpresaModel.buscarPorEmail(email);
        if (emailExistente && emailExistente.id !== empresaExistente.usuario_id) {
          return res.status(400).json({ 
            erro: 'E-mail já cadastrado para outro usuário. Cada usuário deve ter um e-mail único.' 
          });
        }
      }
      
      await EmpresaModel.atualizar(id, {
        nome,
        email,
        senha,
        cnpj,
        endereco,
        telefone,
        descricao
      });
      
      const empresaAtualizada = await EmpresaModel.buscarPorId(id);
      
      return res.status(200).json({
        mensagem: 'Empresa atualizada com sucesso',
        empresa: {
          id: empresaAtualizada.id,
          nome: empresaAtualizada.nome,
          email: empresaAtualizada.email,
          cnpj: empresaAtualizada.cnpj,
          endereco: empresaAtualizada.endereco,
          telefone: empresaAtualizada.telefone,
          descricao: empresaAtualizada.descricao
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      return res.status(500).json({ 
        erro: 'Falha ao atualizar empresa. Por favor, tente novamente mais tarde.' 
      });
    }
  }
  
  static async excluir(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ erro: 'ID de empresa inválido' });
      }
      
      const empresa = await EmpresaModel.buscarPorId(id);
      
      if (!empresa) {
        return res.status(404).json({ 
          erro: 'Empresa não encontrada. Impossível excluir uma empresa inexistente.' 
        });
      }
      
      await EmpresaModel.excluir(id);
      
      return res.status(200).json({
        mensagem: 'Empresa excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      return res.status(500).json({ 
        erro: 'Falha ao excluir empresa. Por favor, tente novamente mais tarde.' 
      });
    }
  }
}

module.exports = EmpresaController; 