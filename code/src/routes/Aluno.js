const express = require('express');
const router = express.Router();
const AlunoController = require('../controllers/AlunoController');
// const authMiddleware = require('../middlewares/auth');

// Rotas públicas
router.get('/cadastro', AlunoController.exibirFormulario);
router.post('/cadastrar', AlunoController.cadastrar);

// Rotas protegidas
router.get('/', AlunoController.listar);
router.get('/:id', AlunoController.buscarPorId);

module.exports = router;