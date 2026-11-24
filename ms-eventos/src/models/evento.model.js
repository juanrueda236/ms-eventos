class Evento {
  constructor({
    id, codigo, nombre, fecha,
    asistentes_esperados, tipo, auditorio_id
  }) {
    this.id = id;
    this.codigo = codigo;
    this.nombre = nombre;
    this.fecha = fecha instanceof Date
      ? fecha.toISOString().slice(0, 10)
      : fecha;
    this.asistentes_esperados = asistentes_esperados;
    this.tipo = tipo;
    this.auditorio_id = auditorio_id;
  }
}
module.exports = Evento;
