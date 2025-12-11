const Sede = require("../models/sede");
const Prestador = require("../models/prestador");

const isCentroMedico = (req) => !!req.prestador?.es_centro_medico;

// Listar sedes (con filtros opcionales)
exports.list = async (req, res) => {
  try {
    const { centro_medico_id, estado, ciudad, provincia } = req.query;

    const query = {};
    if (centro_medico_id) query.centro_medico_id = centro_medico_id;
    if (estado) query.estado = estado;
    if (ciudad) query.ciudad = ciudad;
    if (provincia) query.provincia = provincia;

    // Si el usuario es un centro médico, solo puede ver sus propias sedes
    if (isCentroMedico(req)) {
      query.centro_medico_id = req.prestador._id;
    }

    const sedes = await Sede.find(query)
      .populate("centro_medico_id", "nombres apellidos")
      .sort({ nombre: 1 });

    res.json(sedes);
  } catch (error) {
    console.error("Error al listar sedes:", error);
    res.status(500).json({ message: "Error al obtener sedes" });
  }
};

// Obtener sede por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const sede = await Sede.findById(id).populate("centro_medico_id", "nombres apellidos");

    if (!sede) {
      return res.status(404).json({ message: "Sede no encontrada" });
    }

    // Verificar autorización si es centro médico
    if (isCentroMedico(req)) {
      if (String(sede.centro_medico_id._id) !== String(req.prestador._id)) {
        return res.status(403).json({ message: "No autorizado" });
      }
    }

    res.json(sede);
  } catch (error) {
    console.error("Error al obtener sede:", error);
    res.status(500).json({ message: "Error al obtener sede" });
  }
};

// Crear nueva sede
exports.create = async (req, res) => {
  try {
    const {
      nombre,
      direccion,
      ciudad,
      provincia,
      telefono,
      email,
      horario_apertura,
      horario_cierre,
      centro_medico_id,
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !direccion || !ciudad || !provincia) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    // Determinar el centro médico
    let centroId = centro_medico_id;

    // Si el usuario es centro médico, usar su propio ID
    if (isCentroMedico(req)) {
      centroId = req.prestador._id;
    } else if (!centro_medico_id) {
      return res.status(400).json({ message: "centro_medico_id es requerido" });
    }

    // Verificar que el centro médico existe
    const centroMedico = await Prestador.findById(centroId);
    if (!centroMedico || !centroMedico.es_centro_medico) {
      return res.status(400).json({ message: "Centro médico no válido" });
    }

    // Crear sede
    const sede = await Sede.create({
      nombre,
      direccion,
      ciudad,
      provincia,
      telefono,
      email,
      horario_apertura,
      horario_cierre,
      centro_medico_id: centroId,
    });

    // Agregar sede al array de sedes del centro médico
    await Prestador.findByIdAndUpdate(centroId, {
      $addToSet: { sedes: sede._id },
    });

    res.status(201).json(sede);
  } catch (error) {
    console.error("Error al crear sede:", error);
    res.status(500).json({ message: "Error al crear sede" });
  }
};

// Actualizar sede
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};

    const allowedFields = [
      "nombre",
      "direccion",
      "ciudad",
      "provincia",
      "telefono",
      "email",
      "horario_apertura",
      "horario_cierre",
      "estado",
    ];

    allowedFields.forEach((field) => {
      if (field in req.body) {
        updates[field] = req.body[field];
      }
    });

    const sede = await Sede.findById(id);
    if (!sede) {
      return res.status(404).json({ message: "Sede no encontrada" });
    }

    // Verificar autorización si es centro médico
    if (isCentroMedico(req)) {
      if (String(sede.centro_medico_id) !== String(req.prestador._id)) {
        return res.status(403).json({ message: "No autorizado" });
      }
    }

    const sedeActualizada = await Sede.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    res.json(sedeActualizada);
  } catch (error) {
    console.error("Error al actualizar sede:", error);
    res.status(500).json({ message: "Error al actualizar sede" });
  }
};

// Eliminar sede (cambiar estado a inactiva)
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const sede = await Sede.findById(id);
    if (!sede) {
      return res.status(404).json({ message: "Sede no encontrada" });
    }

    // Verificar autorización si es centro médico
    if (isCentroMedico(req)) {
      if (String(sede.centro_medico_id) !== String(req.prestador._id)) {
        return res.status(403).json({ message: "No autorizado" });
      }
    }

    // Cambiar estado a inactiva en lugar de eliminar
    sede.estado = "inactiva";
    await sede.save();

    res.json({ message: "Sede desactivada correctamente" });
  } catch (error) {
    console.error("Error al eliminar sede:", error);
    res.status(500).json({ message: "Error al eliminar sede" });
  }
};

// Asignar médico a sede
exports.asignarMedico = async (req, res) => {
  try {
    const { sedeId, medicoId } = req.body;

    if (!sedeId || !medicoId) {
      return res.status(400).json({ message: "sedeId y medicoId son requeridos" });
    }

    const sede = await Sede.findById(sedeId);
    if (!sede) {
      return res.status(404).json({ message: "Sede no encontrada" });
    }

    const medico = await Prestador.findById(medicoId);
    if (!medico || medico.es_centro_medico) {
      return res.status(400).json({ message: "Médico no válido" });
    }

    // Verificar autorización
    if (isCentroMedico(req)) {
      if (String(sede.centro_medico_id) !== String(req.prestador._id)) {
        return res.status(403).json({ message: "No autorizado" });
      }
    }

    // Agregar sede al array de sedes del médico
    await Prestador.findByIdAndUpdate(medicoId, {
      $addToSet: { sedes: sedeId },
    });

    res.json({ message: "Médico asignado a sede correctamente" });
  } catch (error) {
    console.error("Error al asignar médico:", error);
    res.status(500).json({ message: "Error al asignar médico" });
  }
};

// Desasignar médico de sede
exports.desasignarMedico = async (req, res) => {
  try {
    const { sedeId, medicoId } = req.body;

    if (!sedeId || !medicoId) {
      return res.status(400).json({ message: "sedeId y medicoId son requeridos" });
    }

    const sede = await Sede.findById(sedeId);
    if (!sede) {
      return res.status(404).json({ message: "Sede no encontrada" });
    }

    // Verificar autorización
    if (isCentroMedico(req)) {
      if (String(sede.centro_medico_id) !== String(req.prestador._id)) {
        return res.status(403).json({ message: "No autorizado" });
      }
    }

    // Remover sede del array de sedes del médico
    await Prestador.findByIdAndUpdate(medicoId, {
      $pull: { sedes: sedeId },
    });

    res.json({ message: "Médico desasignado de sede correctamente" });
  } catch (error) {
    console.error("Error al desasignar médico:", error);
    res.status(500).json({ message: "Error al desasignar médico" });
  }
};
