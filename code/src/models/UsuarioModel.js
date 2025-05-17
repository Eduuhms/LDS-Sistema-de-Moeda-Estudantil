const db = require('../config/database');
const bcrypt = require('bcrypt');

class UsuarioModel {
  static async criar(usuario) {
    const { nome, email, senha, tipo = 'aluno' } = usuario;
    
    // Hash da senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    
    const [result] = await db.query(
      'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
      [nome, email, senhaCriptografada, tipo]
    );
    
    return result.insertId;
  }
  
  static async buscarPorId(id) {
    const [usuarios] = await db.query('SELECT id, nome, email, tipo FROM usuarios WHERE id = ?', [id]);
    return usuarios[0];
  }
  
  static async buscarPorEmail(email) {
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return usuarios[0];
  }
  
  static async listar() {
    const [usuarios] = await db.query('SELECT id, nome, email, tipo FROM usuarios');
    return usuarios;
  }
}

module.exports = UsuarioModel;