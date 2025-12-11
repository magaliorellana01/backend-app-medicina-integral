const HistoriaClinica = require("../models/historiaClinica");
const Socio = require("../models/socio");
const Nota = require("../models/nota");
const mongoose = require("mongoose");
const { buildSocioSearchFilter } = require("../utils/filters");

exports.getHistoriasClinicasByMultipleEntries = async (req, res) => {
    try {
        const { input } = req.query;

        if (!input || String(input).trim() === '') {
            return res.status(400).json({ message: "El query param 'input' es obligatorio." });
        }

        const socioFilter = buildSocioSearchFilter(input);


        const sociosEncontrados = await Socio.find(socioFilter).select('_id rol es_familiar_de');

        if (!sociosEncontrados.length) {
            return res.status(200).json([]);
        }


        const titularesIds = new Set();
        for (const socio of sociosEncontrados) {
            if (socio.rol === 'Titular') {
                titularesIds.add(socio._id.toString());
            } else if (socio.rol === 'Familiar' && socio.es_familiar_de) {
                titularesIds.add(socio.es_familiar_de.toString());
            }
        }

        if (titularesIds.size === 0) {
            return res.status(200).json([]);
        }


        const familiasIds = Array.from(titularesIds).map(id => new mongoose.Types.ObjectId(id));

        const todosLosMiembrosDeLasFamilias = await Socio.find({
            $or: [
                { _id: { $in: familiasIds } }, // Los titulares
                { es_familiar_de: { $in: familiasIds } } // Los familiares de esos titulares
            ]
        }).select('_id');

        const todosLosSocioIds = todosLosMiembrosDeLasFamilias.map(s => s._id);


        const historiasClinicas = await HistoriaClinica.find({ socio: { $in: todosLosSocioIds } })
            .select('_id socio')
            .populate({
                path: 'socio',
                select: '_id nombres apellidos dni rol es_familiar_de'
            });

        return res.status(200).json(historiasClinicas);

    } catch (error) {
        console.error('Error al obtener las historias clínicas:', error);
        res.status(500).json({
            message: error.message || "Error interno del servidor"
        });
    }
};


