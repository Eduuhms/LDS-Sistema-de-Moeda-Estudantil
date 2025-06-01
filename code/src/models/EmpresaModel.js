const db = require('../config/database');
const UsuarioModel = require('./UsuarioModel');
const bcrypt = require('bcrypt');

class EmpresaModel extends UsuarioModel {
  static async criar(empresa) {
    const { nome, cnpj, endereco, telefone, email, senha, descricao } = empresa;
    
    const usuarioId = await UsuarioModel.criar({
      nome, 
      email, 
      senha,
      tipo: 'empresa'
    });
    
    const [result] = await db.query(
      'INSERT INTO empresas (usuario_id, cnpj, endereco, telefone, email, descricao) VALUES (?, ?, ?, ?, ?, ?)',
      [usuarioId, cnpj, endereco, telefone, email, descricao]
    );
    
    const [empresa_criada] = await db.query('SELECT id FROM empresas WHERE usuario_id = ?', [usuarioId]);
    return empresa_criada[0].id;
  }
  
  static async buscarPorId(id) {
    const [empresas] = await db.query(
      'SELECT * FROM empresas WHERE id = ?',
      [id]
    );
    
    if (empresas.length === 0) {
      return null;
    }
    
    const usuario = await UsuarioModel.buscarPorId(empresas[0].usuario_id);
    
    if (!usuario) {
      return null;
    }
    
    return {
      id: empresas[0].id,
      usuario_id: empresas[0].usuario_id,
      nome: usuario.nome,
      email: usuario.email,
      cnpj: empresas[0].cnpj,
      endereco: empresas[0].endereco,
      telefone: empresas[0].telefone,
      descricao: empresas[0].descricao
    };
  }

  static async buscarPorUsuarioId(usuarioId) {
  const [empresas] = await db.query(
    'SELECT * FROM empresas WHERE usuario_id = ?',
    [usuarioId]
  );
  
  if (empresas.length === 0) {
    return null;
  }
  
  return empresas[0];
}

  
  static async buscarPorCnpj(cnpj) {
    const [empresas] = await db.query(
      'SELECT * FROM empresas WHERE cnpj = ?',
      [cnpj]
    );
    
    if (empresas.length === 0) {
      return null;
    }
    
    const usuario = await UsuarioModel.buscarPorId(empresas[0].usuario_id);
    
    if (!usuario) {
      return null;
    }
    
    return {
      id: empresas[0].id,
      usuario_id: empresas[0].usuario_id,
      nome: usuario.nome,
      email: usuario.email,
      cnpj: empresas[0].cnpj,
      endereco: empresas[0].endereco,
      telefone: empresas[0].telefone,
      descricao: empresas[0].descricao
    };
  }
  
  static async listar() {
    const [empresas] = await db.query(`
      SELECT e.id, e.usuario_id, u.nome, u.email, e.cnpj, e.endereco, e.telefone, e.descricao 
      FROM empresas e
      JOIN usuarios u ON e.usuario_id = u.id
      ORDER BY u.nome
    `);
    
    return empresas;
  }
  
  static async atualizar(id, empresa) {
    const { nome, email, senha, cnpj, endereco, telefone, descricao } = empresa;
    
    const [empresaExistente] = await db.query('SELECT usuario_id FROM empresas WHERE id = ?', [id]);
    
    if (empresaExistente.length === 0) {
      throw new Error('Empresa não encontrada');
    }
    
    const usuarioId = empresaExistente[0].usuario_id;
    
    await UsuarioModel.atualizar(usuarioId, { nome, email, senha });

    await db.query(
      'UPDATE empresas SET cnpj = ?, endereco = ?, telefone = ?, email = ?, descricao = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [cnpj, endereco, telefone, email, descricao, id]
    );
  }
  
  static async excluir(id) {
    const [empresaExistente] = await db.query('SELECT usuario_id FROM empresas WHERE id = ?', [id]);
    
    if (empresaExistente.length === 0) {
      throw new Error('Empresa não encontrada');
    }
    
    const usuarioId = empresaExistente[0].usuario_id;
    
    await UsuarioModel.excluir(usuarioId);
  }
  
  static async cadastrarVantagem(vantagem) {
    // Implementação a ser feita
  }
  
  static async editarVantagem(vantagem) {
    // Implementação a ser feita
  }
  
  static async removerVantagem(vantagem) {
    // Implementação a ser feita
  }
  
  static async listarVantagens(empresaId) {
    // Implementação a ser feita
  }
}

module.exports = EmpresaModel; 