const mongoose = require("mongoose");

const prestadorSchema = new mongoose.Schema({
  nombres: {
    type: String,
    required: true,
  },
  apellidos: {
    type: String,
    required: false,
    default: "",
  },
  telefono: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  direccion: {
    type: String,
    required: false,
  },
  ciudad: {
    type: String,
    required: false,
  },
  provincia: {
    type: String,
    required: false,
  },
  especialidades: {
    type: [String],
    required: true,
    default: [],
  },
  cuit: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^\d{11}$/.test(v);
      },
      message: "El CUIT debe tener exactamente 11 dígitos",
    },
  },
  password: {
    type: String,
    required: false,
  },
  matricula: {
    type: String,
    required: true,
    unique: true,
  },
  es_centro_medico: {
    type: Boolean,
    default: false,
  },
  estado: {
    type: String,
    enum: ["Activo", "Inactivo"],
    default: "Activo",
  },
  // Sedes asociadas al prestador:
  // - Si es centro médico: sedes que le pertenecen
  // - Si es médico: sedes donde trabaja
  sedes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sede"
  }],
  fecha_creacion: {
    type: Date,
    default: Date.now,
  },
  fecha_actualizacion: {
    type: Date,
    default: Date.now,
  },
});

const PrestadorModel = mongoose.model("Prestador", prestadorSchema);

module.exports = PrestadorModel;