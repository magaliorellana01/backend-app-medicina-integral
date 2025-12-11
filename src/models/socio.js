const mongoose = require("mongoose");

const socioSchema = new mongoose.Schema({
  nombres: {
    type: String,
    required: true,
  },
  apellidos: {
    type: String,
    required: true,
  },
  dni: {
    type: String,
    required: true,
    unique: true,
  },
  es_familiar_de: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Socio",
    required: false,
    default: null,
  },
  rol: {
    type: String,
    enum: ["Titular", "Familiar"],
    default: "Titular",
  },
  genero: {
    type: String,
    enum: ["Masculino", "Femenino"],
  },
  fecha_nacimiento: {
    type: Date,
    required: true,
  },
  telefono: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
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
  fecha_creacion: {
    type: Date,
    default: Date.now,
  },
  fecha_actualizacion: {
    type: Date,
    default: Date.now,
  },
  estado: {
    type: String,
    enum: ["Activo", "Inactivo"],
    default: "Activo",
  },
  historia_clinica: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "HistoriaClinica",
  },
});

const SocioModel = mongoose.model("Socio", socioSchema);

module.exports = SocioModel;