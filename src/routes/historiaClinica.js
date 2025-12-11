const express = require("express");
const {
    getHistoriasClinicasByMultipleEntries,
    getHistoriasClinicas,
    getHistoriaClinicaById,
    createHistoriaClinica,
    updateHistoriaClinica,
    deleteHistoriaClinica,
    addNotaAHC,
    searchSocios,
    getHistoriasClinicasBySocioId,
} = require("../controllers/historiaClinica.js");

const router = express.Router();
router.get("/search", getHistoriasClinicasByMultipleEntries);
router.get("/socio/:socioId", getHistoriasClinicasBySocioId);
router.get("/socios/search", searchSocios);
router.get("/", getHistoriasClinicas);
router.get("/:id", getHistoriaClinicaById);
router.post("/", createHistoriaClinica);
router.put("/:id", updateHistoriaClinica);
router.delete("/:id", deleteHistoriaClinica);

router.post("/:historiaClinicaId/notas", addNotaAHC);

module.exports = router;