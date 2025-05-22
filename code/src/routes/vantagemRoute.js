const express = require('express');
const router = express.Router();
const VantagemController = require('../controllers/VantagemController');

router.post('/cadastrar', VantagemController.cadastrar);

module.exports = router;
