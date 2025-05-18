const express = require('express');
const router = express.Router();
const EmpresaController = require('../controllers/EmpresaController');

router.get('/cadastro', EmpresaController.exibirFormulario);

router.get('/', EmpresaController.listar);
router.post('/cadastrar', EmpresaController.cadastrar);
router.get('/:id', EmpresaController.buscarPorId);
router.put('/atualizar/:id', EmpresaController.atualizar);
router.delete('/:id', EmpresaController.excluir);

module.exports = router; 