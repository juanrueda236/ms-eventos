const repo = require('../repositories/eventos.repository');
const Evento = require('../models/evento.model');
const HttpError = require('../utils/http-error');
const { pedir } = require('../clients/auditorios.client');

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
    errores.push('asistentes_esperados debe ser mayor que 0');
  }

  if (!TIPOS_VALIDOS.includes(datos.tipo)) {
    errores.push('tipo debe ser conferencia, taller o feria');
  }

  const auditorioId = Number(datos.auditorio_id);

  if (!Number.isInteger(auditorioId) || auditorioId <= 0) {
    errores.push('auditorio_id es obligatorio');
  }

  return errores;
}

async function consultarAuditorio(id, token) {
  const respuesta = await pedir(`/auditorios/${id}`, token);

  if (!respuesta) {
    throw new HttpError(503, 'ms-auditorios no disponible');
  }

  if (respuesta.status === 404) {
    throw new HttpError(400, 'El auditorio no existe');
  }

  if (!respuesta.ok) {
    throw new HttpError(
      respuesta.status,
      'Error consultando ms-auditorios'
    );
  }

  return respuesta.json();
}

function resumenAuditorio(auditorio) {
  return {
    id: auditorio.id,
    nombre_auditorio: auditorio.nombre_auditorio,
    sede: auditorio.sede
  };
}

async function validarAuditorio(datos, token) {
  const auditorio = await consultarAuditorio(
    datos.auditorio_id,
    token
  );

  if (
    Number(datos.asistentes_esperados) >
    Number(auditorio.aforo)
  ) {
    throw new HttpError(
      400,
      `Los asistentes superan el aforo del auditorio (${auditorio.aforo})`
    );
  }

  return auditorio;
}

async function listar(filtros = {}, token) {
  if (filtros.tipo && !TIPOS_VALIDOS.includes(filtros.tipo)) {
    throw new HttpError(
      400,
      'tipo debe ser conferencia, taller o feria'
    );
  }

  const filas = await repo.listar(filtros);
  const eventos = filas.map((fila) => new Evento(fila));

  if (eventos.length === 0) {
    return [];
  }

  const ids = [
    ...new Set(
      eventos
        .map((e) => e.auditorio_id)
        .filter(Boolean)
    )
  ];

  const respuesta = await pedir(
    `/auditorios?ids=${ids.join(',')}`,
    token
  );

  if (!respuesta) {
    return eventos.map((evento) => ({
      ...evento,
      auditorio: null,
      aviso: 'ms-auditorios no disponible'
    }));
  }

  if (!respuesta.ok) {
    throw new HttpError(
      respuesta.status,
      'Error consultando ms-auditorios'
    );
  }

  const auditorios = await respuesta.json();

  const mapa = new Map(
    auditorios.map((a) => [Number(a.id), a])
  );

  return eventos.map((evento) => ({
    ...evento,
    auditorio: mapa.has(Number(evento.auditorio_id))
      ? resumenAuditorio(
          mapa.get(Number(evento.auditorio_id))
        )
      : null
  }));
}

async function buscarPorId(id, token) {
  const fila = await repo.buscarPorId(id);

  if (!fila) {
    throw new HttpError(404, 'Evento no encontrado');
  }

  const evento = new Evento(fila);

  const respuesta = await pedir(
    `/auditorios/${evento.auditorio_id}`,
    token
  );

  if (!respuesta) {
    return {
      ...evento,
      auditorio: null,
      aviso: 'ms-auditorios no disponible'
    };
  }

  if (respuesta.status === 404) {
    return {
      ...evento,
      auditorio: null
    };
  }

  if (!respuesta.ok) {
    throw new HttpError(
      respuesta.status,
      'Error consultando ms-auditorios'
    );
  }

  const auditorio = await respuesta.json();

  return {
    ...evento,
    auditorio: resumenAuditorio(auditorio)
  };
}

async function crear(datos, token) {
  const errores = validarEvento(datos);

  if (errores.length > 0) {
    throw new HttpError(400, errores.join('. '));
  }

  const existente = await repo.buscarPorCodigo(datos.codigo);

  if (existente) {
    throw new HttpError(
      409,
      'Ya existe un evento con ese codigo'
    );
  }

  await validarAuditorio(datos, token);

  const evento = new Evento({
    codigo: datos.codigo.trim(),
    nombre: datos.nombre.trim(),
    fecha: datos.fecha,
    asistentes_esperados:
      Number(datos.asistentes_esperados),
    tipo: datos.tipo,
    auditorio_id: Number(datos.auditorio_id)
  });

  const id = await repo.crear(evento);

  return buscarPorId(id, token);
}

async function actualizar(id, datos, token) {
  const actual = await repo.buscarPorId(id);

  if (!actual) {
    throw new HttpError(404, 'Evento no encontrado');
  }

  const errores = validarEvento(datos);

  if (errores.length > 0) {
    throw new HttpError(400, errores.join('. '));
  }

  const existente = await repo.buscarPorCodigo(datos.codigo);

  if (
    existente &&
    Number(existente.id) !== Number(id)
  ) {
    throw new HttpError(
      409,
      'Ya existe un evento con ese codigo'
    );
  }

  await validarAuditorio(datos, token);

  const evento = new Evento({
    codigo: datos.codigo.trim(),
    nombre: datos.nombre.trim(),
    fecha: datos.fecha,
    asistentes_esperados:
      Number(datos.asistentes_esperados),
    tipo: datos.tipo,
    auditorio_id: Number(datos.auditorio_id)
  });

  await repo.actualizar(id, evento);

  return buscarPorId(id, token);
}

async function eliminar(id) {
  const actual = await repo.buscarPorId(id);

  if (!actual) {
    throw new HttpError(404, 'Evento no encontrado');
  }

  await repo.eliminar(id);
}

module.exports = {
  listar,
  buscarPorId,
  crear,
  actualizar,
  eliminar
};
