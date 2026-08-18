const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const usuarioRoutes = require('./usuario.routes');
const docenteRoutes = require('./docente.routes');
const alumnoRoutes = require('./alumno.routes');
const seccionRoutes = require('./seccion.routes');
const cursoRoutes = require('./curso.routes');
const matriculaRoutes = require('./matricula.routes');
const asignacionRoutes = require('./asignacion.routes');
const notaRoutes = require('./nota.routes');
const dashboardRoutes = require('./dashboard.routes');

// Definición de prefijos de rutas
router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/docentes', docenteRoutes);
router.use('/alumnos', alumnoRoutes);
router.use('/secciones', seccionRoutes);
router.use('/cursos', cursoRoutes);
router.use('/matriculas', matriculaRoutes);
router.use('/asignaciones', asignacionRoutes);
router.use('/notas', notaRoutes);
router.use('/dashboard', dashboardRoutes);

// Endpoint de estado de la API
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'IDAT School Management Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
