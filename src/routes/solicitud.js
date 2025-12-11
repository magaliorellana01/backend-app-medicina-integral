const express = require('express');
const router = express.Router();
const SolicitudController = require('../controllers/solicitud');
const DashboardController = require('../controllers/dashboardSolicitudes');

// --- Rutas principales ---
router.get('/dashboard/stats', DashboardController.getDashboardStats);  // Stats del dashboard
router.get('/:id', SolicitudController.getSolicitudById);      // Detalle de solicitud
router.put('/:id', SolicitudController.updateSolicitud);       // Actualizar solicitud


module.exports = router;
