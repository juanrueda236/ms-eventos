const express = require('express');
const eventosRoutes = require('./routes/eventos.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

// Registro de cada petición
app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} ${res.statusCode}`);
  });

  next();
});

// Rutas del microservicio
app.use('/eventos', eventosRoutes);

// Manejo de errores
app.use(errorHandler);

module.exports = app;