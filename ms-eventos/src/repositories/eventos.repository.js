const db = require('../config/db');

async function listar(filtros = {}) {
  const sql = filtros.tipo
    ? 'SELECT * FROM eventos WHERE tipo = ?'
    : 'SELECT * FROM eventos';
  const [rows] = await db.execute(sql, filtros.tipo ? [filtros.tipo] : []);
  return rows;
}

async function buscarPorId(id) {
  const [rows] = await db.execute('SELECT * FROM eventos WHERE id = ?', [id]);
  return rows[0] || null;
}

async function buscarPorCodigo(codigo) {
  const [rows] = await db.execute('SELECT * FROM eventos WHERE codigo = ?', [codigo]);
  return rows[0] || null;
}

async function crear(e) {
  const [r] = await db.execute(
    `INSERT INTO eventos
     (codigo,nombre,fecha,asistentes_esperados,tipo,auditorio_id)
     VALUES (?,?,?,?,?,?)`,
    [e.codigo,e.nombre,e.fecha,e.asistentes_esperados,e.tipo,e.auditorio_id]
  );
  return r.insertId;
}

async function actualizar(id,e) {
  const [r] = await db.execute(
    `UPDATE eventos SET codigo=?,nombre=?,fecha=?,
     asistentes_esperados=?,tipo=?,auditorio_id=? WHERE id=?`,
    [e.codigo,e.nombre,e.fecha,e.asistentes_esperados,e.tipo,e.auditorio_id,id]
  );
  return r.affectedRows;
}

async function eliminar(id) {
  const [r] = await db.execute('DELETE FROM eventos WHERE id=?', [id]);
  return r.affectedRows;
}

module.exports = { listar,buscarPorId,buscarPorCodigo,crear,actualizar,eliminar };
