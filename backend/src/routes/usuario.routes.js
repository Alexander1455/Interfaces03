const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

// Todas las rutas de usuarios requieren autenticación
router.get('/', usuarioController.getUsuarios);
router.get('/:id', usuarioController.getUsuarioById);
router.post('/', usuarioController.createUsuario);
router.put('/:id', usuarioController.updateUsuario);
router.delete('/:id', usuarioController.deleteUsuario);

module.exports = router;
