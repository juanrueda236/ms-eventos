const servicio = require('../services/eventos.service');

async function listar(req,res,next) {
  try {
    res.status(200).json(await servicio.listar(req.query, req.headers.authorization));
  } catch(e) { next(e); }
}
async function buscarPorId(req,res,next) {
  try {
    res.status(200).json(await servicio.buscarPorId(req.params.id, req.headers.authorization));
  } catch(e) { next(e); }
}
async function crear(req,res,next) {
  try {
    res.status(201).json(await servicio.crear(req.body, req.headers.authorization));
  } catch(e) { next(e); }
}
async function actualizar(req,res,next) {
  try {
    res.status(200).json(await servicio.actualizar(req.params.id, req.body, req.headers.authorization));
  } catch(e) { next(e); }
}
async function eliminar(req,res,next) {
  try {
    await servicio.eliminar(req.params.id);
    res.status(204).end();
  } catch(e) { next(e); }
}
module.exports = { listar,buscarPorId,crear,actualizar,eliminar };
