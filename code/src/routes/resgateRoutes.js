// routes/resgateRoutes.js
const express = require('express');
const router = express.Router();
const ResgateController = require('../controllers/ResgateController');

router.get('/resgates/listar', ResgateController.listarPorAluno);

module.exports = router;