const repo = require('../repositories/eventos.repository');
const HttpError = require('../utils/http-error');

const tipos = ['conferencia','taller','feria'];
const proveedor = (process.env.AUDITORIOS_URL || 'http://127.0.0.1:3012').replace(/\/$/, '');

async function consultarAuditorio(id, token) {
  let response;
  try {
    response = await fetch(`${proveedor}/auditorios/${id}`, {
      headers: { Authorization: token || '' }
    });
  } catch {
    throw new HttpError(503, 'El servicio de auditorios no está disponible');
  }

  if (response.status === 404) return null;
  if (!response.ok) throw new HttpError(503, 'Error consultando el servicio de auditorios');
  return response.json();
}

function validarEvento(e) {
  for (const campo of ['codigo','nombre','fecha','asistentes_esperados','tipo','auditorio_id']) {
    if (e[campo] === undefined || e[campo] === null || e[campo] === '') {
      throw new HttpError(400, `El campo ${campo} es obligatorio`);
    }
  }

  if (!Number.isInteger(Number(e.asistentes_esperados)) || Number(e.asistentes_esperados) <= 0)
    throw new HttpError(400, 'Los asistentes esperados deben ser un entero mayor que cero');

  if (!Number.isInteger(Number(e.auditorio_id)) || Number(e.auditorio_id) <= 0)
    throw new HttpError(400, 'auditorio_id debe ser un entero positivo');

  if (!tipos.includes(e.tipo))
    throw new HttpError(400, 'El tipo debe ser conferencia, taller o feria');

  if (typeof e.fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(e.fecha) ||
      new Date(`${e.fecha}T00:00:00Z`).toISOString().slice(0,10) !== e.fecha)
    throw new HttpError(400, 'La fecha debe tener formato YYYY-MM-DD');
}

async function validarRelacion(e, token) {
  const auditorio = await consultarAuditorio(Number(e.auditorio_id), token);
  if (!auditorio) throw new HttpError(400, 'El auditorio indicado no existe');

  if (Number(e.asistentes_esperados) > Number(auditorio.aforo))
    throw new HttpError(400, `Los asistentes superan el aforo del auditorio (${auditorio.aforo})`);

  return auditorio;
}

function compuesto(evento, auditorio, advertencia) {
  return {
    ...evento,
    auditorio: auditorio ? {
      id: auditorio.id,
      nombre_auditorio: auditorio.nombre_auditorio,
      sede: auditorio.sede
    } : null,
    ...(advertencia ? { advertencia } : {})
  };
}

async function listar(filtros, token) {
  if (filtros.tipo && !tipos.includes(filtros.tipo))
    throw new HttpError(400, 'El tipo de evento no es válido');

  const eventos = await repo.listar(filtros);
  if (!eventos.length) return [];

  const ids = [...new Set(eventos.map(e => e.auditorio_id))].join(',');
  let auditorios;

  try {
    const response = await fetch(`${proveedor}/auditorios?ids=${ids}`, {
      headers: { Authorization: token || '' }
    });
    if (!response.ok) throw new Error('Proveedor no disponible');
    auditorios = await response.json();
  } catch {
    return eventos.map(e => compuesto(e, null, 'No fue posible consultar el servicio de auditorios'));
  }

  const mapa = new Map(auditorios.map(a => [Number(a.id), a]));
  return eventos.map(e => compuesto(e, mapa.get(Number(e.auditorio_id)) || null));
}

async function buscarPorId(id, token) {
  const evento = await repo.buscarPorId(id);
  if (!evento) throw new HttpError(404, 'Evento no encontrado');

  try {
    const auditorio = await consultarAuditorio(evento.auditorio_id, token);
    return compuesto(evento, auditorio);
  } catch (error) {
    if (error.status === 503)
      return compuesto(evento, null, 'No fue posible consultar el servicio de auditorios');
    throw error;
  }
}

async function crear(e, token) {
  validarEvento(e);
  const auditorio = await validarRelacion(e, token);

  if (await repo.buscarPorCodigo(e.codigo))
    throw new HttpError(409, 'El código del evento ya existe');

  e.auditorio_id = Number(e.auditorio_id);
  const id = await repo.crear(e);
  return compuesto(await repo.buscarPorId(id), auditorio);
}

async function actualizar(id, e, token) {
  validarEvento(e);
  const actual = await repo.buscarPorId(id);
  if (!actual) throw new HttpError(404, 'Evento no encontrado');

  const auditorio = await validarRelacion(e, token);
  const existente = await repo.buscarPorCodigo(e.codigo);
  if (existente && existente.id !== Number(id))
    throw new HttpError(409, 'El código del evento ya existe');

  e.auditorio_id = Number(e.auditorio_id);
  await repo.actualizar(id, e);
  return compuesto(await repo.buscarPorId(id), auditorio);
}

async function eliminar(id) {
  if (!await repo.buscarPorId(id)) throw new HttpError(404, 'Evento no encontrado');
  return repo.eliminar(id);
}

module.exports = { listar,buscarPorId,crear,actualizar,eliminar };

