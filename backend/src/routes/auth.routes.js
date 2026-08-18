const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Rutas públicas
router.post('/login', authController.login);

// Rutas protegidas
router.get('/me', verifyToken, authController.getProfile);
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;
