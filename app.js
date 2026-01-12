// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Conexión a Supabase (PostgreSQL)
const pool = require('./db');

// Importación de Rutas
const authRoutes = require('./routes/auth');
const facultadRoutes = require('./routes/facultades');
const comedoresRoutes = require('./routes/comedores');
const usuariosRoutes = require('./routes/usuarios'); // Centralizaremos aquí la gestión de usuarios
const reservasRoutes = require('./routes/reservas');
const menuRouter = require('./routes/menu');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// =======================
// RUTAS PRINCIPALES
// =======================

// Autenticación (Login/Registro)
app.use('/api/auth', authRoutes);

// Facultades y Comedores
app.use('/api/facultades', facultadRoutes);
app.use('/api/comedores', comedoresRoutes);

// Gestión de Usuarios y Saldo (Usada por el AdminPanel)
// IMPORTANTE: Asegúrate de que AdminDashboard.jsx apunte a /api/usuarios
app.use('/api/usuarios', usuariosRoutes);

// Menús y Reservas
app.use('/api/menu-dia', menuRouter);
app.use('/api/menu', menuRouter);
app.use('/api/reservas', reservasRoutes);

// =======================
// SERVIDOR
// =======================

// API viva y Test de DB
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'API Comida Universitaria funcionando' });
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ ok: true, dbTime: result.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});