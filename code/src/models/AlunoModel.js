const db = require('../config/database');

class AlunoModel {
  static async criar(aluno) {
    const { usuarioId, cpf, rg, endereco, curso, instituicaoEnsinoId } = aluno;
    
    const [result] = await db.query(
      'INSERT INTO alunos (usuario_id, cpf, rg, endereco, curso, instituicao_ensino_id) VALUES (?, ?, ?, ?, ?, ?)',
      [usuarioId, cpf, rg, endereco, curso, instituicaoEnsinoId]
    );
    
    return result.insertId;
  }
  
  static async buscarPorId(id) {
    const [alunos] = await db.query(`
      SELECT a.*, u.nome, u.email 
      FROM alunos a
      JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.id = ?
    `, [id]);
    
    return alunos[0];
  }
  
  static async buscarPorUsuarioId(usuarioId) {
    const [alunos] = await db.query(
      'SELECT * FROM alunos WHERE usuario_id = ?',
      [usuarioId]
    );
    
    return alunos[0];
  }
  
  static async listar() {
    const [alunos] = await db.query(`
      SELECT a.*, u.nome, u.email 
      FROM alunos a
      JOIN usuarios u ON a.usuario_id = u.id
    `);
    
    return alunos;
  }
  
  static async atualizarSaldo(id, novoSaldo) {
    await db.query(
      'UPDATE alunos SET saldo = ? WHERE id = ?',
      [novoSaldo, id]
    );
  }
}

module.exports = AlunoModel;