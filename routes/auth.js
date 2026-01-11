const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Verificación manual para el log de Render
if (!authController.login) {
    console.error("ERROR CRÍTICO: authController.login no está definido. Revisa la exportación.");
}

// Línea 13 aproximadamente
router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router;