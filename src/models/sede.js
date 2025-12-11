const { Schema, model, Types } = require("mongoose");

const SedeSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  direccion: {
    type: String,
    required: true,
  },
  ciudad: {
    type: String,
    required: true,
  },
  provincia: {
    type: String,
    required: true,
  },
  telefono: {
    type: String,
  },
  email: {
    type: String,
  },
  horario_apertura: {
    type: String,
    default: "08:00",
  },
  horario_cierre: {
    type: String,
    default: "20:00",
  },
  centro_medico_id: {
    type: Types.ObjectId,
    ref: "Prestador",
    required: true,
  },
  estado: {
    type: String,
    enum: ["activa", "inactiva"],
    default: "activa",
  },
}, { timestamps: true });

// Índices para optimizar búsquedas
SedeSchema.index({ centro_medico_id: 1 });
SedeSchema.index({ estado: 1 });
SedeSchema.index({ ciudad: 1 });

module.exports = model("Sede", SedeSchema);
