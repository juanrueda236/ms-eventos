const repositorio = require('../repositories/eventos.repository');
const HttpError = require('../utils/http-error');

const tiposPermitidos = ['conferencia', 'taller', 'feria'];

function validarEvento(evento) {
  const camposObligatorios = [
    'codigo',
    'nombre',
    'fecha',
    'asistentes_esperados',
    'tipo'
  ];

  for (const campo of camposObligatorios) {
    if (
      evento[campo] === undefined ||
      evento[campo] === null ||
      evento[campo] === ''
    ) {
      throw new HttpError(400, `El campo ${campo} es obligatorio`);
    }
  }

  if (!Number.isInteger(Number(evento.asistentes_esperados)) ||
      Number(evento.asistentes_esperados) <= 0) {
    throw new HttpError(
      400,
      'Los asistentes esperados deben ser un número entero mayor que cero'
    );
  }

  if (!tiposPermitidos.includes(evento.tipo)) {
    throw new HttpError(
      400,
      'El tipo debe ser conferencia, taller o feria'
    );
  }

  if (
    typeof evento.fecha !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(evento.fecha) ||
    new Date(`${evento.fecha}T00:00:00Z`).toISOString().slice(0, 10) !== evento.fecha
  ) {
    throw new HttpError(400, 'La fecha debe tener el formato YYYY-MM-DD');
  }
}

async function listar(filtros) {
  if (filtros.tipo && !tiposPermitidos.includes(filtros.tipo)) {
    throw new HttpError(400, 'El tipo de evento no es válido');
  }

  return repositorio.listar(filtros);
}

async function buscarPorId(id) {
  const evento = await repositorio.buscarPorId(id);

  if (!evento) {
    throw new HttpError(404, 'Evento no encontrado');
  }

  return evento;
}

async function crear(evento) {
  validarEvento(evento);

  const existente = await repositorio.buscarPorCodigo(evento.codigo);

  if (existente) {
    throw new HttpError(409, 'El código del evento ya existe');
  }

  return repositorio.crear(evento);
}

async function actualizar(id, evento) {
  validarEvento(evento);

  const actual = await repositorio.buscarPorId(id);

  if (!actual) {
    throw new HttpError(404, 'Evento no encontrado');
  }

  const existente = await repositorio.buscarPorCodigo(evento.codigo);

  if (existente && existente.id !== Number(id)) {
    throw new HttpError(409, 'El código del evento ya existe');
  }

  await repositorio.actualizar(id, evento);

  return repositorio.buscarPorId(id);
}

async function eliminar(id) {
  const actual = await repositorio.buscarPorId(id);

  if (!actual) {
    throw new HttpError(404, 'Evento no encontrado');
  }

  return repositorio.eliminar(id);
}

module.exports = {
  listar,
  buscarPorId,
  crear,
  actualizar,
  eliminar
};