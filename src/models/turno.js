const { Schema, model, Types } = require("mongoose");

const NotaSchema = new Schema({
  ts: { type: Date, default: Date.now },
  texto: { type: String, required: true },
  autor_id: { type: Types.ObjectId, ref: "Prestador" },
}, { _id: false });

const TurnoSchema = new Schema({
  fecha: { type: Date, required: true },          // solo día
  hora:  { type: String, required: true },        // "HH:mm"
  duracion_min: { type: Number, default: 30 },
  estado: { type: String, enum: ["disponible","reservado","cancelado"], default: "disponible" },

  prestador_medico_id: { type: Types.ObjectId, ref: "Prestador", required: true }, // médico que atiende
  prestador_centro_id: { type: Types.ObjectId, ref: "Prestador" }, // centro médico dueño del turno (si aplica)
  sede_id: { type: Types.ObjectId, ref: "Sede" }, // sede donde se realiza el turno
  especialidad: { type: String },

  socio_id: { type: String },          // opcional - número de afiliado
  paciente_nombre: { type: String },   // opcional
  paciente_apellido: { type: String }, // opcional

  notas: [NotaSchema],
}, { timestamps: true });

TurnoSchema.index({ prestador_medico_id: 1, fecha: 1 });
TurnoSchema.index({ prestador_centro_id: 1, fecha: 1 });
TurnoSchema.index({ sede_id: 1, fecha: 1 });
TurnoSchema.index({ fecha: 1, hora: 1 });

module.exports = model("Turno", TurnoSchema);
