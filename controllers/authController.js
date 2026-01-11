const db = require('../config/db'); // Asegúrate de que esta ruta a tu DB sea correcta
const jwt = require('jsonwebtoken');

// Usamos esta forma de exportar para que sea compatible con la desestructuración
const login = async (req, res) => {
    const { email, password, adminId, adminName, is_admin } = req.body;

    try {
        let user;

        if (is_admin) {
            // En mysql2/promise, el resultado viene en un array [rows, fields]
            const [rows] = await db.query(
                'SELECT * FROM usuarios WHERE id = ? AND nombre = ? AND rol = "admin"', 
                [adminId, adminName]
            );
            user = rows;
        } else {
            const [rows] = await db.query(
                'SELECT * FROM usuarios WHERE email = ? AND password = ?', 
                [email, password]
            );
            user = rows;
        }

        if (!user || user.length === 0) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const usuarioEncontrado = user[0];

        // Generación del Token (Asegúrate de tener JWT_SECRET en tu .env de Render)
        const token = jwt.sign(
            { id: usuarioEncontrado.id, rol: usuarioEncontrado.rol },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '8h' }
        );

        res.json({ 
            token, 
            user: {
                id: usuarioEncontrado.id,
                nombre: usuarioEncontrado.nombre,
                email: usuarioEncontrado.email,
                rol: usuarioEncontrado.rol,
                saldo: usuarioEncontrado.saldo
            } 
        });

    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).json({ error: "Error interno en el servidor" });
    }
};

// Función register (vacía para que no de error al importar)
const register = async (req, res) => {
    // Tu lógica de registro aquí
};

// EXPORTACIÓN CORRECTA PARA EL ROUTER
module.exports = {
    login,
    register
};