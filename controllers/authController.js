const db = require('../db'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
    const { email, password, adminId, adminName, is_admin } = req.body;
    
    try {
        let result;
        
        // 1. Buscamos al usuario según el tipo de acceso
        if (is_admin) {
            // Para Admin usamos ID y Nombre (según tu requerimiento)
            result = await db.query('SELECT * FROM usuarios WHERE id = $1 AND nombre = $2', [adminId, adminName]);
        } else {
            // Para Estudiante usamos el Email
            result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        }

        const usuarios = result.rows;
        
        if (!usuarios || usuarios.length === 0) {
            return res.status(401).json({ error: "Credenciales incorrectas o usuario no encontrado" });
        }

        const usuario = usuarios[0];

        // 2. VALIDACIÓN DE CONTRASEÑA (Solo para NO administradores)
        if (!is_admin) {
            // Si es estudiante, comparamos la contraseña con el hash de la BD
            const passwordCorrecto = await bcrypt.compare(password, usuario.password_hash);
            if (!passwordCorrecto) {
                return res.status(401).json({ error: "Contraseña incorrecta" });
            }
        } 
        // Si es admin, el flujo continúa directamente porque ya validamos ID y Nombre en la consulta SQL.

        // 3. Generación del Token
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '8h' }
        );

        // 4. Respuesta exitosa
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
        console.error("Error detallado:", err.message);
        return res.status(500).json({ error: "Error en el servidor", details: err.message });
    }
};

const register = async (req, res) => {
    res.json({ message: "Ruta de registro" });
};

module.exports = {
    login,
    register
};