const express = require('express');
const router = express.Router();
const TransacaoController = require('../controllers/TransacaoController');

router.get('/', TransacaoController.listar);
router.get('/exibir-transacoes', TransacaoController.renderTransacoes);
router.get('/exibir-transacoes/dados', TransacaoController.listarHistorico)
router.get('/:id', TransacaoController.buscarPorId);
router.post('/cadastrar', TransacaoController.criar);
router.put('/atualizar/:id', TransacaoController.atualizar);
router.delete('/:id', TransacaoController.excluir);

module.exports = router; 