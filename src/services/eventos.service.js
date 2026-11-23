const repo = require('../repositories/eventos.repository');
const Evento = require('../models/evento.model');
const HttpError = require('../utils/http-error');

const TIPOS_VALIDOS = ['conferencia', 'taller', 'feria'];

function validarEvento(datos) {
  const errores = [];

  if (!datos.codigo || typeof datos.codigo !== 'string') {
    errores.push('codigo es obligatorio');
  }

  if (!datos.nombre || typeof datos.nombre !== 'string') {
    errores.push('nombre es obligatorio');
  }

  if (!datos.fecha || !/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha)) {
    errores.push('fecha debe tener formato AAAA-MM-DD');
  }

  const asistentes = Number(datos.asistentes_esperados);

  if (!Number.isInteger(asistentes) || asistentes <= 0) {
    errores.push('asistentes_esperados debe ser un entero mayor que 0');
  }

  if (!TIPOS_VALIDOS.includes(datos.tipo)) {
    errores.push('tipo debe ser conferencia, taller o feria');
  }

  return errores;
}

async function listar(filtros = {}) {
  if (filtros.tipo && !TIPOS_VALIDOS.includes(filtros.tipo)) {
    throw new HttpError(
      400,
      'tipo debe ser conferencia, taller o feria'
    );
  }

  const filas = await repo.listar(filtros);

  return filas.map((fila) => new Evento(fila));
}

async function buscarPorId(id) {
  const fila = await repo.buscarPorId(id);

  if (!fila) {
    throw new HttpError(404, 'Evento no encontrado');
  }

  return new Evento(fila);
}

async function crear(datos) {
  const errores = validarEvento(datos);

  if (errores.length > 0) {
    throw new HttpError(400, errores.join('. '));
  }

  const existente = await repo.buscarPorCodigo(datos.codigo);

  if (existente) {
    throw new HttpError(409, 'Ya existe un evento con ese codigo');
  }

  const evento = new Evento({
    codigo: datos.codigo.trim(),
    nombre: datos.nombre.trim(),
    fecha: datos.fecha,
    asistentes_esperados: Number(datos.asistentes_esperados),
    tipo: datos.tipo
  });

  const id = await repo.crear(evento);

  return buscarPorId(id);
}

async function actualizar(id, datos) {
  await buscarPorId(id);

  const errores = validarEvento(datos);

  if (errores.length > 0) {
    throw new HttpError(400, errores.join('. '));
  }

  const existente = await repo.buscarPorCodigo(datos.codigo);

  if (existente && Number(existente.id) !== Number(id)) {
    throw new HttpError(409, 'Ya existe un evento con ese codigo');
  }

  const evento = new Evento({
    codigo: datos.codigo.trim(),
    nombre: datos.nombre.trim(),
    fecha: datos.fecha,
    asistentes_esperados: Number(datos.asistentes_esperados),
    tipo: datos.tipo
  });

  await repo.actualizar(id, evento);

  return buscarPorId(id);
}

async function eliminar(id) {
  await buscarPorId(id);
  await repo.eliminar(id);
}

module.exports = {
  listar,
  buscarPorId,
  crear,
  actualizar,
  eliminar
};