const express = require('express');
const router = express.Router();
const notaController = require('../controllers/nota.controller');

router.post('/curso/:cursoId', notaController.guardarNotasCurso);
router.put('/matricula/:matriculaId', notaController.actualizarNotas);
router.get('/estudiante/:estudianteId', notaController.getBoletaEstudiante);

module.exports = router;
