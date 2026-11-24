const service = require('../services/eventos.service');

async function listar(req, res, next) {
  try {
    const eventos = await service.listar(
      { tipo: req.query.tipo },
      req.headers.authorization
    );

    res.status(200).json(eventos);
  } catch (error) {
    next(error);
  }
}

async function buscarPorId(req, res, next) {
  try {
    const evento = await service.buscarPorId(
      req.params.id,
      req.headers.authorization
    );

    res.status(200).json(evento);
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const evento = await service.crear(
      req.body,
      req.headers.authorization
    );

    res.status(201).json(evento);
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const evento = await service.actualizar(
      req.params.id,
      req.body,
      req.headers.authorization
    );

    res.status(200).json(evento);
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    await service.eliminar(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listar,
  buscarPorId,
  crear,
  actualizar,
  eliminar
};
