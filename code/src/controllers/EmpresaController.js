const EmpresaModel = require('../models/EmpresaModel');

class EmpresaController {
  // Renderiza a página de cadastro
  static async exibirFormulario(req, res) {
    res.render('empresas/cadastro');
  }

  // Lista todas as empresas (para API)
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

  // Cadastra uma nova empresa
  static async cadastrar(req, res) {
    try {
      const { nome, cnpj, endereco, telefone, email, senha, descricao } = req.body;
      
      // Validações básicas
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
      
      // Validação do CNPJ (apenas quantidade de dígitos)
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      if (cnpjLimpo.length !== 14) {
        return res.status(400).json({ erro: 'CNPJ inválido. Deve conter 14 dígitos.' });
      }
      
      // Validação de e-mail
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ erro: 'Formato de e-mail inválido' });
      }
      
      // Verifica se CNPJ já existe
      const empresaExistente = await EmpresaModel.buscarPorCnpj(cnpjLimpo);
      if (empresaExistente) {
        return res.status(400).json({ 
          erro: 'CNPJ já cadastrado. Já existe uma empresa com este CNPJ.',
          empresa_existente: {
            id: empresaExistente.id,
            nome: empresaExistente.nome
          }
        });
      }
      
      // Verifica se e-mail já existe
      const usuarioExistente = await EmpresaModel.buscarPorEmail(email);
      if (usuarioExistente) {
        return res.status(400).json({ 
          erro: 'E-mail já cadastrado. Já existe um usuário com este e-mail.' 
        });
      }
      
      // Cria a empresa
      const empresaId = await EmpresaModel.criar({
        nome,
        cnpj: cnpjLimpo,
        endereco,
        telefone: telefone ? telefone.replace(/\D/g, '') : null,
        email,
        senha,
        descricao
      });
      
      // Busca os dados da empresa criada
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

  // Busca uma empresa por ID
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

  // Busca a empresa do usuário logado
  static async buscarPorUsuario(req, res) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ erro: 'Usuário não autenticado' });
      }
      
      const empresa = await EmpresaModel.buscarPorUsuarioId(req.session.userId);
      
      if (!empresa) {
        return res.status(404).json({ erro: 'Empresa não encontrada para este usuário' });
      }
      
      return res.status(200).json({
        id: empresa.id,
        usuario_id: empresa.usuario_id,
        cnpj: empresa.cnpj,
        endereco: empresa.endereco,
        telefone: empresa.telefone,
        descricao: empresa.descricao
      });
    } catch (error) {
      console.error('Erro ao buscar empresa do usuário:', error);
      return res.status(500).json({ 
        erro: 'Falha ao buscar empresa. Por favor, tente novamente mais tarde.' 
      });
    }
  }
  
  // Atualiza uma empresa
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, cnpj, endereco, telefone, email, senha, descricao } = req.body;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ erro: 'ID de empresa inválido' });
      }
      
      // Validações básicas
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
      
      // Validação de e-mail
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ erro: 'Formato de e-mail inválido' });
      }
      
      // Busca a empresa existente
      const empresaExistente = await EmpresaModel.buscarPorId(id);
      if (!empresaExistente) {
        return res.status(404).json({ 
          erro: 'Empresa não encontrada. Impossível atualizar uma empresa inexistente.' 
        });
      }
      
      // Valida se CNPJ foi alterado e se já existe
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      if (cnpjLimpo !== empresaExistente.cnpj) {
        const cnpjExistente = await EmpresaModel.buscarPorCnpj(cnpjLimpo);
        if (cnpjExistente && cnpjExistente.id !== parseInt(id)) {
          return res.status(400).json({ 
            erro: 'CNPJ já cadastrado para outra empresa. Cada empresa deve ter um CNPJ único.' 
          });
        }
      }
      
      // Valida se e-mail foi alterado e se já existe
      if (email !== empresaExistente.email) {
        const emailExistente = await EmpresaModel.buscarPorEmail(email);
        if (emailExistente && emailExistente.id !== empresaExistente.usuario_id) {
          return res.status(400).json({ 
            erro: 'E-mail já cadastrado para outro usuário. Cada usuário deve ter um e-mail único.' 
          });
        }
      }
      
      // Atualiza a empresa
      await EmpresaModel.atualizar(id, {
        nome,
        email,
        senha,
        cnpj: cnpjLimpo,
        endereco,
        telefone: telefone ? telefone.replace(/\D/g, '') : null,
        descricao
      });
      
      // Busca os dados atualizados
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
  
  // Exclui uma empresa
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
  static async buscarPorUsuarioId(req, res) {
    try {
        const { usuarioId } = req.params;
        
        if (!usuarioId || isNaN(parseInt(usuarioId))) {
            return res.status(400).json({ erro: 'ID de usuário inválido' });
        }
        
        const empresa = await EmpresaModel.buscarPorUsuarioId(usuarioId);
        
        if (!empresa) {
            return res.status(404).json({ erro: 'Empresa não encontrada para este usuário' });
        }
        
        return res.status(200).json({
            id: empresa.id,
            usuario_id: empresa.usuario_id,
            cnpj: empresa.cnpj,
            endereco: empresa.endereco,
            telefone: empresa.telefone,
            descricao: empresa.descricao
        });
    } catch (error) {
        console.error('Erro ao buscar empresa do usuário:', error);
        return res.status(500).json({ 
            erro: 'Falha ao buscar empresa. Por favor, tente novamente mais tarde.' 
        });
    }
}
}



module.exports = EmpresaController;