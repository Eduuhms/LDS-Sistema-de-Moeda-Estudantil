const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');

// Rota página inicial
app.get('/', (req, res) => {
  res.render('index');
});

// Rotas
const alunoRoutes = require('./src/routes/alunoRoute');
const instituicaoEnsinoRoutes = require('./src/routes/instituicaoEnsinoRoutes');
const empresaRoutes = require('./src/routes/empresaRoutes');

app.use('/alunos', alunoRoutes);
app.use('/instituicoes', instituicaoEnsinoRoutes);
app.use('/empresas', empresaRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

module.exports = app;