exports.getHistoriasClinicas = async (req, res) => {
    try {
        const historiasClinicas = await HistoriaClinica.find().populate("socio");
        res.json({ message: "Historias Clinicas obtenidas correctamente", historiasClinicas });
    } catch (error) {
        console.error("Error al obtener Historias Clínicas:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

exports.getHistoriaClinicaById = async (req, res) => {
    try {
        const historiaClinicaId = req.params.id;

        //busca la Historia Clínica por su _id de Mongoose
        const historiaClinica = await HistoriaClinica.findById(historiaClinicaId)
            .populate("socio")
            .populate("medico_cabecera");

        if (!historiaClinica) {
            return res.status(404).json({ message: "Historia Clínica no encontrada" });
        }

        // buscar todas las Notas asociadas a esta Historia Clínica
        const notas = await Nota.find({ historia_clinica: historiaClinicaId })
            .populate("prestador", "_id nombres apellidos es_centro_medico especialidades") //para saber quien hizo la nota, seleccionando solo los campos necesarios
            .sort({ fecha_creacion: -1 }); //en orden de mas reciente a mas vieja

        //combinar HHC y Notas para la respuesta
        const respuestaDetalle = {
            ...historiaClinica.toObject(),
            notas: notas,
        };

        res.json({
            message: "Detalle de Historia Clínica obtenido correctamente",
            historiaClinica: respuestaDetalle
        });

    } catch (error) {
        console.error("Error al obtener detalle de Historia Clínica:", error);
        res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

exports.createHistoriaClinica = async (req, res) => {
    try {
        const historiaClinica = await HistoriaClinica.create(req.body);
        const historiaClinicaPopulated = await HistoriaClinica.findById(historiaClinica._id).populate(
            "socio"
        );
        res.status(201).json({
            message: "Historia Clinica creada correctamente",
            historiaClinica: historiaClinicaPopulated,
        });
    } catch (error) {
        console.error("Error al crear Historia Clínica:", error);
        res.status(400).json({ message: "Error al crear la Historia Clínica", error: error.message });
    }
};

exports.updateHistoriaClinica = async (req, res) => {
    try {
        const historiaClinica = await HistoriaClinica.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        }).populate("socio");
        if (!historiaClinica) {
            return res.status(404).json({ message: "Historia Clínica no encontrada para actualizar" });
        }
        res.json({ message: "Historia Clinica actualizada correctamente", historiaClinica });
    } catch (error) {
        console.error("Error al actualizar Historia Clínica:", error);
        res.status(400).json({ message: "Error al actualizar la Historia Clínica", error: error.message });
    }
};

exports.deleteHistoriaClinica = async (req, res) => {
    try {
        const result = await HistoriaClinica.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: "Historia Clínica no encontrada para eliminar" });
        }
        res.json({ message: "Historia Clinica eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar Historia Clínica:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

//agregar nota a una historia clinica
exports.addNotaAHC = async (req, res) => {
    const { historiaClinicaId } = req.params;
    const { nota, prestadorId } = req.body;

    try {
        //verifica si la Historia Clínica existe
        const historiaClinica = await HistoriaClinica.findById(historiaClinicaId);

        if (!historiaClinica) {
            return res.status(404).json({ message: "Historia Clínica no encontrada para agregar nota" });
        }

        //crea la nueva nota
        const nuevaNota = await Nota.create({
            nota: nota,
            historia_clinica: historiaClinicaId,
            prestador: prestadorId,
            socio: historiaClinica.socio,
        });

        // opcional: Popular la nota para devolver la info completa al frontend

        const notaPopulated = await Nota.findById(nuevaNota._id).populate("prestador", "_id nombres apellidos es_centro_medico especialidades");



        res.status(201).json({

            message: "Nota agregada correctamente a la Historia Clínica",

            nota: notaPopulated,

        });



    } catch (error) {

        console.error("Error al agregar nota a Historia Clínica:", error);

        res.status(500).json({

            message: "Error interno del servidor al crear la nota.",

            error: error.message

        });

    }

};



exports.searchSocios = async (req, res) => {

    try {

        const { input } = req.query;



        if (!input || String(input).trim().length < 3) {

            // No busca si el input es muy corto para evitar resultados masivos

            return res.status(200).json([]);

        }



        const socioFilter = buildSocioSearchFilter(input);



        const sociosEncontrados = await Socio.find(socioFilter)

            .select('_id nombres apellidos dni')

            .limit(10); // Limita los resultados a 10 para el autocomplete



        if (!sociosEncontrados.length) {

            return res.status(200).json([]);

        }



        return res.status(200).json(sociosEncontrados);



    } catch (error) {

        console.error('Error al buscar socios:', error);

        res.status(500).json({

            message: error.message || "Error interno del servidor"

        });

    }

};

exports.getHistoriasClinicasBySocioId = async (req, res) => {
    try {
        const { socioId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(socioId)) {
            return res.status(400).json({ message: "El ID de socio proporcionado no es válido." });
        }

        const socio = await Socio.findById(socioId).select('_id rol es_familiar_de');

        if (!socio) {
            return res.status(404).json({ message: "Socio no encontrado." });
        }

        const titularId = socio.rol === 'Titular' ? socio._id : socio.es_familiar_de;

        if (!titularId) {
            // Esto podría pasar si es un familiar sin un titular asignado
            return res.status(200).json([]);
        }

        const familia = await Socio.find({
            $or: [
                { _id: titularId },
                { es_familiar_de: titularId }
            ]
        }).select('_id');

        const sociosIds = familia.map(s => s._id);

        const historiasClinicas = await HistoriaClinica.find({ socio: { $in: sociosIds } })
            .select('_id socio')
            .populate({
                path: 'socio',
                select: '_id nombres apellidos dni rol es_familiar_de'
            });

        return res.status(200).json(historiasClinicas);

    } catch (error) {
        console.error('Error al obtener las historias clínicas por ID de socio:', error);
        res.status(500).json({
            message: error.message || "Error interno del servidor"
        });
    }
};
