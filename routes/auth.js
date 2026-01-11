const express = require('express');
const router = express.Router();

// Importamos usando desestructuración. 
// Es vital que los nombres coincidan con el module.exports del controlador.
const authController = require('../controllers/authController');

// Verificación de seguridad para depuración (opcional)
if (!authController.login || !authController.register) {
    console.error("ERROR: Una de las funciones del controlador no está definida.");
}

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;