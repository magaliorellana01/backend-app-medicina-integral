const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Configurar dotenv
dotenv.config();

// Importar modelos
const NotaModel = require("../models/nota");
const SocioModel = require("../models/socio");
const HistoriaClinicaModel = require("../models/historiaClinica");
const PrestadorModel = require("../models/prestador");

// Plantillas de notas médicas por tipo de consulta
const tiposDeNotas = {
  consultaGeneral: [
    "Paciente refiere estado general bueno. Sin síntomas actuales. Control de rutina realizado.",
    "Paciente presenta buen estado de salud. Se recomienda mantener hábitos saludables y controles periódicos.",
    "Consulta de control. Paciente asintomático. Se sugiere continuar con medicación actual.",
    "Revisión general sin hallazgos patológicos. Paciente en buenas condiciones generales.",
    "Control médico preventivo. Paciente refiere sentirse bien. Examen físico normal.",
  ],

  seguimientoTratamiento: [
    "Paciente en tratamiento presenta evolución favorable. Se mantiene medicación actual.",
    "Control post-tratamiento. Buena respuesta terapéutica. Continuar con indicaciones previas.",
    "Seguimiento de tratamiento iniciado. Paciente tolera bien la medicación.",
    "Control de evolución. Mejoría progresiva del cuadro clínico. Ajuste de dosis según tolerancia.",
    "Revisión de tratamiento. Respuesta satisfactoria. Se continúa con plan terapéutico.",
  ],

  nuevaSintomatologia: [
    "Paciente consulta por molestias inespecíficas de 3 días de evolución. Se indica tratamiento sintomático.",
    "Refiere dolor localizado desde hace una semana. Se solicitan estudios complementarios.",
    "Consulta por síntomas gripales. Se indica reposo y medicación sintomática.",
    "Presenta cuadro de malestar general. Se recomienda hidratación y control en 48 horas.",
    "Paciente con sintomatología compatible con proceso viral. Tratamiento de sostén.",
  ],

  resultadosEstudios: [
    "Se reciben resultados de laboratorio dentro de parámetros normales. Sin modificaciones en tratamiento.",
    "Análisis clínicos informan valores levemente alterados. Se ajusta medicación y nuevo control en 30 días.",
    "Estudios complementarios sin alteraciones significativas. Se mantiene conducta actual.",
    "Resultados de estudios por imágenes normales. Paciente puede continuar actividad habitual.",
    "Laboratorio de control muestra mejoría en parámetros. Evolución favorable del tratamiento.",
  ],

  interconsulta: [
    "Se deriva a especialista por requerimiento de evaluación específica. Cita coordinada.",
    "Interconsulta con cardiología solicitada. Paciente será evaluado la próxima semana.",
    "Derivación a especialidad por complejidad del caso. Se mantiene tratamiento actual hasta evaluación.",
    "Se solicita opinión de especialista. Paciente en lista de espera para consulta.",
    "Interconsulta programada. Se continúa seguimiento conjunto con especialidad.",
  ],

  procedimiento: [
    "Procedimiento realizado sin complicaciones. Paciente tolera bien la intervención.",
    "Se efectúa procedimiento menor en consultorio. Evolución satisfactoria inmediata.",
    "Intervención ambulatoria completada exitosamente. Indicaciones post-procedimiento entregadas.",
    "Procedimiento diagnóstico realizado. Paciente en observación por tiempo reglamentario.",
    "Técnica completada según protocolo. Se programa control post-procedimiento.",
  ],

  urgencia: [
    "Consulta de urgencia. Paciente estable al momento del alta. Control ambulatorio en 24 horas.",
    "Atención de emergencia resuelta satisfactoriamente. Se deriva para seguimiento.",
    "Cuadro agudo controlado. Paciente mejora clínicamente. Alta con medicación.",
    "Urgencia médica atendida. Evolución favorable. Se programa control estrecho.",
    "Consulta urgente por exacerbación de cuadro crónico. Ajuste terapéutico realizado.",
  ],
};

