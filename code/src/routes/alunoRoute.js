const express = require('express');
const router = express.Router();
const AlunoController = require('../controllers/AlunoController');

router.get('/cadastro', AlunoController.exibirFormulario);
router.post('/cadastrar', AlunoController.cadastrar);
router.get('/', AlunoController.listar);
router.get('/:id', AlunoController.buscarPorId);
router.put('/atualizar/:id', AlunoController.atualizar);
router.delete('/:id', AlunoController.excluir);
router.get('/usuario/:usuarioId', AlunoController.buscarPorUsuarioId);

module.exports = router;