// Backend - authController.js
exports.login = async (req, res) => {
    const { email, password, adminId, adminName, is_admin } = req.body;

    try {
        let user;

        if (is_admin) {
            // BUSCA POR ID Y NOMBRE (Para el Admin)
            user = await db.query('SELECT * FROM usuarios WHERE id = ? AND nombre = ? AND rol = "admin"', [adminId, adminName]);
        } else {
            // BUSCA POR EMAIL Y PASSWORD (Para el Estudiante)
            user = await db.query('SELECT * FROM usuarios WHERE email = ? AND password = ?', [email, password]);
        }

        if (user.length === 0) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        // ... lógica para generar el JWT token ...
        res.json({ token, user: user[0] });

    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
};