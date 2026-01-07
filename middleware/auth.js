const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Middleware para verificar token
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Obtener usuario completo (incluyendo rol)
    const { rows } = await pool.query("SELECT id, nombre, email, rol FROM usuarios WHERE id = $1", [payload.id]);
    if (rows.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

    req.user = rows[0];
    next();
  } catch (err) {
    console.error(err);
    return res.status(403).json({ error: 'Token inválido' });
  }
}

// Middleware para verificar rol de administrador
function isAdmin(req, res, next) {
  if (req.user.rol !== 'administrativo') {
    return res.status(403).json({ error: 'Acceso denegado: solo administradores' });
  }
  next();
}

module.exports = { authenticateToken, isAdmin };
