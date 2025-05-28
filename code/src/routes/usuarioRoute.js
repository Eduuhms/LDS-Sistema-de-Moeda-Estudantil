const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');

router.post('/login', UsuarioController.login);
router.get('/logout', UsuarioController.logout);
router.get('/user-data', UsuarioController.userData);

// Rotas de páginas
router.get('/', UsuarioController.renderTelaInicial);
router.get('/cadastro', UsuarioController.renderCadastro);
router.get('/login', UsuarioController.renderLogin);
router.get('/editar-conta', UsuarioController.renderEditarConta);

module.exports = router; 