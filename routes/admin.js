const express = require("express");
const router = express.Router();
const pool = require("../db");
// 1. IMPORTAR MIDDLEWARES DE AUTENTICACIÓN Y AUTORIZACIÓN
const { authenticateToken, isAdmin } = require("../middleware/auth"); 

// --- RUTAS PROTEGIDAS CON authenticateToken Y isAdmin ---

// GET /api/admin/usuarios → Todos los usuarios (Solo Admin)
// *Añadidos los middlewares para proteger la ruta*
router.get("/usuarios", authenticateToken, isAdmin, async (req, res) => {
  try {
    // 2. CORREGIDA LA QUERY A SINTAXIS POSTGRESQL (no se usa [rows] en destructuring)
    const { rows } = await pool.query(
      "SELECT id, nombre, email, saldo FROM usuarios ORDER BY nombre"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// PUT /api/admin/recargar → Recargar saldo (Solo Admin)
// *Añadidos los middlewares para proteger la ruta*
router.put("/recargar", authenticateToken, isAdmin, async (req, res) => {
  const { userId, monto } = req.body;

  if (!userId || !monto || isNaN(monto) || Number(monto) <= 0)
    return res.status(400).json({ error: "Datos de recarga inválidos" });

  try {
    // 3. CORREGIDA LA QUERY A SINTAXIS POSTGRESQL ($ y rowCount)
    const result = await pool.query(
      "UPDATE usuarios SET saldo = saldo + $1 WHERE id = $2 RETURNING id",
      [monto, userId]
    );

    // 4. CORREGIDA LA VERIFICACIÓN DE ACTUALIZACIÓN (usando rowCount)
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Saldo recargado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al recargar saldo" });
  }
});

module.exports = router;