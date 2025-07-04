const db = require('../config/database');
const bcrypt = require('bcrypt');
const ProfessorModel = require('./ProfessorModel');
const AlunoModel = require('./AlunoModel');

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

  static async atualizar(id, usuario) {
    const { nome, email, senha } = usuario;

    if (senha) {
      const senhaCriptografada = await bcrypt.hash(senha, 10);
      await db.query(
        'UPDATE usuarios SET nome = ?, email = ?, senha = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [nome, email, senhaCriptografada, id]
      );
    } else {
      await db.query(
        'UPDATE usuarios SET nome = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [nome, email, id]
      );
    }
  }

  static async excluir(id) {
    await db.query(
      'DELETE FROM usuarios WHERE id = ?',
      [id]
    );
  }

  static async buscarDadosUsuario(usuario) {
    if (usuario.tipo === 'professor') {
      return await ProfessorModel.buscarPorUsuarioId(usuario.id);
    } else if (usuario.tipo === 'aluno') {
      return await AlunoModel.buscarPorUsuarioId(usuario.id);
    }
    return null;
  }

  static async atualizarSaldoUsuario(usuario, novoSaldo) {
    if (usuario.tipo === 'professor') {
      await ProfessorModel.atualizarSaldo(usuario.id, novoSaldo);
    } else if (usuario.tipo === 'aluno') {
      await AlunoModel.atualizarSaldo(usuario.id, novoSaldo);
    }
  }
}

module.exports = UsuarioModel;