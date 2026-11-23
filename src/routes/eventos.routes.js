const express = require('express');

const controller = require('../controllers/eventos.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = express.Router();

// Todas las rutas requieren token válido
router.use(verificarToken);

// GET: cualquier usuario autenticado
router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);

// POST, PUT y DELETE: solo administrador
router.post(
  '/',
  requiereRol('administrador'),
  controller.crear
);

router.put(
  '/:id',
  requiereRol('administrador'),
  controller.actualizar
);

router.delete(
  '/:id',
  requiereRol('administrador'),
  controller.eliminar
);

module.exports = router;