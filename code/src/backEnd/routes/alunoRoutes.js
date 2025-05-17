const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');

router.post('/', alunoController.post);
router.get('/', alunoController.getAll);
router.get('/:id', alunoController.getById);
router.put('/:id', alunoController.put);
router.patch('/:id', alunoController.patch);
router.delete('/:id', alunoController.del);
router.post('/:id/receber-moedas', alunoController.receberMoedas);
router.get('/:id/saldo-moedas', alunoController.getSaldoMoedas);

module.exports = router;