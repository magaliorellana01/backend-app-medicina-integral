const mongoose = require("mongoose");

const SituacionTerapeuticaSchema = new mongoose.Schema({
  socio: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Socio', 
    required: true 
  },
  prestador: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Prestador', 
    required: true 
  },
  diagnostico: { 
    type: String, 
    required: true 
  },
  tratamiento: { 
    type: String, 
    required: true 
  },
  fechaInicio: { 
    type: Date, 
    default: Date.now 
  },
  fechaFin: Date,
  activa: {
        type: Boolean,
        default: true, 
        required: true
    },
  observaciones: String,
  novedadesMedicas: [
    {
      nota: { type: String, required: true },
      prestador: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Prestador', required: true },
        nombres: { type: String, required: true },
        apellidos: { type: String, required: true },
        especialidad: { type: String, required: true },
        cuit: { type: String, required: true },
        matricula: { type: String, required: true },
        es_centro_medico: { type: Boolean, required: true },
      },
      fechaCreacion: { type: Date, default: Date.now }
    }
  ],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const SituacionTerapeutica = mongoose.model("SituacionTerapeutica", SituacionTerapeuticaSchema);

module.exports = SituacionTerapeutica;