const HttpError = require('../utils/http-error');

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const status = error instanceof HttpError
    ? error.status
    : error.code === 'ER_DUP_ENTRY'
      ? 409
      : 500;

  res.status(status).json({
    error: error.message || 'Error interno del servidor'
  });
}

module.exports = errorHandler;