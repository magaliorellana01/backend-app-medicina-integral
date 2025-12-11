const Turno = require("../models/turno");
const Socio = require("../models/socio");
const Nota = require("../models/nota");
const Prestador = require("../models/prestador");
const { startOfDay, endOfDay, addMinutes, parseISO, format } = require("date-fns");

const isCentro = (req) => !!req.prestador?.es_centro_medico;

exports.list = async (req, res) => {
  const { fecha, medicoId, sedeId, estado, desde, hasta, especialidad } = req.query;

  const q = {};
  if (fecha) {
    const d = parseISO(fecha);
    q.fecha = { $gte: startOfDay(d), $lte: endOfDay(d) };
  }
  if (desde || hasta) {
    q.fecha = {
      ...(q.fecha || {}),
      ...(desde ? { $gte: startOfDay(parseISO(desde)) } : {}),
      ...(hasta ? { $lte: endOfDay(parseISO(hasta)) } : {}),
    };
  }
  if (estado) q.estado = estado;
  if (medicoId) q.prestador_medico_id = medicoId;
  if (sedeId) q.sede_id = sedeId;
  if (especialidad) q.especialidad = especialidad;

  // Autorización: filtrar por ownership
  if (isCentro(req)) {
    // Centro médico ve turnos donde él es el owner
    q.prestador_centro_id = req.prestador._id;
  } else {
    // Médico ve turnos donde él es el que atiende
    q.prestador_medico_id = req.prestador._id;
  }

  const items = await Turno.find(q)
    .populate('notas.autor_id', 'nombres apellidos especialidades')
    .populate('sede_id', 'nombre direccion ciudad')
    .populate('prestador_medico_id', 'nombres apellidos')
    .sort({ fecha: 1, hora: 1 });
  res.json(items);
};

exports.createSlots = async (req, res) => {
  const {
    medicoId, sedeId, fecha, desdeHora, hastaHora,
    intervaloMin = 30, duracionMin = 30, especialidad
  } = req.body;

  // Permisos
  if (!isCentro(req) && String(req.prestador._id) !== String(medicoId)) {
    return res.status(403).json({ message: "No autorizado" });
  }

  const day = parseISO(fecha);
  const start = parseISO(`${fecha}T${desdeHora}:00.000Z`);
  const end   = parseISO(`${fecha}T${hastaHora}:00.000Z`);

  const docs = [];
  for (let t = start; t < end; t = addMinutes(t, intervaloMin)) {
    const doc = {
      fecha: day,
      hora: format(t, "HH:mm"),
      duracion_min: duracionMin,
      estado: "disponible",
      prestador_medico_id: medicoId,
      sede_id: sedeId || undefined,
      especialidad,
    };

    // Si quien crea es un centro médico, asignar ownership
    if (isCentro(req)) {
      doc.prestador_centro_id = req.prestador._id;
    }

    docs.push(doc);
  }
  const created = await Turno.insertMany(docs);
  res.status(201).json({ count: created.length });
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const patch = {};
  const allowed = ["estado","socio_id","paciente_nombre","paciente_apellido","prestador_medico_id","sede_id"];
  for (const k of allowed) if (k in req.body) patch[k] = req.body[k];

  const t = await Turno.findById(id);
  if (!t) return res.status(404).json({ message: "No encontrado" });

  // Autorización
  if (isCentro(req)) {
    // Centro médico puede editar turnos donde él es el owner
    if (String(t.prestador_centro_id) !== String(req.prestador._id)) {
      return res.status(403).json({ message: "No autorizado" });
    }
  } else {
    // Médico puede editar turnos donde él es el que atiende
    if (String(t.prestador_medico_id) !== String(req.prestador._id)) {
      return res.status(403).json({ message: "No autorizado" });
    }
  }

  Object.assign(t, patch);
  await t.save();
  res.json(t);
};

exports.addNota = async (req, res) => {
  const { id } = req.params;
  const { texto } = req.body;
  if (!texto) return res.status(400).json({ message: "texto requerido" });

  const t = await Turno.findById(id);
  if (!t) return res.status(404).json({ message: "No encontrado" });

  // mismo control de autorización que update
  if (isCentro(req)) {
    // Centro médico puede agregar notas donde él es el owner
    if (String(t.prestador_centro_id) !== String(req.prestador._id)) {
      return res.status(403).json({ message: "No autorizado" });
    }
  } else if (String(t.prestador_medico_id) !== String(req.prestador._id)) {
    // Médico puede agregar notas donde él es el que atiende
    return res.status(403).json({ message: "No autorizado" });
  }

  // 1. Guardar nota en el array del turno
  t.notas.push({ texto, autor_id: req.prestador._id });
  await t.save();

  // 2. Dual storage: Guardar también en colección Nota para historia clínica
  if (t.socio_id) {
    try {
      const socio = await Socio.findOne({ dni: t.socio_id }).select('historia_clinica');

      if (socio && socio.historia_clinica) {
        await Nota.create({
          nota: texto,
          socio: socio._id,
          historia_clinica: socio.historia_clinica,
          prestador: req.prestador._id,
          fecha_creacion: new Date(),
        });
      }
    } catch (err) {
      console.error("Error al guardar nota en historia clínica:", err);
      // No bloqueamos la respuesta, la nota ya está en el turno
    }
  }

  res.status(201).json({ ok: true });
};

exports.getEspecialidades = async (req, res) => {
  const { sedeId } = req.query;

  const q = {};

  // Autorización: filtrar según rol
  if (isCentro(req)) {
    // Centro médico ve especialidades de sus turnos
    q.prestador_centro_id = req.prestador._id;
  } else {
    // Médico ve especialidades de sus turnos
    q.prestador_medico_id = req.prestador._id;
  }

  // Filtro adicional por sede si se proporciona
  if (sedeId) {
    q.sede_id = sedeId;
  }

  try {
    const especialidades = await Turno.distinct('especialidad', q);
    // Filtrar nulls/undefined y ordenar alfabéticamente
    const especialidadesLimpias = especialidades
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    res.json(especialidadesLimpias);
  } catch (error) {
    console.error("Error obteniendo especialidades:", error);
    res.status(500).json({ message: "Error al obtener especialidades" });
  }
};
