const express = require('express');
const router = express.Router();
const VantagemController = require('../controllers/VantagemController');

router.post('/cadastrar', VantagemController.cadastrar);
router.put('/atualizar/:id', VantagemController.atualizar);
router.delete('/deletar/:id', VantagemController.deletar);
router.get('/listar', VantagemController.buscarTodos);
router.get('/listar-empresa', VantagemController.buscarPorEmpresaLogada);
router.get('/buscar/:id', VantagemController.buscarPorId);
router.get('/empresa', VantagemController.renderVantagensEmpresa);
router.get('/aluno', VantagemController.renderVantagensAluno);
router.post('/resgatar', VantagemController.resgatarVantagem);
module.exports = router;