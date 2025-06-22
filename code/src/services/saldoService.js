const UsuarioModel = require('../models/UsuarioModel');
const AlunoModel = require('../models/AlunoModel');
const ProfessorModel = require('../models/ProfessorModel');

class SaldoService {
  static async atualizarSaldo(usuarioId, diferenca) {
    const usuario = await UsuarioModel.buscarPorId(usuarioId);
    
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }
    
    if (usuario.tipo === 'aluno') {
      await AlunoModel.atualizarSaldo(usuarioId, diferenca);
    } 
    else if (usuario.tipo === 'professor') {
      await ProfessorModel.atualizarSaldo(usuarioId, diferenca);
    }
  }
}

module.exports = SaldoService;