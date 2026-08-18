const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/curso.controller');
const matriculaController = require('../controllers/matricula.controller');
const notaController = require('../controllers/nota.controller');

// CRUD Cursos
router.get('/', cursoController.getCursos);
router.get('/estudiante/:estudianteId', cursoController.getCursosMatriculados);
router.get('/:id', cursoController.getCursoById);
router.post('/', cursoController.createCurso);
router.put('/:id', cursoController.updateCurso);
router.delete('/:id', cursoController.deleteCurso);

// Sub-recursos de curso: matriculados y notas
router.get('/:cursoId/matriculas', matriculaController.getMatriculasPorCurso);
router.post('/:cursoId/notas', notaController.guardarNotasCurso);

module.exports = router;
