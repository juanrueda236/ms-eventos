const servicio = require('../services/eventos.service');

async function listar(req, res, next) {
  try {
    const eventos = await servicio.listar(req.query);
    res.status(200).json(eventos);
  } catch (error) {
    next(error);
  }
}

async function buscarPorId(req, res, next) {
  try {
    const evento = await servicio.buscarPorId(req.params.id);
    res.status(200).json(evento);
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const id = await servicio.crear(req.body);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const evento = await servicio.actualizar(req.params.id, req.body);
    res.status(200).json(evento);
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    await servicio.eliminar(req.params.id);
    res.status(204).end();
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