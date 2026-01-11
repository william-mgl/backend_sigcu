const db = require('../db'); 
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { email, password, adminId, adminName, is_admin } = req.body;

    try {
        let result;

        if (is_admin) {
            // PostgreSQL usa $1, $2 en lugar de ?
            // Importante: Verifica que los nombres de las columnas sean id, nombre y rol
            const query = 'SELECT * FROM usuarios WHERE id = $1 AND nombre = $2 AND rol = $3';
            result = await db.query(query, [adminId, adminName, 'admin']);
        } else {
            // Consulta para Estudiante usando marcadores $1 y $2
            const query = 'SELECT * FROM usuarios WHERE email = $1 AND password = $2';
            result = await db.query(query, [email, password]);
        }

        // En la librería 'pg', los datos están en result.rows
        const usuarios = result.rows;

        if (!usuarios || usuarios.length === 0) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }

        const usuario = usuarios[0];

        // Generar Token
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
        console.error("Error en login:", err);
        return res.status(500).json({ 
            error: "Error interno en el servidor", 
            message: err.message 
        });
    }
};

const register = async (req, res) => {
    // Asegúrate de usar también $1, $2... aquí si haces inserts
};

module.exports = { login, register };