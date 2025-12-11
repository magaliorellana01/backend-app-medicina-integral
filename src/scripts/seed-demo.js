/**
 * SEED DE DEMO COMPLETO
 *
 * Este script crea datos completos para testing y demo:
 * - 1 Médico individual (Dr. Martín Demo)
 * - 1 Centro Médico con 10 médicos asociados
 * - 5 Sedes del centro médico
 * - Muchos turnos (disponibles, reservados, cancelados)
 * - Muchas solicitudes (todos los estados y tipos)
 * - Situaciones terapéuticas
 *
 * NO BORRA datos existentes de otros seeds.
 *
 * Ejecutar: npm run seed-demo
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

// Importar modelos
const Prestador = require("../models/prestador");
const Sede = require("../models/sede");
const Turno = require("../models/turno");
const Socio = require("../models/socio");
const Solicitud = require("../models/solicitud");
const SituacionTerapeutica = require("../models/situacionTerapeutica");

// =========================================================================
// CONFIGURACIÓN DE DATOS DE DEMO
// =========================================================================

// Credenciales fáciles de recordar para login
const MEDICO_DEMO = {
  nombres: "Martín",
  apellidos: "Demo García",
  telefono: "+54 11 5555-0001",
  email: "dr.martin.demo@medicina.com",
  direccion: "Av. Corrientes 1234, Piso 5",
  ciudad: "Buenos Aires",
  provincia: "Buenos Aires",
  especialidades: ["Cardiología", "Clínica Médica", "Medicina Interna"],
  cuit: "11111111111",
  password: "123",
  matricula: "MN-DEMO-001",
  es_centro_medico: false,
  estado: "Activo"
};

const CENTRO_MEDICO_DEMO = {
  nombres: "Centro Médico Integral San Martín",
  apellidos: "",
  telefono: "+54 11 4444-0000",
  email: "info@centrosanmartin.com.ar",
  direccion: "Av. San Martín 5000",
  ciudad: "Buenos Aires",
  provincia: "Buenos Aires",
  especialidades: [
    "Cardiología",
    "Dermatología",
    "Pediatría",
    "Ginecología",
    "Traumatología",
    "Neurología",
    "Medicina General",
    "Oftalmología"
  ],
  cuit: "22222222222",
  password: "123",
  matricula: "CM-DEMO-001",
  es_centro_medico: true,
  estado: "Activo"
};

// Médicos que trabajan en el centro
const MEDICOS_DEL_CENTRO = [
  { nombres: "Ana", apellidos: "López Fernández", especialidades: ["Cardiología"], cuit: "20333333331", matricula: "MN-ANA-001" },
  { nombres: "Carlos", apellidos: "Rodríguez Pérez", especialidades: ["Dermatología"], cuit: "20333333332", matricula: "MN-CAR-002" },
  { nombres: "María", apellidos: "González Silva", especialidades: ["Pediatría"], cuit: "20333333333", matricula: "MN-MAR-003" },
  { nombres: "Roberto", apellidos: "Martínez Ruiz", especialidades: ["Ginecología"], cuit: "20333333334", matricula: "MN-ROB-004" },
  { nombres: "Laura", apellidos: "Sánchez Díaz", especialidades: ["Traumatología"], cuit: "20333333335", matricula: "MN-LAU-005" },
  { nombres: "Diego", apellidos: "Fernández Castro", especialidades: ["Neurología"], cuit: "20333333336", matricula: "MN-DIE-006" },
  { nombres: "Cecilia", apellidos: "Álvarez Moreno", especialidades: ["Medicina General"], cuit: "20333333337", matricula: "MN-CEC-007" },
  { nombres: "Javier", apellidos: "Torres Giménez", especialidades: ["Oftalmología"], cuit: "20333333338", matricula: "MN-JAV-008" },
  { nombres: "Patricia", apellidos: "Romero Luna", especialidades: ["Cardiología", "Medicina General"], cuit: "20333333339", matricula: "MN-PAT-009" },
  { nombres: "Fernando", apellidos: "Acosta Vega", especialidades: ["Pediatría", "Medicina General"], cuit: "20333333340", matricula: "MN-FER-010" }
];

// Sedes del centro médico
const SEDES_DEMO = [
  {
    nombre: "Sede Central - Microcentro",
    direccion: "Av. San Martín 5000",
    ciudad: "Buenos Aires",
    provincia: "Buenos Aires",
    telefono: "+54 11 4444-1111",
    email: "central@centrosanmartin.com.ar",
    horario_apertura: "07:00",
    horario_cierre: "21:00"
  },
  {
    nombre: "Sede Norte - Belgrano",
    direccion: "Av. Cabildo 2500",
    ciudad: "Buenos Aires",
    provincia: "Buenos Aires",
    telefono: "+54 11 4444-2222",
    email: "norte@centrosanmartin.com.ar",
    horario_apertura: "08:00",
    horario_cierre: "20:00"
  },
  {
    nombre: "Sede Sur - Avellaneda",
    direccion: "Av. Mitre 750",
    ciudad: "Avellaneda",
    provincia: "Buenos Aires",
    telefono: "+54 11 4444-3333",
    email: "sur@centrosanmartin.com.ar",
    horario_apertura: "08:00",
    horario_cierre: "18:00"
  },
  {
    nombre: "Sede Este - La Plata",
    direccion: "Calle 7 N° 1234",
    ciudad: "La Plata",
    provincia: "Buenos Aires",
    telefono: "+54 221 444-4444",
    email: "este@centrosanmartin.com.ar",
    horario_apertura: "09:00",
    horario_cierre: "19:00"
  },
  {
    nombre: "Sede Oeste - Morón",
    direccion: "Av. Rivadavia 18500",
    ciudad: "Morón",
    provincia: "Buenos Aires",
    telefono: "+54 11 4444-5555",
    email: "oeste@centrosanmartin.com.ar",
    horario_apertura: "08:00",
    horario_cierre: "20:00"
  }
];

// Datos para solicitudes
const TIPOS_SOLICITUD = ["Reintegro", "Autorizacion", "Receta"];
const ESTADOS_SOLICITUD = ["Recibido", "En Análisis", "Observado", "Aprobado", "Rechazado"];

const MOTIVOS_SOLICITUD = {
  Reintegro: [
    "Consulta médica particular",
    "Compra de medicamentos",
    "Estudios de laboratorio",
    "Radiografías",
    "Honorarios quirúrgicos",
    "Internación"
  ],
  Autorizacion: [
    "Resonancia magnética",
    "Tomografía computada",
    "Cirugía programada",
    "Tratamiento oncológico",
    "Kinesiología",
    "Prótesis dental"
  ],
  Receta: [
    "Medicación crónica",
    "Antibióticos",
    "Medicación controlada",
    "Insulina",
    "Medicación oncológica"
  ]
};

const COMENTARIOS_SOCIO = [
  "Adjunto comprobante de pago",
  "Necesito que revisen urgente",
  "Ya envié la documentación solicitada",
  "¿Cuánto demora la aprobación?",
  "Adjunto receta médica actualizada",
  "El médico indicó tratamiento urgente"
];

const COMENTARIOS_PRESTADOR = [
  "Falta comprobante fiscal",
  "Documentación incompleta",
  "Requiere autorización del auditor",
  "Aprobado según nomenclador vigente",
  "El monto excede el tope de cobertura",
  "Necesita orden médica actualizada"
];

// Diagnósticos para situaciones terapéuticas
const DIAGNOSTICOS = [
  "Hipertensión arterial esencial",
  "Diabetes mellitus tipo 2",
  "Lumbalgia crónica",
  "Artrosis de rodilla",
  "Hipotiroidismo",
  "Asma bronquial",
  "Trastorno de ansiedad generalizada",
  "Gastritis crónica",
  "Migraña sin aura",
  "Síndrome del túnel carpiano"
];

const TRATAMIENTOS = [
  "Control periódico y medicación",
  "Fisioterapia 3 veces por semana",
  "Dieta y ejercicio físico",
  "Medicación y seguimiento mensual",
  "Terapia cognitivo-conductual",
  "Nebulizaciones según necesidad",
  "Infiltraciones periódicas",
  "Rehabilitación kinésica"
];

// =========================================================================
// FUNCIONES AUXILIARES
// =========================================================================

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generarFechaAleatoria(diasAtras, diasAdelante = 0) {
  const hoy = new Date();
  const desde = new Date(hoy);
  desde.setDate(desde.getDate() - diasAtras);
  const hasta = new Date(hoy);
  hasta.setDate(hasta.getDate() + diasAdelante);

  return new Date(desde.getTime() + Math.random() * (hasta.getTime() - desde.getTime()));
}

function generarHorasUnicas(horaMin = 8, horaMax = 18, cantidad = 8) {
  const horas = [];
  for (let h = horaMin; h <= horaMax; h++) {
    horas.push(`${h.toString().padStart(2, "0")}:00`);
    horas.push(`${h.toString().padStart(2, "0")}:30`);
  }
  // Mezclar y tomar las primeras 'cantidad'
  return horas.sort(() => 0.5 - Math.random()).slice(0, cantidad);
}

// =========================================================================
// FUNCIONES DE CREACIÓN
// =========================================================================

async function crearPrestadoresDemo() {
  console.log("\n📋 CREANDO PRESTADORES DE DEMO...\n");

  const prestadoresCreados = {
    medicoIndividual: null,
    centroMedico: null,
    medicosCentro: []
  };

  // 1. Crear médico individual
  try {
    // Verificar si ya existe
    let medico = await Prestador.findOne({ cuit: MEDICO_DEMO.cuit });
    if (medico) {
      // Actualizar especialidades si ya existe
      medico = await Prestador.findByIdAndUpdate(
        medico._id,
        { especialidades: MEDICO_DEMO.especialidades },
        { new: true }
      );
      console.log(`⚠️  Médico demo ya existe: ${medico.nombres} ${medico.apellidos}`);
      console.log(`   📋 Especialidades actualizadas: ${medico.especialidades.join(", ")}`);
      prestadoresCreados.medicoIndividual = medico;
    } else {
      medico = await Prestador.create(MEDICO_DEMO);
      console.log(`✅ Médico individual creado: Dr. ${medico.nombres} ${medico.apellidos}`);
      console.log(`   📧 Email: ${medico.email}`);
      console.log(`   🔑 CUIT: ${medico.cuit} | Password: 123`);
      console.log(`   📋 Especialidades: ${medico.especialidades.join(", ")}`);
      prestadoresCreados.medicoIndividual = medico;
    }
  } catch (error) {
    console.error("❌ Error creando médico individual:", error.message);
  }

  // 2. Crear centro médico
  try {
    let centro = await Prestador.findOne({ cuit: CENTRO_MEDICO_DEMO.cuit });
    if (centro) {
      console.log(`\n⚠️  Centro médico demo ya existe: ${centro.nombres}`);
      prestadoresCreados.centroMedico = centro;
    } else {
      centro = await Prestador.create(CENTRO_MEDICO_DEMO);
      console.log(`\n✅ Centro médico creado: ${centro.nombres}`);
      console.log(`   📧 Email: ${centro.email}`);
      console.log(`   🔑 CUIT: ${centro.cuit} | Password: 123`);
      prestadoresCreados.centroMedico = centro;
    }
  } catch (error) {
    console.error("❌ Error creando centro médico:", error.message);
  }

  // 3. Crear médicos del centro
  console.log(`\n👨‍⚕️ Creando ${MEDICOS_DEL_CENTRO.length} médicos del centro...\n`);

  for (const medicoData of MEDICOS_DEL_CENTRO) {
    try {
      let medico = await Prestador.findOne({ cuit: medicoData.cuit });
      if (medico) {
        console.log(`   ⚠️  Ya existe: Dr. ${medico.nombres} ${medico.apellidos}`);
        prestadoresCreados.medicosCentro.push(medico);
      } else {
        const nuevoMedico = await Prestador.create({
          ...medicoData,
          telefono: `+54 11 ${randomInt(4000, 4999)}-${randomInt(1000, 9999)}`,
          email: `dr.${medicoData.nombres.toLowerCase()}.${medicoData.apellidos.split(" ")[0].toLowerCase()}@centrosanmartin.com.ar`,
          direccion: "Av. San Martín 5000",
          ciudad: "Buenos Aires",
          provincia: "Buenos Aires",
          password: `medico${medicoData.cuit.slice(-4)}`,
          es_centro_medico: false,
          estado: "Activo"
        });
        console.log(`   ✅ Dr. ${nuevoMedico.nombres} ${nuevoMedico.apellidos} - ${nuevoMedico.especialidades.join(", ")}`);
        prestadoresCreados.medicosCentro.push(nuevoMedico);
      }
    } catch (error) {
      console.error(`   ❌ Error creando médico ${medicoData.nombres}:`, error.message);
    }
  }

  console.log(`\n📊 Total médicos del centro: ${prestadoresCreados.medicosCentro.length}`);
  return prestadoresCreados;
}

async function crearSedesDemo(centroMedico, medicosCentro, medicoIndividual) {
  console.log("\n🏥 CREANDO SEDES...\n");

  const sedesCentro = [];
  const sedesMedicoIndividual = [];

  // =============================================
  // 1. SEDES DEL CENTRO MÉDICO
  // =============================================
  console.log("   📍 Sedes del Centro Médico:");

  // Eliminar sedes anteriores de este centro específico
  await Sede.deleteMany({ centro_medico_id: centroMedico._id });

  for (const sedeData of SEDES_DEMO) {
    try {
      const sede = await Sede.create({
        ...sedeData,
        centro_medico_id: centroMedico._id,
        estado: "activa"
      });
      sedesCentro.push(sede);
      console.log(`      ✅ ${sede.nombre} - ${sede.ciudad}`);
    } catch (error) {
      console.error(`      ❌ Error creando sede ${sedeData.nombre}:`, error.message);
    }
  }

  // Actualizar centro médico con las sedes
  await Prestador.findByIdAndUpdate(centroMedico._id, {
    sedes: sedesCentro.map(s => s._id)
  });
  console.log(`\n   ✅ Centro médico actualizado con ${sedesCentro.length} sedes`);

  // Asignar médicos del centro a sedes (cada médico trabaja en 1-3 sedes)
  console.log("\n   👨‍⚕️ Asignando médicos del centro a sedes:\n");

  for (const medico of medicosCentro) {
    const numSedes = randomInt(1, 3);
    const sedesAsignadas = [...sedesCentro]
      .sort(() => 0.5 - Math.random())
      .slice(0, numSedes);

    await Prestador.findByIdAndUpdate(medico._id, {
      sedes: sedesAsignadas.map(s => s._id)
    });

    const nombresSedesCortos = sedesAsignadas.map(s => s.nombre.replace("Sede ", "").split(" - ")[0]);
    console.log(`      ✅ Dr. ${medico.nombres} ${medico.apellidos} → ${nombresSedesCortos.join(", ")}`);
  }

  // =============================================
  // 2. SEDES DEL MÉDICO INDIVIDUAL (Consultorios propios)
  // =============================================
  console.log("\n   📍 Consultorios del Médico Individual:");

  // Eliminar sedes anteriores del médico individual (si las hubiera creado como "centro")
  // Nota: El médico individual no es centro, así que sus sedes no tienen centro_medico_id
  // Usamos un identificador especial o simplemente las creamos sin centro_medico_id

  const sedesMedicoData = [
    {
      nombre: "Consultorio Palermo",
      direccion: "Av. Santa Fe 3500",
      ciudad: "Buenos Aires",
      provincia: "Buenos Aires",
      telefono: "+54 11 5555-1001",
      email: "palermo@drmartindemo.com",
      horario_apertura: "09:00",
      horario_cierre: "18:00"
    },
    {
      nombre: "Consultorio Belgrano",
      direccion: "Av. Cabildo 1800",
      ciudad: "Buenos Aires",
      provincia: "Buenos Aires",
      telefono: "+54 11 5555-1002",
      email: "belgrano@drmartindemo.com",
      horario_apertura: "14:00",
      horario_cierre: "20:00"
    },
    {
      nombre: "Consultorio San Isidro",
      direccion: "Av. Centenario 500",
      ciudad: "San Isidro",
      provincia: "Buenos Aires",
      telefono: "+54 11 5555-1003",
      email: "sanisidro@drmartindemo.com",
      horario_apertura: "08:00",
      horario_cierre: "14:00"
    }
  ];

  // Eliminar sedes anteriores del médico individual
  // Como no es centro médico, buscamos por nombre que contenga "Consultorio"
  await Sede.deleteMany({
    nombre: { $regex: /^Consultorio (Palermo|Belgrano|San Isidro)$/ }
  });

  for (const sedeData of sedesMedicoData) {
    try {
      // Crear sede sin centro_medico_id (es del médico individual)
      const sede = await Sede.create({
        ...sedeData,
        centro_medico_id: medicoIndividual._id, // Usamos el ID del médico como referencia
        estado: "activa"
      });
      sedesMedicoIndividual.push(sede);
      console.log(`      ✅ ${sede.nombre} - ${sede.ciudad}`);
    } catch (error) {
      console.error(`      ❌ Error creando sede ${sedeData.nombre}:`, error.message);
    }
  }

  // Asignar sedes al médico individual
  await Prestador.findByIdAndUpdate(medicoIndividual._id, {
    sedes: sedesMedicoIndividual.map(s => s._id)
  });
  console.log(`\n   ✅ Dr. ${medicoIndividual.nombres} ${medicoIndividual.apellidos} → ${sedesMedicoIndividual.length} consultorios asignados`);

  return {
    sedesCentro,
    sedesMedicoIndividual
  };
}

async function crearTurnosDemo(medicoIndividual, medicosCentro, centroMedico, sedes) {
  console.log("\n📅 CREANDO TURNOS DE DEMO...\n");

  // Obtener socios existentes
  const socios = await Socio.find({ estado: "Activo" }).lean();
  if (socios.length === 0) {
    console.log("⚠️  No hay socios. Ejecuta primero: npm run seed");
    return [];
  }

  console.log(`   👥 Socios disponibles: ${socios.length}`);

  // Eliminar turnos anteriores de los prestadores demo
  const prestadoresDemo = [medicoIndividual._id, ...medicosCentro.map(m => m._id)];
  await Turno.deleteMany({ prestador_medico_id: { $in: prestadoresDemo } });
  console.log("   🧹 Turnos anteriores de demo eliminados");

  // Obtener médicos del centro ACTUALIZADOS con sus sedes (después de asignación)
  const medicosCentroActualizados = await Prestador.find({
    _id: { $in: medicosCentro.map(m => m._id) }
  }).populate("sedes").lean();

  const medicosConSedes = medicosCentroActualizados.filter(m => m.sedes && m.sedes.length > 0);
  console.log(`   👨‍⚕️ Médicos del centro con sedes asignadas: ${medicosConSedes.length}\n`);

  const turnosCreados = [];
  const hoy = new Date();

  // Generar fechas: 15 días atrás hasta 30 días adelante
  const fechas = [];
  for (let i = -15; i <= 30; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() + i);
    // Solo días de semana
    if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
      fechas.push(fecha);
    }
  }

  // 1. Turnos para el médico individual (con sus consultorios propios)
  const sedesMedicoIndividual = sedes.sedesMedicoIndividual || [];
  console.log(`   📅 Generando turnos para Dr. ${medicoIndividual.nombres} ${medicoIndividual.apellidos} (${sedesMedicoIndividual.length} consultorios)...`);

  for (const fecha of fechas.slice(0, 25)) { // 25 días
    const horasDelDia = generarHorasUnicas(9, 17, randomInt(6, 10));
    // Elegir un consultorio aleatorio para este día
    const sedeDelDia = sedesMedicoIndividual.length > 0
      ? randomFrom(sedesMedicoIndividual)
      : null;

    // Elegir UNA especialidad para todo el día (más realista)
    const especialidadDelDia = randomFrom(medicoIndividual.especialidades || ["Cardiología"]);

    for (const hora of horasDelDia) {
      const estado = randomFrom(["disponible", "disponible", "reservado", "reservado", "reservado", "cancelado"]);
      const fechaLimpia = new Date(fecha);
      fechaLimpia.setHours(0, 0, 0, 0);

      const turnoData = {
        fecha: fechaLimpia,
        hora,
        duracion_min: 30,
        estado,
        prestador_medico_id: medicoIndividual._id,
        especialidad: especialidadDelDia
      };

      // Asignar sede si existe
      if (sedeDelDia) {
        turnoData.sede_id = sedeDelDia._id;
      }

      // Si está reservado, asignar paciente
      if (estado === "reservado") {
        const socio = randomFrom(socios);
        turnoData.socio_id = socio.dni;
        turnoData.paciente_nombre = socio.nombres;
        turnoData.paciente_apellido = socio.apellidos;
      }

      turnosCreados.push(turnoData);
    }
  }

  console.log(`      ✅ ${turnosCreados.length} turnos generados`);

  // Insertar turnos del médico individual primero
  const turnosMedicoIndividual = turnosCreados.length;
  if (turnosCreados.length > 0) {
    await Turno.insertMany(turnosCreados);
    console.log(`      ✅ Insertados en ${sedesMedicoIndividual.length} consultorios`);
  }

  // 2. Turnos para médicos del centro (con sede y centro asignado)
  let turnosCentro = 0;
  const turnosCentroArray = [];

  for (const medico of medicosCentroActualizados) {
    const sedesTrabajo = medico.sedes || [];

    if (sedesTrabajo.length === 0) {
      console.log(`   ⚠️  Dr. ${medico.nombres} ${medico.apellidos} no tiene sedes asignadas, saltando...`);
      continue;
    }

    console.log(`   📅 Generando turnos para Dr. ${medico.nombres} ${medico.apellidos} (${sedesTrabajo.length} sedes)...`);

    let turnosDelMedico = 0;

    // Solo generar para algunos días (no todos, para no saturar)
    const fechasParaMedico = fechas.filter(() => Math.random() < 0.6); // 60% de los días

    for (const fecha of fechasParaMedico) {
      // Elegir una sede aleatoria donde trabaja
      const sede = randomFrom(sedesTrabajo);
      const horasDelDia = generarHorasUnicas(8, 18, randomInt(4, 8));
      const fechaLimpia = new Date(fecha);
      fechaLimpia.setHours(0, 0, 0, 0);

      for (const hora of horasDelDia) {
        const estado = randomFrom(["disponible", "disponible", "reservado", "reservado", "reservado", "cancelado"]);

        const turnoData = {
          fecha: new Date(fechaLimpia),
          hora,
          duracion_min: 30,
          estado,
          prestador_medico_id: medico._id,
          prestador_centro_id: centroMedico._id,
          sede_id: sede._id,
          especialidad: medico.especialidades[0]
        };

        if (estado === "reservado") {
          const socio = randomFrom(socios);
          turnoData.socio_id = socio.dni;
          turnoData.paciente_nombre = socio.nombres;
          turnoData.paciente_apellido = socio.apellidos;

          // Agregar notas a algunos turnos reservados
          if (Math.random() < 0.3) {
            turnoData.notas = [{
              ts: new Date(),
              texto: randomFrom([
                "Paciente llegó puntual",
                "Control de rutina",
                "Solicita estudios complementarios",
                "Derivar a especialista",
                "Próximo control en 30 días"
              ]),
              autor_id: medico._id
            }];
          }
        }

        turnosCentroArray.push(turnoData);
        turnosCentro++;
        turnosDelMedico++;
      }
    }
    console.log(`      ✅ ${turnosDelMedico} turnos generados`);
  }

  // Insertar turnos del centro
  if (turnosCentroArray.length > 0) {
    await Turno.insertMany(turnosCentroArray);
    console.log(`\n   ✅ Insertados ${turnosCentroArray.length} turnos de médicos del centro`);
  }

  const totalTurnos = turnosMedicoIndividual + turnosCentro;

  console.log(`\n   📊 Resumen de turnos:`);
  console.log(`      - Médico individual: ${turnosMedicoIndividual}`);
  console.log(`      - Médicos del centro: ${turnosCentro}`);
  console.log(`      - TOTAL: ${totalTurnos}`);

  // Estadísticas por estado
  const todosTurnos = [...turnosCreados, ...turnosCentroArray];
  const porEstado = {
    disponible: todosTurnos.filter(t => t.estado === "disponible").length,
    reservado: todosTurnos.filter(t => t.estado === "reservado").length,
    cancelado: todosTurnos.filter(t => t.estado === "cancelado").length
  };
  console.log(`\n   📈 Por estado:`);
  console.log(`      - Disponibles: ${porEstado.disponible}`);
  console.log(`      - Reservados: ${porEstado.reservado}`);
  console.log(`      - Cancelados: ${porEstado.cancelado}`);

  return turnosCreados;
}

async function crearSolicitudesDemo(prestadores) {
  console.log("\n📝 CREANDO SOLICITUDES DE DEMO...\n");

  const socios = await Socio.find({ estado: "Activo" }).lean();
  if (socios.length === 0) {
    console.log("⚠️  No hay socios para crear solicitudes");
    return [];
  }

  const todosPrestadores = [
    prestadores.medicoIndividual,
    prestadores.centroMedico,
    ...prestadores.medicosCentro
  ].filter(p => p);

  const solicitudesCreadas = [];

  // Crear entre 80-120 solicitudes
  const cantidadSolicitudes = randomInt(80, 120);
  console.log(`   📄 Generando ${cantidadSolicitudes} solicitudes...\n`);

  for (let i = 0; i < cantidadSolicitudes; i++) {
    const socio = randomFrom(socios);
    const tipo = randomFrom(TIPOS_SOLICITUD);
    const estado = randomFrom(ESTADOS_SOLICITUD);
    const fechaCreacion = generarFechaAleatoria(90, 0); // Últimos 90 días

    const solicitud = {
      nro: `${Date.now()}-${i}`,
      afiliadoNombre: `${socio.nombres} ${socio.apellidos}`,
      afiliadoId: socio._id,
      tipo,
      estado,
      motivo: randomFrom(MOTIVOS_SOLICITUD[tipo]),
      fechaCreacion,
      fechaActualizacion: new Date()
    };

    // Asignar monto para reintegros
    if (tipo === "Reintegro") {
      solicitud.monto = randomInt(500, 50000);
      solicitud.proveedor = randomFrom([
        "Farmacia del Pueblo",
        "Laboratorio Central",
        "Centro de Diagnóstico",
        "Hospital Privado",
        "Clínica San José"
      ]);
    }

    // Asignar prestador a solicitudes que no están en "Recibido"
    if (estado !== "Recibido" && todosPrestadores.length > 0) {
      solicitud.prestadorAsignado = randomFrom(todosPrestadores)._id;
    }

    // Agregar historial de estados
    solicitud.historialEstados = [{
      estado: "Recibido",
      motivo: "Solicitud ingresada al sistema",
      fecha: fechaCreacion
    }];

    if (estado !== "Recibido") {
      solicitud.historialEstados.push({
        estado,
        motivo: `Cambio de estado a ${estado}`,
        fecha: new Date(fechaCreacion.getTime() + randomInt(1, 10) * 24 * 60 * 60 * 1000)
      });
    }

    // Agregar comentarios para solicitudes observadas
    if (estado === "Observado") {
      solicitud.comentariosSocio = [{
        comentario: randomFrom(COMENTARIOS_SOCIO),
        fecha: new Date(fechaCreacion.getTime() + randomInt(1, 5) * 24 * 60 * 60 * 1000)
      }];

      if (Math.random() < 0.7) {
        solicitud.comentariosPrestador = [{
          comentario: randomFrom(COMENTARIOS_PRESTADOR),
          fecha: new Date(fechaCreacion.getTime() + randomInt(1, 3) * 24 * 60 * 60 * 1000),
          prestador: solicitud.prestadorAsignado
        }];
      }
    }

    // Agregar descripción
    solicitud.descripcion = {
      texto: `Solicitud de ${tipo.toLowerCase()} - ${solicitud.motivo}`,
      adjuntos: Math.random() < 0.5 ? [{
        nombreArchivo: `documento_${i}.pdf`,
        tipoArchivo: "application/pdf",
        path: `/uploads/demo/documento_${i}.pdf`
      }] : []
    };

    solicitudesCreadas.push(solicitud);
  }

  // Insertar todas las solicitudes
  await Solicitud.insertMany(solicitudesCreadas);

  // Estadísticas
  const porTipo = {};
  const porEstado = {};

  solicitudesCreadas.forEach(s => {
    porTipo[s.tipo] = (porTipo[s.tipo] || 0) + 1;
    porEstado[s.estado] = (porEstado[s.estado] || 0) + 1;
  });

  console.log(`   📊 Por tipo:`);
  Object.entries(porTipo).forEach(([tipo, count]) => {
    console.log(`      - ${tipo}: ${count}`);
  });

  console.log(`\n   📈 Por estado:`);
  Object.entries(porEstado).forEach(([estado, count]) => {
    console.log(`      - ${estado}: ${count}`);
  });

  console.log(`\n   ✅ Total solicitudes creadas: ${solicitudesCreadas.length}`);

  return solicitudesCreadas;
}

async function crearSituacionesTerapeuticasDemo(prestadores) {
  console.log("\n🏥 CREANDO SITUACIONES TERAPÉUTICAS DE DEMO...\n");

  const socios = await Socio.find({ estado: "Activo" }).lean();
  if (socios.length === 0) {
    console.log("⚠️  No hay socios para crear situaciones terapéuticas");
    return [];
  }

  const todosMedicos = [
    prestadores.medicoIndividual,
    ...prestadores.medicosCentro
  ].filter(p => p && !p.es_centro_medico);

  const situacionesCreadas = [];
  const cantidadSituaciones = randomInt(30, 50);

  console.log(`   🩺 Generando ${cantidadSituaciones} situaciones terapéuticas...\n`);

  for (let i = 0; i < cantidadSituaciones; i++) {
    const socio = randomFrom(socios);
    const medico = randomFrom(todosMedicos);
    const activa = Math.random() < 0.7; // 70% activas
    const fechaInicio = generarFechaAleatoria(180, 0);

    const situacion = {
      socio: socio._id,
      prestador: medico._id,
      diagnostico: randomFrom(DIAGNOSTICOS),
      tratamiento: randomFrom(TRATAMIENTOS),
      fechaInicio,
      activa,
      observaciones: `Situación terapéutica generada para demo. Paciente: ${socio.nombres} ${socio.apellidos}`,
      novedadesMedicas: []
    };

    // Si está inactiva, agregar fecha de fin
    if (!activa) {
      situacion.fechaFin = new Date(fechaInicio.getTime() + randomInt(30, 120) * 24 * 60 * 60 * 1000);
    }

    // Agregar novedades médicas
    const cantidadNovedades = randomInt(1, 4);
    for (let j = 0; j < cantidadNovedades; j++) {
      situacion.novedadesMedicas.push({
        nota: randomFrom([
          "Paciente evoluciona favorablemente",
          "Se ajusta medicación",
          "Solicitar estudios de control",
          "Continuar con tratamiento actual",
          "Mejoría notable en síntomas",
          "Derivar a especialista para evaluación",
          "Control en 15 días"
        ]),
        prestador: {
          _id: medico._id,
          nombres: medico.nombres,
          apellidos: medico.apellidos,
          especialidad: medico.especialidades[0],
          cuit: medico.cuit,
          matricula: medico.matricula,
          es_centro_medico: false
        },
        fechaCreacion: new Date(fechaInicio.getTime() + j * randomInt(7, 30) * 24 * 60 * 60 * 1000)
      });
    }

    situacionesCreadas.push(situacion);
  }

  await SituacionTerapeutica.insertMany(situacionesCreadas);

  const activas = situacionesCreadas.filter(s => s.activa).length;
  const inactivas = situacionesCreadas.length - activas;

  console.log(`   ✅ Situaciones activas: ${activas}`);
  console.log(`   ✅ Situaciones finalizadas: ${inactivas}`);
  console.log(`   ✅ Total: ${situacionesCreadas.length}`);

  return situacionesCreadas;
}

// =========================================================================
// ACTUALIZAR TURNOS SIN NOMBRE DE PACIENTE
// =========================================================================

async function actualizarTurnosSinPaciente() {
  console.log("\n🔄 ACTUALIZANDO TURNOS SIN NOMBRE DE PACIENTE...\n");

  // Buscar turnos reservados sin paciente_nombre
  const turnosSinNombre = await Turno.find({
    estado: "reservado",
    socio_id: { $exists: true, $ne: null, $ne: "" },
    $or: [
      { paciente_nombre: { $exists: false } },
      { paciente_nombre: null },
      { paciente_nombre: "" }
    ]
  });

  if (turnosSinNombre.length === 0) {
    console.log("   ✅ Todos los turnos reservados tienen nombre de paciente");
    return;
  }

  console.log(`   📋 Encontrados ${turnosSinNombre.length} turnos sin nombre de paciente`);

  // Obtener todos los socios para hacer un mapa
  const socios = await Socio.find({}).lean();
  const socioMap = {};
  socios.forEach(s => {
    socioMap[s.dni] = s;
  });

  let actualizados = 0;

  for (const turno of turnosSinNombre) {
    const socio = socioMap[turno.socio_id];
    if (socio) {
      await Turno.findByIdAndUpdate(turno._id, {
        paciente_nombre: socio.nombres,
        paciente_apellido: socio.apellidos
      });
      actualizados++;
    }
  }

  console.log(`   ✅ Actualizados ${actualizados} turnos con datos del paciente`);
}

// =========================================================================
// FUNCIÓN PRINCIPAL
// =========================================================================

async function seedDemo() {
  console.log("═".repeat(60));
  console.log("🚀 INICIANDO SEED DE DEMO COMPLETO");
  console.log("═".repeat(60));

  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("\n✅ Conectado a MongoDB\n");

    // 1. Crear prestadores
    const prestadores = await crearPrestadoresDemo();

    if (!prestadores.medicoIndividual || !prestadores.centroMedico) {
      throw new Error("No se pudieron crear los prestadores principales");
    }

    // 2. Crear sedes (para centro médico y médico individual)
    const sedes = await crearSedesDemo(
      prestadores.centroMedico,
      prestadores.medicosCentro,
      prestadores.medicoIndividual
    );

    // 3. Crear turnos
    await crearTurnosDemo(
      prestadores.medicoIndividual,
      prestadores.medicosCentro,
      prestadores.centroMedico,
      sedes
    );

    // 4. Crear solicitudes
    await crearSolicitudesDemo(prestadores);

    // 5. Crear situaciones terapéuticas
    await crearSituacionesTerapeuticasDemo(prestadores);

    // 6. Actualizar turnos sin nombre de paciente (por si hay datos previos)
    await actualizarTurnosSinPaciente();

    // Resumen final
    console.log("\n" + "═".repeat(60));
    console.log("🎉 SEED DE DEMO COMPLETADO EXITOSAMENTE");
    console.log("═".repeat(60));

    console.log("\n📋 CREDENCIALES DE ACCESO:\n");

    console.log("┌─────────────────────────────────────────────────────────┐");
    console.log("│ MÉDICO INDIVIDUAL                                       │");
    console.log("├─────────────────────────────────────────────────────────┤");
    console.log(`│ CUIT: ${MEDICO_DEMO.cuit}                                │`);
    console.log(`│ Password: 123                                      │`);
    console.log(`│ Email: ${MEDICO_DEMO.email}              │`);
    console.log("└─────────────────────────────────────────────────────────┘");

    console.log("\n┌─────────────────────────────────────────────────────────┐");
    console.log("│ CENTRO MÉDICO                                           │");
    console.log("├─────────────────────────────────────────────────────────┤");
    console.log(`│ CUIT: ${CENTRO_MEDICO_DEMO.cuit}                                │`);
    console.log(`│ Password: 123                                    │`);
    console.log(`│ Email: ${CENTRO_MEDICO_DEMO.email}           │`);
    console.log("└─────────────────────────────────────────────────────────┘");

    const totalSedes = (sedes.sedesCentro?.length || 0) + (sedes.sedesMedicoIndividual?.length || 0);
    console.log("\n📊 DATOS GENERADOS:");
    console.log("   • 1 médico individual con 3 consultorios");
    console.log("   • 1 centro médico con 5 sedes");
    console.log(`   • ${prestadores.medicosCentro.length} médicos del centro`);
    console.log(`   • ${totalSedes} sedes/consultorios en total`);
    console.log("   • Cientos de turnos (disponibles, reservados, cancelados)");
    console.log("   • Decenas de solicitudes (todos los estados y tipos)");
    console.log("   • Situaciones terapéuticas activas e inactivas");

    console.log("\n💡 Ahora podés:");
    console.log("   1. Iniciar el backend: npm run dev");
    console.log("   2. Iniciar el frontend: npm run dev (en frontend-grupo5)");
    console.log("   3. Loguearte con las credenciales de arriba");
    console.log("   4. Probar el dashboard, turnos, solicitudes, etc.\n");

  } catch (error) {
    console.error("\n❌ Error en seed de demo:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Conexión a MongoDB cerrada\n");
    process.exit(0);
  }
}

// Ejecutar
seedDemo();
