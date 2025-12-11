const express = require('express');
const router = express.Router();
const SolicitudController = require('../controllers/filtroSolicitudes');

router.get('/', SolicitudController.getSolicitudes);

module.exports = router;
