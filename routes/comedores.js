const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken } = require("../middleware/auth");

// GET /api/comedores/facultad/:id
router.get("/facultad/:facultadId", authenticateToken, async (req, res) => {
    const { facultadId } = req.params;
    try {
        const { rows } = await pool.query(
            "SELECT * FROM comedores WHERE id_facultad = $1 ORDER BY nombre", 
            [facultadId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Error al cargar comedores" });
    }
});

module.exports = router;