const recomendacionesComunes = [
  "Se recomienda control en 30 días.",
  "Próximo control según evolución clínica.",
  "Control programado en 15 días.",
  "Reevaluación en caso de empeoramiento.",
  "Control de rutina en 3 meses.",
  "Seguimiento telefónico en 72 horas.",
  "Control post-tratamiento en 2 semanas.",
  "Próxima consulta según necesidad.",
];

const medicamentosComunes = [
  "Paracetamol 500mg cada 8 horas",
  "Ibuprofeno 400mg cada 12 horas",
  "Amoxicilina 500mg cada 8 horas",
  "Omeprazol 20mg en ayunas",
  "Losartán 50mg por día",
  "Atorvastatina 20mg nocturna",
  "Metformina 850mg cada 12 horas",
  "Salbutamol inhalador según necesidad",
];

// Función para generar una fecha aleatoria en los últimos 6 meses
function generarFechaReciente() {
  const ahora = new Date();
  const seiseMesesAtras = new Date();
  seiseMesesAtras.setMonth(ahora.getMonth() - 6);

  const tiempoRandom =
    seiseMesesAtras.getTime() + Math.random() * (ahora.getTime() - seiseMesesAtras.getTime());
  return new Date(tiempoRandom);
}

// Función para generar nota médica completa
function generarNotaCompleta() {
  const tiposArray = Object.keys(tiposDeNotas);
  const tipoSeleccionado = tiposArray[Math.floor(Math.random() * tiposArray.length)];
  const notasDelTipo = tiposDeNotas[tipoSeleccionado];
  const notaBase = notasDelTipo[Math.floor(Math.random() * notasDelTipo.length)];

  let notaCompleta = notaBase;

  // 40% chance de agregar medicación
  if (Math.random() < 0.4) {
    const medicamento = medicamentosComunes[Math.floor(Math.random() * medicamentosComunes.length)];
    notaCompleta += ` Se indica ${medicamento}.`;
  }

  // 60% chance de agregar recomendación
  if (Math.random() < 0.6) {
    const recomendacion =
      recomendacionesComunes[Math.floor(Math.random() * recomendacionesComunes.length)];
    notaCompleta += ` ${recomendacion}`;
  }

  return notaCompleta;
}

