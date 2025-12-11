const mongoose = require("mongoose");

const historiaClinicaSchema = new mongoose.Schema(
  {
    // ===== INFORMACIÓN BÁSICA =====
    socio: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Socio",
    },
    medico_cabecera: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Prestador",
    },
    numero_historia: {
      type: String,
      unique: true,
      required: true,
    },
    // ===== ANTECEDENTES PATOLÓGICOS PERSONALES =====
    antecedentes_patologicos: [
      {
        patologia: String,
        año_diagnostico: Number,
        estado: {
          type: String,
          enum: ["Activo", "Controlado", "Curado", "En tratamiento"],
          default: "Activo",
        },
        observaciones: String,
      },
    ],

    // ===== ANTECEDENTES FAMILIARES =====
    antecedentes_familiares: [
      {
        parentesco: {
          type: String,
          enum: [
            "Padre",
            "Madre",
            "Hermano/a",
            "Abuelo/a paterno/a",
            "Abuelo/a materno/a",
            "Tío/a",
            "Primo/a",
            "Otro",
          ],
        },
        patologia: String,
        edad_diagnostico: Number,
        observaciones: String,
      },
    ],

    // ===== ANTECEDENTES QUIRÚRGICOS =====
    antecedentes_quirurgicos: [
      {
        cirugia: String,
        fecha: Date,
        hospital: String,
        cirujano: String,
        complicaciones: String,
        observaciones: String,
      },
    ],

    // ===== ALERGIAS E INTOLERANCIAS =====
    alergias: [
      {
        tipo: {
          type: String,
          enum: ["Medicamento", "Alimento", "Ambiental", "Contacto", "Otros"],
        },
        sustancia: String,
        reaccion: String,
        gravedad: {
          type: String,
          enum: ["Leve", "Moderada", "Grave", "Mortal"],
        },
        fecha_deteccion: Date,
      },
    ],

    // ===== MEDICACIÓN HABITUAL =====
    medicacion_habitual: [
      {
        medicamento: String,
        dosis: String,
        frecuencia: String,
        via_administracion: {
          type: String,
          enum: [
            "Oral",
            "Intramuscular",
            "Intravenosa",
            "Subcutánea",
            "Tópica",
            "Inhalatoria",
            "Otras",
          ],
        },
        fecha_inicio: Date,
        medico_prescriptor: String,
        indicacion: String,
        activo: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // ===== HÁBITOS =====
    habitos: {
      tabaquismo: {
        fuma: {
          type: Boolean,
          default: false,
        },
        cigarrillos_por_dia: Number,
        años_fumando: Number,
        fecha_cese: Date,
        observaciones: String,
      },
      alcoholismo: {
        consume: {
          type: Boolean,
          default: false,
        },
        frecuencia: {
          type: String,
          enum: ["Ocasional", "Semanal", "Diario", "Varios por día"],
        },
        tipo_bebida: String,
        cantidad_semanal: Number,
        observaciones: String,
      },
      drogas: {
        consume: {
          type: Boolean,
          default: false,
        },
        tipo_droga: String,
        frecuencia: String,
        observaciones: String,
      },
      ejercicio: {
        practica: {
          type: Boolean,
          default: false,
        },
        tipo_ejercicio: String,
        frecuencia_semanal: Number,
        intensidad: {
          type: String,
          enum: ["Leve", "Moderada", "Intensa"],
        },
      },
      alimentacion: {
        tipo_dieta: {
          type: String,
          enum: [
            "Omnívora",
            "Vegetariana",
            "Vegana",
            "Sin gluten",
            "Diabética",
            "Hiposódica",
            "Otra",
          ],
        },
        observaciones: String,
      },
    },

    // ===== SIGNOS VITALES RECIENTES =====
    signos_vitales: {
      presion_sistolica: Number,
      presion_diastolica: Number,
      frecuencia_cardiaca: Number,
      temperatura: Number,
      frecuencia_respiratoria: Number,
      saturacion_oxigeno: Number,
      fecha_medicion: {
        type: Date,
        default: Date.now,
      },
    },

    // ===== DATOS ANTROPOMÉTRICOS =====
    antropometria: {
      peso: Number, // kg
      altura: Number, // cm
      imc: Number,
      perimetro_cintura: Number, // cm
      perimetro_cadera: Number, // cm
      fecha_medicion: {
        type: Date,
        default: Date.now,
      },
    },

    // ===== VACUNACIÓN =====
    vacunas: [
      {
        nombre_vacuna: String,
        fecha_aplicacion: Date,
        dosis: String, // "1ra dosis", "2da dosis", "Refuerzo", etc.
        lote: String,
        centro_vacunacion: String,
        observaciones: String,
      },
    ],

    // ===== GRUPO SANGUÍNEO =====
    grupo_sanguineo: {
      tipo: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      },
      fecha_determinacion: Date,
    },

    // ===== CONTACTO DE EMERGENCIA =====
    contacto_emergencia: {
      nombre: String,
      parentesco: String,
      telefono: String,
      direccion: String,
    },

    // ===== INFORMACIÓN GINECO-OBSTÉTRICA (si aplica) =====
    gineco_obstetrica: {
      aplica: {
        type: Boolean,
        default: false,
      },
      menarca: Number, // edad
      menopausia: {
        fecha: Date,
        natural: Boolean,
      },
      gestaciones: Number,
      partos: Number,
      cesareas: Number,
      abortos: Number,
      fecha_ultima_regla: Date,
      metodo_anticonceptivo: String,
      fecha_ultimo_papanicolau: Date,
      fecha_ultima_mamografia: Date,
    },

    // ===== ESTUDIOS COMPLEMENTARIOS RECIENTES =====
    estudios_recientes: [
      {
        tipo_estudio: {
          type: String,
          enum: [
            "Laboratorio",
            "Radiografía",
            "Ecografía",
            "Tomografía",
            "Resonancia",
            "Electrocardiograma",
            "Otros",
          ],
        },
        nombre_estudio: String,
        fecha_realizacion: Date,
        resultado_resumen: String,
        archivo_url: String, // URL del archivo si está digitalizado
        medico_solicitante: String,
        centro_realizacion: String,
      },
    ],

    // ===== DIAGNÓSTICOS ACTUALES =====
    diagnosticos_actuales: [
      {
        codigo_cie10: String,
        descripcion: String,
        tipo: {
          type: String,
          enum: ["Principal", "Secundario", "Presuntivo", "Descartado"],
        },
        fecha_diagnostico: Date,
        medico_diagnosticador: String,
        estado: {
          type: String,
          enum: ["Activo", "Controlado", "Resuelto", "En seguimiento"],
        },
      },
    ],

    // ===== INFORMACIÓN ADMINISTRATIVA =====
    obra_social: {
      nombre: String,
      dni: String,
      plan: String,
      vigencia: Date,
    },

    // ===== OBSERVACIONES GENERALES =====
    observaciones_generales: String,

    // ===== ESTADO DE LA HISTORIA =====
    estado: {
      type: String,
      enum: ["Activa", "Inactiva", "Archivada"],
      default: "Activa",
    },

    // ===== FECHAS DE CONTROL =====
    fecha_creacion: {
      type: Date,
      default: Date.now,
    },
    fecha_actualizacion: {
      type: Date,
      default: Date.now,
    },
    ultima_consulta: Date,
    proxima_cita: Date,
  },
  {
    timestamps: true, // Agrega automáticamente createdAt y updatedAt
  }
);

// Middleware para calcular IMC automáticamente
historiaClinicaSchema.pre("save", function (next) {
  if (this.antropometria && this.antropometria.peso && this.antropometria.altura) {
    const alturaEnMetros = this.antropometria.altura / 100;
    this.antropometria.imc = this.antropometria.peso / (alturaEnMetros * alturaEnMetros);
    this.antropometria.imc = Math.round(this.antropometria.imc * 100) / 100; // Redondear a 2 decimales
  }
  next();
});

// Índices para mejorar rendimiento
historiaClinicaSchema.index({ socio: 1 });
historiaClinicaSchema.index({ numero_historia: 1 });
historiaClinicaSchema.index({ medico_cabecera: 1 });
historiaClinicaSchema.index({ estado: 1 });

const HistoriaClinicaModel = mongoose.model("HistoriaClinica", historiaClinicaSchema);

module.exports = HistoriaClinicaModel;