const express = require('express');
const router = express.Router();
const EmpresaController = require('../controllers/EmpresaController');

router.get('/cadastro', EmpresaController.exibirFormulario);

router.get('/', EmpresaController.listar);

router.get('/usuario', EmpresaController.buscarPorUsuario);

router.post('/cadastrar', EmpresaController.cadastrar);
router.get('/:id', EmpresaController.buscarPorId);
router.put('/atualizar/:id', EmpresaController.atualizar);
router.delete('/:id', EmpresaController.excluir);
router.get('/usuario/:usuarioId', EmpresaController.buscarPorUsuarioId);

module.exports = router; 