// controllers/authController.js
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

// Registro de usuario
async function register(req, res) {
  try {
    const { nombre, email, password, facultad_id, rol } = req.body;

    if (!nombre || !email || !password || !facultad_id) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Revisar si el email ya existe
    const { rows: exists } = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );
    if (exists.length > 0) {
      return res.status(409).json({ error: "Email ya registrado" });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Si no se pasa rol, por defecto es 'estudiante'
    const userRole = rol || 'estudiante';

    const insert = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, facultad_id, rol)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, nombre, email, facultad_id, rol`,
      [nombre, email, hash, facultad_id, userRole]
    );

    const user = insert.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({ user, token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor" });
  }
}

// Login de usuario
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const { rows } = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Devolver también el rol
    res.json({ user: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      facultad_id: user.facultad_id,
      rol: user.rol
    }, token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error del servidor" });
  }
}

module.exports = { register, login };
