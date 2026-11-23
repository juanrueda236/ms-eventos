function errorHandler(error, req, res, next) {
  const status = error.status || error.statusCode || 500;

  const mensaje =
    error.message || 'Error interno del servidor';

  res.status(status).json({
    error: mensaje
  });
}

module.exports = errorHandler;