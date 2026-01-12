const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, isAdmin } = require("../middleware/auth");

// Obtener todos (Solo Admin)
router.get("/", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT id, nombre, email, rol, saldo FROM usuarios ORDER BY nombre");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

// Obtener uno mismo o Admin (CORREGIDO: Sin isAdmin obligatorio)
router.get("/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        // Seguridad: Si no es admin y no es su propio ID, denegar
        if (req.user.rol !== 'admin' && req.user.id !== parseInt(id)) {
            return res.status(403).json({ error: "Acceso denegado a este perfil" });
        }

        const { rows } = await pool.query("SELECT id, nombre, email, rol, saldo FROM usuarios WHERE id = $1", [id]);
        if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error del servidor" });
    }
});

module.exports = router;