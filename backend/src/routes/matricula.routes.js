const express = require('express');
const router = express.Router();
const matriculaController = require('../controllers/matricula.controller');
const notaController = require('../controllers/nota.controller');

router.get('/', matriculaController.getMatriculas);
router.post('/', matriculaController.matricular);
router.post('/matricular', matriculaController.matricular);
router.post('/desmatricular', matriculaController.desmatricular);
router.put('/:matriculaId/notas', notaController.actualizarNotas);

module.exports = router;
