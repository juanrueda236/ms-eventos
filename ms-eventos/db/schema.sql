CREATE DATABASE IF NOT EXISTS eventos_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eventos_db;

CREATE TABLE IF NOT EXISTS eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  fecha DATE NOT NULL,
  asistentes_esperados INT NOT NULL,
  tipo ENUM('conferencia','taller','feria') NOT NULL,
  auditorio_id INT NOT NULL,
  CONSTRAINT chk_asistentes_positivos CHECK (asistentes_esperados > 0),
  CONSTRAINT chk_auditorio_positivo CHECK (auditorio_id > 0)
);

INSERT INTO eventos
(codigo,nombre,fecha,asistentes_esperados,tipo,auditorio_id)
VALUES
('EV001','Congreso de Ingeniería','2026-12-10',120,'conferencia',1),
('EV002','Taller de Innovación','2026-12-12',35,'taller',1),
('EV003','Feria Universitaria','2026-12-15',200,'feria',1);
