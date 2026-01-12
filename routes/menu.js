const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/menu-dia/comedor/:comedorId
router.get("/comedor/:comedorId", async (req, res) => {
    const { comedorId } = req.params;
    try {
        const { rows } = await pool.query(
            `SELECT md.id, p.nombre, p.descripcion, p.precio, md.cantidad_disponible
             FROM menu_dia md
             JOIN platos p ON md.plato_id = p.id
             WHERE md.comedor_id = $1 AND md.fecha = CURRENT_DATE`, 
            [comedorId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Error al cargar menú" });
    }
});

module.exports = router;