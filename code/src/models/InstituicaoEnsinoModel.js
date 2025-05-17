const db = require('../config/database');

class InstituicaoEnsinoModel {
  static async criar(instituicao) {
    const { nome, endereco, cnpj, telefone } = instituicao;
    
    const [result] = await db.query(
      'INSERT INTO instituicoes_ensino (nome, endereco, cnpj, telefone) VALUES (?, ?, ?, ?)',
      [nome, endereco, cnpj, telefone]
    );
    
    return result.insertId;
  }
  
  static async buscarPorId(id) {
    const [instituicoes] = await db.query(
      'SELECT * FROM instituicoes_ensino WHERE id = ?',
      [id]
    );
    
    return instituicoes[0];
  }
  
  static async buscarPorCnpj(cnpj) {
    const [instituicoes] = await db.query(
      'SELECT * FROM instituicoes_ensino WHERE cnpj = ?',
      [cnpj]
    );
    
    return instituicoes[0];
  }
  
  static async listar() {
    const [instituicoes] = await db.query(
      'SELECT * FROM instituicoes_ensino ORDER BY nome'
    );
    
    return instituicoes;
  }
  
  static async atualizar(id, instituicao) {
    const { nome, endereco, cnpj, telefone } = instituicao;
    
    await db.query(
      'UPDATE instituicoes_ensino SET nome = ?, endereco = ?, cnpj = ?, telefone = ? WHERE id = ?',
      [nome, endereco, cnpj, telefone, id]
    );
  }
  
  static async excluir(id) {
    await db.query(
      'DELETE FROM instituicoes_ensino WHERE id = ?',
      [id]
    );
  }
}

module.exports = InstituicaoEnsinoModel; 