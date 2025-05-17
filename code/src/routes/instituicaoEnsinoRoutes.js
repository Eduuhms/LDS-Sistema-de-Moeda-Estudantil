const express = require('express');
const router = express.Router();
const InstituicaoEnsinoController = require('../controllers/InstituicaoEnsinoController');


router.post('/', InstituicaoEnsinoController.cadastrar);
router.get('/:id', InstituicaoEnsinoController.buscarPorId);
router.put('/:id', InstituicaoEnsinoController.atualizar);
router.delete('/:id', InstituicaoEnsinoController.excluir);

module.exports = router; 