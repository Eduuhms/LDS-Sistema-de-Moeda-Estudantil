const express = require('express');
const router = express.Router();
const ProfessorController = require('../controllers/ProfessorController');

router.get('/cadastro', ProfessorController.exibirFormulario);
router.post('/cadastrar', ProfessorController.cadastrar);
router.get('/', ProfessorController.listar);
router.get('/:id', ProfessorController.buscarPorId);
router.put('/atualizar/:id', ProfessorController.atualizar);
router.delete('/:id', ProfessorController.excluir);
router.get('/usuario/:usuarioId', ProfessorController.buscarPorUsuarioId);

module.exports = router;