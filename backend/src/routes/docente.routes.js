const express = require('express');
const router = express.Router();
const docenteController = require('../controllers/docente.controller');

router.get('/', docenteController.getDocentes);
router.get('/:id', docenteController.getDocenteById);
router.put('/:id', docenteController.updateDocente);

module.exports = router;
