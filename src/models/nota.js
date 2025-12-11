const mongoose = require("mongoose");

const notaSchema = new mongoose.Schema({
  nota: {
    type: String,
    required: false,
  },
  socio: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "Socio",
  },
  historia_clinica: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "HistoriaClinica",
  },
  prestador: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "Prestador",
  },
  fecha_creacion: {
    type: Date,
    default: Date.now,
  },
  fecha_actualizacion: {
    type: Date,
    default: Date.now,
  },
});

const NotaModel = mongoose.model("Nota", notaSchema);

module.exports = NotaModel;