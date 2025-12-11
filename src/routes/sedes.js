const router = require("express").Router();
const ctrl = require("../controllers/sedes");
const { verifyTokenMiddleware } = require("../middlewares/authMiddleware");

router.use(verifyTokenMiddleware);

router.get("/", ctrl.list);                          // Listar sedes
router.get("/:id", ctrl.getById);                    // Obtener sede por ID
router.post("/", ctrl.create);                       // Crear sede
router.put("/:id", ctrl.update);                     // Actualizar sede
router.delete("/:id", ctrl.delete);                  // Desactivar sede
router.post("/asignar-medico", ctrl.asignarMedico); // Asignar médico a sede
router.post("/desasignar-medico", ctrl.desasignarMedico); // Desasignar médico

module.exports = router;
