const express = require("express");
const router = express.Router();
const db = require("../db"); // Tu conexión a la base de datos
const { authenticateToken } = require("../middleware/auth");

// RUTA PARA OBTENER USUARIOS (Para el select del Admin)
router.get("/", authenticateToken, async (req, res) => {
    try {
        // Consultamos solo los que tienen rol 'estudiante' para recargar
        const result = await db.query(
            "SELECT id, nombre, email, saldo FROM usuarios WHERE rol = 'estudiante' ORDER BY nombre ASC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener usuarios:", err);
        res.status(500).json({ error: "Error en el servidor al obtener usuarios" });
    }
});

// RUTA PARA ACTUALIZAR SALDO
router.put("/saldo", authenticateToken, async (req, res) => {
    const { id, monto } = req.body;

    // Verificamos que quien pide esto sea el admin real
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

        res.json({ 
            mensaje: "Recarga exitosa", 
            usuario: result.rows[0].nombre, 
            nuevoSaldo: result.rows[0].saldo 
        });
    } catch (err) {
        res.status(500).json({ error: "Error al procesar la recarga" });
    }
});

module.exports = router;