
const db = require('../config/db');

async function listar(filtros = {}) {
  if (filtros.tipo) {
    const [rows] = await db.execute(
      'SELECT * FROM eventos WHERE tipo = ?',
      [filtros.tipo]
    );

    return rows;
  }

  const [rows] = await db.execute(
    'SELECT * FROM eventos'
  );

  return rows;
}

async function buscarPorId(id) {
  const [rows] = await db.execute(
    'SELECT * FROM eventos WHERE id = ?',
    [id]
  );

  return rows[0] || null;
}

async function buscarPorCodigo(codigo) {
  const [rows] = await db.execute(
    'SELECT * FROM eventos WHERE codigo = ?',
    [codigo]
  );

  return rows[0] || null;
}

async function crear(evento) {
  const [resultado] = await db.execute(
    `INSERT INTO eventos
      (codigo, nombre, fecha, asistentes_esperados, tipo)
     VALUES (?, ?, ?, ?, ?)`,
    [
      evento.codigo,
      evento.nombre,
      evento.fecha,
      evento.asistentes_esperados,
      evento.tipo
    ]
  );

  return resultado.insertId;
}

async function actualizar(id, evento) {
  const [resultado] = await db.execute(
    `UPDATE eventos
     SET codigo = ?, nombre = ?, fecha = ?,
         asistentes_esperados = ?, tipo = ?
     WHERE id = ?`,
    [
      evento.codigo,
      evento.nombre,
      evento.fecha,
      evento.asistentes_esperados,
      evento.tipo,
      id
    ]
  );

  return resultado.affectedRows;
}

async function eliminar(id) {
  const [resultado] = await db.execute(
    'DELETE FROM eventos WHERE id = ?',
    [id]
  );

  return resultado.affectedRows;
}

module.exports = {
  listar,
  buscarPorId,
  buscarPorCodigo,
  crear,
  actualizar,
  eliminar
};
