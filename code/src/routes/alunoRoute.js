const express = require('express');
const router = express.Router();
const AlunoController = require('../controllers/AlunoController');

router.post('/cadastrar', AlunoController.cadastrar);
router.get('/', AlunoController.listar);
router.get('/:id', AlunoController.buscarPorId);

module.exports = router;