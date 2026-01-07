// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Conexión a Supabase (PostgreSQL)
const pool = require('./db');

// Rutas
const authRoutes = require('./routes/auth');
const facultadRoutes = require('./routes/facultades');
const comedoresRoutes = require('./routes/comedores');
const usuariosRoutes = require('./routes/usuarios');
const reservasRoutes = require('./routes/reservas');
const menuRouter = require('./routes/menu');
const adminRoutes = require('./routes/admin');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// =======================
// RUTAS PRINCIPALES
// =======================
app.use('/api/auth', authRoutes);
app.use('/api/facultades', facultadRoutes);
app.use('/api/comedores', comedoresRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/menu', menuRouter);
app.use('/api/admin', adminRoutes);

// =======================
// RUTAS DE PRUEBA
// =======================

// API viva
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'API Comida Universitaria funcionando'
  });
});

// Prueba conexión Supabase
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      ok: true,
      dbTime: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// =======================
// SERVIDOR
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
