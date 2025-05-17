const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.post('/', usuarioController.post);
router.get('/', usuarioController.getAll);
router.get('/:id', usuarioController.getById);
router.put('/:id', usuarioController.put);
router.patch('/:id', usuarioController.patch);
router.delete('/:id', usuarioController.del);
router.post('/autenticar', usuarioController.autenticar);

module.exports = router;