const db = require('../db'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Asegúrate de tenerlo instalado: npm install bcrypt

const login = async (req, res) => {
    const { email, password, adminId, adminName, is_admin } = req.body;

    try {
        let result;

        if (is_admin) {
            // Para el Admin: buscamos por ID y Nombre
            const query = 'SELECT * FROM usuarios WHERE id = $1 AND nombre = $2';
            result = await db.query(query, [adminId, adminName]);
        } else {
            // Para el Estudiante: buscamos SOLO por email primero
            const query = 'SELECT * FROM usuarios WHERE email = $1';
            result = await db.query(query, [email]);
        }

        const usuarios = result.rows;

        // 1. Verificar si el usuario existe
        if (!usuarios || usuarios.length === 0) {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }

        const usuario = usuarios[0];

        // 2. VERIFICACIÓN DE CONTRASEÑA CON BCRYPT
        // Comparamos la contraseña plana del login con el hash de la columna 'password_hash'
        const passwordCorrecto = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordCorrecto) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        // 3. Generar Token si todo está bien
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '8h' }
        );

        return res.json({ 
            token, 
            user: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                saldo: usuario.saldo
            } 
        });

    } catch (err) {
        console.error("Error en login:", err.message);
        return res.status(500).json({ 
            error: "Error interno en el servidor", 
            details: err.message 
        });
    }
};

module.exports = { login };