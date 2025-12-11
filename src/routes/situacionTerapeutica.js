const express = require("express");
const {
    getSituacionTerapeuticaById,
    getSituacionesTerapeuticasByMultipleEntries,
    updateSituacionTerapeutica,
    agregarNovedad,
    createSituacionTerapeutica,
    darDeBajaSituacionTerapeutica,
    getSituacionesTerapeuticasBySocioId
} = require("../controllers/situacionTerapeutica");

const router = express.Router();

router.get("/search", getSituacionesTerapeuticasByMultipleEntries);

router.get("/socio/:socioId", getSituacionesTerapeuticasBySocioId);

router.get("/:id", getSituacionTerapeuticaById); 

router.put("/:id", updateSituacionTerapeutica);

router.post("/", createSituacionTerapeutica);

router.post("/:situacionTerapeuticaId/novedades", agregarNovedad);

router.put('/:situacionTerapeuticaId/finalizar', darDeBajaSituacionTerapeutica);

module.exports = router;