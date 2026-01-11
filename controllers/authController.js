const db = require('../db'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
    const { email, password, adminId, adminName, is_admin } = req.body;
    try {
        let result;
        if (is_admin) {
            result = await db.query('SELECT * FROM usuarios WHERE id = $1 AND nombre = $2', [adminId, adminName]);
        } else {
            result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        }

        const usuarios = result.rows;
        if (!usuarios || usuarios.length === 0) {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }

        const usuario = usuarios[0];
        const passwordCorrecto = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordCorrecto) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '8h' }
        );

        return res.json({ 
            token, 
            user: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, saldo: usuario.saldo } 
        });
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor", details: err.message });
    }
};

// Define register aunque esté vacío por ahora para que no sea undefined
const register = async (req, res) => {
    res.json({ message: "Ruta de registro" });
};

// EXPORTACIÓN CLAVE: Asegúrate de que estos nombres coincidan con el Router
module.exports = {
    login,
    register
};