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
    return res.redirect('/login');
  }
  res.render('telaInicial');
});

// Rota página de cadastro
app.get('/cadastro', (req, res) => {
  res.render('cadastro');
});

// Rota de login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  
  try {
    const usuario = await UsuarioModel.buscarPorEmail(email);
    
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    
    // Armazena o ID do usuário na sessão
    req.session.userId = usuario.id;
    
    res.json({ sucesso: true });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ erro: 'Erro ao processar login' });
  }
});

// Rota para obter dados do usuário logado
app.get('/user-data', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }
  
  try {
    const usuario = await UsuarioModel.buscarPorId(req.session.userId);
    
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    let userData = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo
    };
    
    // Adiciona informações específicas conforme o tipo de usuário
    if (usuario.tipo === 'aluno') {
      const aluno = await AlunoModel.buscarPorUsuarioId(usuario.id);
      const instituicao = await InstituicaoEnsinoModel.buscarPorId(aluno.instituicao_ensino_id);
      
      userData = {
        ...userData,
        cpf: aluno.cpf,
        curso: aluno.curso,
        saldo: aluno.saldo,
        instituicao: instituicao?.nome
      };
    } else if (usuario.tipo === 'professor') {
      const professor = await ProfessorModel.buscarPorUsuarioId(usuario.id);
      const instituicao = await InstituicaoEnsinoModel.buscarPorId(professor.instituicao_ensino_id);
      
      userData = {
        ...userData,
        cpf: professor.cpf,
        departamento: professor.departamento,
        instituicao: instituicao?.nome
      };
    } else if (usuario.tipo === 'empresa') {
      const empresa = await EmpresaModel.buscarPorUsuarioId(usuario.id);
      
      userData = {
        ...userData,
        cnpj: empresa.cnpj,
        endereco: empresa.endereco,
        descricao: empresa.descricao
      };
    }
    
    res.json(userData);
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({ erro: 'Erro ao buscar dados do usuário' });
  }
});

// Rota de logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Rota de login (página)
app.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/');
  }
  res.render('login');
});

// Rota para gerenciar vantagens (apenas empresas)
app.get('/vantagens', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  
  try {
    // Verifica se o usuário é uma empresa
    const usuario = await UsuarioModel.buscarPorId(req.session.userId);
    
    if (!usuario || usuario.tipo !== 'empresa') {
      return res.status(403).render('error', { 
        erro: 'Acesso negado. Apenas empresas podem acessar esta página.' 
      });
    }
    
    res.render('vantagens');
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    res.status(500).render('error', { 
      erro: 'Erro interno do servidor' 
    });
  }
});

// Rotas
const alunoRoutes = require('./src/routes/alunoRoute');
const instituicaoEnsinoRoutes = require('./src/routes/instituicaoEnsinoRoutes');
const empresaRoutes = require('./src/routes/empresaRoutes');
const vantagemRoutes = require('./src/routes/vantagemRoute');
const professorRoutes = require('./src/routes/professorRoute');

app.use('/alunos', alunoRoutes);
app.use('/instituicoes', instituicaoEnsinoRoutes);
app.use('/empresas', empresaRoutes);
app.use('/vantagens', vantagemRoutes);
app.use('/professores', professorRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

module.exports = app;