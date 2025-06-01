const express = require('express');
const path = require('path');
const session = require('express-session');
const UsuarioModel = require('./src/models/UsuarioModel');
const AlunoModel = require('./src/models/AlunoModel');
const ProfessorModel = require('./src/models/ProfessorModel');
const EmpresaModel = require('./src/models/EmpresaModel');
const InstituicaoEnsinoModel = require('./src/models/InstituicaoEnsinoModel');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET || 'sua_chave_secreta',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Defina como true se estiver usando HTTPS
}));

// Após todas as inicializações do servidor
if (process.env.NODE_ENV !== 'test') {
  const MoedasCron = require('./src/tasks/moedasCron');
  MoedasCron.init();
}

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');

// Rota página inicial
app.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/usuario/login');
  }
  res.render('telaInicial');
});

// Rota página de cadastro
app.get('/cadastro', (req, res) => {
  res.render('cadastro');
});

// Rota para edição de conta
app.get('/editar-conta', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('editarConta');
});

// app.get('/vantagens-empresa', async (req, res) => {
//   if (!req.session.userId) {
//     return res.redirect('/login');
//   }
  
//   try {
//     // Verifica se o usuário é uma empresa
//     const usuario = await UsuarioModel.buscarPorId(req.session.userId);
    
//     if (!usuario || usuario.tipo !== 'empresa') {
//       return res.status(403).render('error', { 
//         erro: 'Acesso negado. Apenas empresas podem acessar esta página.' 
//       });
//     }
    
//     res.render('vantagens-empresa');
//   } catch (error) {
//     console.error('Erro ao verificar usuário:', error);
//     res.status(500).render('error', { 
//       erro: 'Erro interno do servidor' 
//     });
//   }
// });

// // Rota para visualizar vantagens (apenas alunos)
// app.get('/vantagens-aluno', async (req, res) => {
//   if (!req.session.userId) {
//     return res.redirect('/login');
//   }
  
//   try {
//     // Verifica se o usuário é um aluno
//     const usuario = await UsuarioModel.buscarPorId(req.session.userId);
    
//     if (!usuario || usuario.tipo !== 'aluno') {
//       return res.status(403).render('error', { 
//         erro: 'Acesso negado. Apenas alunos podem acessar esta página.' 
//       });
//     }
    
//     res.render('vantagens-aluno');
//   } catch (error) {
//     console.error('Erro ao verificar usuário:', error);
//     res.status(500).render('error', { 
//       erro: 'Erro interno do servidor' 
//     });
//   }
// });

// Rotas
const alunoRoutes = require('./src/routes/alunoRoute');
const instituicaoEnsinoRoutes = require('./src/routes/instituicaoEnsinoRoutes');
const empresaRoutes = require('./src/routes/empresaRoutes');
const vantagemRoutes = require('./src/routes/vantagemRoute');
const professorRoutes = require('./src/routes/professorRoute');
const usuarioRoutes = require('./src/routes/usuarioRoute');
const transacaoRoutes = require('./src/routes/transacaoRoute');

app.use('/alunos', alunoRoutes);
app.use('/instituicoes', instituicaoEnsinoRoutes);
app.use('/empresas', empresaRoutes);
app.use('/vantagens', vantagemRoutes);
app.use('/professores', professorRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/transacoes', transacaoRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

module.exports = app;