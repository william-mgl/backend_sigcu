const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const db = require("../db"); // Tu conexión a Supabase/Postgres

// 1. Obtener todos los usuarios (Para el select del Admin)
router.get("/", authenticateToken, async (req, res) => {
    try {
        const result = await db.query("SELECT id, nombre, email, rol, saldo FROM usuarios ORDER BY nombre ASC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

// 2. Actualizar saldo (La recarga)
router.put("/saldo", authenticateToken, async (req, res) => {
    const { id, monto } = req.body;

    if (req.user.rol !== 'admin_comedor') {
        return res.status(403).json({ error: "No tienes permisos de administrador" });
    }

    try {
        const result = await db.query(
            "UPDATE usuarios SET saldo = saldo + $1 WHERE id = $2 RETURNING nombre, saldo",
            [monto, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ mensaje: "Saldo actualizado", usuario: result.rows[0].nombre, nuevoSaldo: result.rows[0].saldo });
    } catch (err) {
        res.status(500).json({ error: "Error en la base de datos" });
    }
});

module.exports = router;