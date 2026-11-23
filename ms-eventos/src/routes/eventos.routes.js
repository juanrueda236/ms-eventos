const express = require('express');
const router = express.Router();

const controlador = require('../controllers/eventos.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

router.use(verificarToken);

// GET: cualquier rol autenticado
router.get('/', controlador.listar);
router.get('/:id', controlador.buscarPorId);

// Escritura: solo administrador
router.post('/', requiereRol('administrador'), controlador.crear);
router.put('/:id', requiereRol('administrador'), controlador.actualizar);
router.delete('/:id', requiereRol('administrador'), controlador.eliminar);

module.exports = router;