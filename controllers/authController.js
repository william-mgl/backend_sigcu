const db = require('../db'); 
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { email, password, adminId, adminName, is_admin } = req.body;

    try {
        let rows;

        if (is_admin) {
            // Consulta para Administrador
            const [result] = await db.query(
                'SELECT * FROM usuarios WHERE id = ? AND nombre = ? AND rol = "admin"', 
                [adminId, adminName]
            );
            rows = result;
        } else {
            // Consulta para Estudiante
            const [result] = await db.query(
                'SELECT * FROM usuarios WHERE email = ? AND password = ?', 
                [email, password]
            );
            rows = result;
        }

        // Verificamos si encontramos al usuario
        if (!rows || rows.length === 0) {
            return res.status(401).json({ error: "Credenciales incorrectas o usuario no encontrado" });
        }

        const usuario = rows[0];

        // Generar Token
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '8h' }
        );

        // Respuesta exitosa
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
        console.error("Error detallado en el servidor:", err);
        // Esto evita que el servidor se caiga y envía el error al frontend
        return res.status(500).json({ error: "Error interno en el servidor", details: err.message });
    }
};

module.exports = { login };