// Función principal para poblar notas
async function poblarNotas() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Conectado a MongoDB");

    // Obtener datos existentes
    console.log("📋 Obteniendo datos existentes...");

    const socios = await SocioModel.find({});
    const historiasClinicas = await HistoriaClinicaModel.find({});
    const prestadores = await PrestadorModel.find({});

    console.log(`👥 Socios encontrados: ${socios.length}`);
    console.log(`🏥 Historias clínicas encontradas: ${historiasClinicas.length}`);
    console.log(`👨‍⚕️ Prestadores encontrados: ${prestadores.length}`);

    if (socios.length === 0 || prestadores.length === 0) {
      console.log(
        "⚠️  No se encontraron socios o prestadores. Ejecuta primero los scripts de seeding correspondientes."
      );
      return;
    }

    // Limpiar notas existentes (opcional)
    console.log("🧹 Limpiando notas existentes...");
    await NotaModel.deleteMany({});

    // Generar múltiples notas por socio
    console.log(`📝 Generando notas médicas para cada socio...`);

    const notasCreadas = [];
    let contadorNotas = 0;

    for (const socio of socios) {
      // Determinar cantidad de notas por socio
      let cantidadNotasPorSocio;

      // Socio especial con menos notas (ID 1000035)
      if (socio.dni === "1000035") {
        cantidadNotasPorSocio = Math.floor(Math.random() * 2) + 1; // 1-2 notas
        console.log(
          `📝 Generando ${cantidadNotasPorSocio} notas para ${socio.nombres} ${socio.apellidos} (menos notas)`
        );
      } else {
        cantidadNotasPorSocio = Math.floor(Math.random() * 6) + 4; // 4-9 notas por socio
        console.log(
          `📝 Generando ${cantidadNotasPorSocio} notas para ${socio.nombres} ${socio.apellidos}`
        );
      }

      for (let j = 0; j < cantidadNotasPorSocio; j++) {
        contadorNotas++;

        // Buscar historia clínica del socio actual
        let historiaClinica = historiasClinicas.find(
          (hc) => hc.socio && hc.socio.toString() === socio._id.toString()
        );

        if (!historiaClinica && historiasClinicas.length > 0) {
          historiaClinica = historiasClinicas[Math.floor(Math.random() * historiasClinicas.length)];
        }

        // Seleccionar prestador aleatorio
        const prestadorAleatorio = prestadores[Math.floor(Math.random() * prestadores.length)];

        // Generar fechas distribuidas en el tiempo para que parezcan consultas reales
        const fechaBase = generarFechaReciente();
        const diasOffset = j * Math.floor(Math.random() * 30) + Math.random() * 7; // Espaciar las notas
        const fechaNota = new Date(fechaBase.getTime() - diasOffset * 24 * 60 * 60 * 1000);

        // Generar nota
        const nuevaNota = {
          nota: generarNotaCompleta(),
          socio: socio._id,
          historia_clinica: historiaClinica ? historiaClinica._id : null,
          prestador: prestadorAleatorio._id,
          fecha_creacion: fechaNota,
          fecha_actualizacion: fechaNota,
        };

        const notaCreada = await NotaModel.create(nuevaNota);
        notasCreadas.push(notaCreada);
      }

      // Log progreso por socio
      console.log(
        `   ✅ ${cantidadNotasPorSocio} notas creadas para ${socio.nombres} ${socio.apellidos}`
      );
    }

    console.log(`\n🎉 ¡Proceso completado exitosamente!`);
    console.log(`📊 Se crearon ${contadorNotas} notas médicas para ${socios.length} socios.`);
    console.log(`📈 Promedio de ${Math.round(contadorNotas / socios.length)} notas por socio.`);

    // Estadísticas adicionales
    const notasConMedicacion = notasCreadas.filter((nota) =>
      nota.nota.includes("Se indica")
    ).length;
    const notasConControl = notasCreadas.filter(
      (nota) => nota.nota.includes("control") || nota.nota.includes("Control")
    ).length;

    console.log(`💊 Notas con medicación: ${notasConMedicacion}`);
    console.log(`📅 Notas con seguimiento: ${notasConControl}`);

    // Estadísticas por socio
    const notasPorSocio = {};
    for (const nota of notasCreadas) {
      const socioId = nota.socio.toString();
      notasPorSocio[socioId] = (notasPorSocio[socioId] || 0) + 1;
    }

    console.log(`\n📊 Distribución de notas por socio:`);
    for (const socio of socios) {
      const cantidad = notasPorSocio[socio._id.toString()] || 0;
      const esSocioEspecial = socio.dni === "1000035";
      console.log(
        `   ${socio.nombres} ${socio.apellidos}: ${cantidad} notas${ esSocioEspecial ? " (menos notas)" : ""}`
      );
    }

    // Mostrar ejemplo de notas creadas
    console.log(`\n📋 Ejemplos de notas creadas:`);
    for (let i = 0; i < Math.min(3, notasCreadas.length); i++) {
      const nota = notasCreadas[i];
      console.log(`\n${i + 1}. "${nota.nota}"`);
      console.log(`   📅 Fecha: ${nota.fecha_creacion.toLocaleDateString("es-ES")}`);
    }
  } catch (error) {
    console.error("❌ Error al poblar notas:", error);

    if (error.name === "ValidationError") {
      console.error("💡 Error de validación. Verifica que los datos de referencia existan.");
    }
  } finally {
    // Cerrar la conexión
    await mongoose.connection.close();
    console.log("🔌 Conexión a MongoDB cerrada");
    process.exit(0);
  }
}

// Ejecutar el script
console.log("🚀 Iniciando creación de notas médicas...");
poblarNotas();