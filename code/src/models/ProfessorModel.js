const db = require('../config/database');

class ProfessorModel {
  static async criar(professor) {
    const { usuarioId, cpf, departamento, instituicaoEnsinoId } = professor;
    
    const [result] = await db.query(
      'INSERT INTO professores (usuario_id, cpf, departamento, instituicao_ensino_id) VALUES (?, ?, ?, ?)',
      [usuarioId, cpf, departamento, instituicaoEnsinoId]
    );
    
    return result.insertId;
  }
  
  static async buscarPorId(id) {
    const [professores] = await db.query(`
      SELECT p.*, u.nome, u.email 
      FROM professores p
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = ?
    `, [id]);
    
    return professores[0];
  }
  
  static async buscarPorUsuarioId(usuarioId) {
    const [professores] = await db.query(
      'SELECT * FROM professores WHERE usuario_id = ?',
      [usuarioId]
    );
    
    return professores[0];
  }
  
  static async buscarPorCPF(cpf) {
    const [professores] = await db.query(
      'SELECT * FROM professores WHERE cpf = ?',
      [cpf]
    );
    
    return professores[0];
  }
  
  static async listar() {
    const [professores] = await db.query(`
      SELECT p.*, u.nome, u.email, i.nome as instituicao_nome
      FROM professores p
      JOIN usuarios u ON p.usuario_id = u.id
      JOIN instituicoes_ensino i ON p.instituicao_ensino_id = i.id
    `);
    
    return professores;
  }
  
  static async atualizar(id, professor) {
    const { departamento, instituicaoEnsinoId } = professor;
    
    await db.query(
      'UPDATE professores SET departamento = ?, instituicao_ensino_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [departamento, instituicaoEnsinoId, id]
    );
  }
  
  static async excluir(id) {
    await db.query(
      'DELETE FROM professores WHERE id = ?',
      [id]
    );
  }
  
static async atualizarSaldo(id, diferenca) {
  await db.query(
    'UPDATE professores SET saldo = saldo + ? WHERE usuario_id = ?',
    [diferenca, id]
  );
}

static async listarIds() {
  const [professores] = await db.query(
    'SELECT id, usuario_id FROM professores'
  );
  return professores;
}

static async adicionarSaldo(id, valor) {
  await db.query(
    'UPDATE professores SET saldo = saldo + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [valor, id]
  );
}
}

module.exports = ProfessorModel;