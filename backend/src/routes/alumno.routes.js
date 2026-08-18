const express = require('express');
const router = express.Router();
const alumnoController = require('../controllers/alumno.controller');

router.get('/', alumnoController.getAlumnos);
router.get('/:id', alumnoController.getAlumnoById);
router.put('/:id', alumnoController.updateAlumno);

module.exports = router;
