const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken } = require("../middleware/auth");

// GET /api/reservas/usuario/:id (La ruta que fallaba en tu consola)
router.get("/usuario/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query(
            `SELECT r.*, p.nombre as plato_nombre 
             FROM reservas r 
             JOIN menu_dia md ON r.menu_id = md.id 
             JOIN platos p ON md.plato_id = p.id 
             WHERE r.usuario_id = $1 
             ORDER BY r.id DESC`, [id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Error al obtener reservas" });
    }
});

module.exports = router;