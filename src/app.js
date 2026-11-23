const express = require('express');
const cors = require('cors');

const eventosRoutes = require('./routes/eventos.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Registro simple de peticiones: método, ruta y código de respuesta
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode}`);
  });

  next();
});

// Ruta de salud
app.get('/health', (req, res) => {
  res.status(200).json({
    servicio: 'ms-eventos',
    estado: 'ok'
  });
});

// API de eventos
app.use('/eventos', eventosRoutes);

// 404 para rutas inexistentes
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada'
  });
});

// Manejador central de errores
app.use(errorHandler);

module.exports = app;