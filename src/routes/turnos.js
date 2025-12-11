const router = require("express").Router();
const ctrl = require("../controllers/turnos");
const { verifyTokenMiddleware } = require("../middlewares/authMiddleware");

router.use(verifyTokenMiddleware);

router.get("/", ctrl.list);                      // ?fecha=YYYY-MM-DD&medicoId=&centroId=&estado=
router.get("/especialidades", ctrl.getEspecialidades); // ?sedeId=xxx
router.post("/slots", ctrl.createSlots);         // generar agenda por rango
router.patch("/:id", ctrl.update);               // cambiar estado / asignar socio
router.post("/:id/notas", ctrl.addNota);         // agregar nota

module.exports = router;
