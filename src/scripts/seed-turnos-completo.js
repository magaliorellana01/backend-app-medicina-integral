/**
 * Script para poblar turnos con pacientes asignados para todos los prestadores
 * y eliminar turnos sin pacientes
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Turno = require("../models/turno");
const Prestador = require("../models/prestador");
const Socio = require("../models/socio");
const Sede = require("../models/sede");

// Genera horarios de turnos para un día
function genSlots({ fechaISO, medicoId, sedeId, especialidad, cadaMin = 30, durMin = 30 }) {
  const out = [];
  const base = new Date(fechaISO);
  base.setHours(0, 0, 0, 0);

  const start = new Date(base);
  start.setHours(9, 0, 0, 0); // 09:00
  const end = new Date(base);
  end.setHours(17, 0, 0, 0); // 17:00 (jornada completa)

  for (let t = new Date(start); t < end; t = new Date(t.getTime() + cadaMin * 60000)) {
    out.push({
      fecha: base,
      hora: t.toISOString().slice(11, 16),
      duracion_min: durMin,
      prestador_medico_id: medicoId,
      sede_id: sedeId,
      especialidad,
    });
  }
  return out;
}

// Selecciona días laborables aleatorios del mes
function sampleDays(year, month, count, diasMes) {
  const set = new Set();
  while (set.size < count) {
    const d = Math.floor(Math.random() * diasMes) + 1;
    const dow = new Date(year, month, d).getDay(); // 0=Dom,6=Sáb
    if (dow !== 0 && dow !== 6) set.add(d);
  }
  return [...set];
}

(async () => {
  if (!process.env.MONGODB_URI) throw new Error("Falta MONGODB_URI en .env");

  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.MONGODB_DB || "test",
  });

  console.log("✅ Conectado a MongoDB\n");

  // PASO 1: Eliminar turnos sin pacientes
  console.log("🧹 PASO 1: Eliminando turnos sin pacientes asignados...");
  const resultDelete = await Turno.deleteMany({
    $or: [
      { socio_id: { $exists: false } },
      { socio_id: "" },
      { socio_id: null }
    ]
  });
  console.log(`   ❌ Eliminados: ${resultDelete.deletedCount} turnos sin pacientes\n`);

  // PASO 2: Obtener socios activos
  const socios = await Socio.find({ estado: "Activo" }).lean();
  if (socios.length === 0) {
    console.log("❌ No hay socios activos. Ejecuta primero seed-database.js");
    await mongoose.connection.close();
    return;
  }
  console.log(`👥 Socios activos encontrados: ${socios.length}\n`);

  // PASO 3: Obtener médicos activos con sus sedes
  const medicos = await Prestador.find({
    es_centro_medico: false,
    estado: /Activo/i
  }).populate('sedes').lean();

  if (!medicos.length) {
    console.log("⚠️ No hay médicos activos en la base.");
    await mongoose.connection.close();
    return;
  }

  // PASO 4: Obtener todas las sedes activas con su centro médico
  const sedesActivas = await Sede.find({ estado: "activa" }).populate('centro_medico_id').lean();

  if (!sedesActivas.length) {
    console.log("⚠️ No hay sedes activas. Ejecuta primero npm run seed-sedes");
    await mongoose.connection.close();
    return;
  }

  console.log(`👨‍⚕️ Médicos activos encontrados: ${medicos.length}`);
  console.log(`🏥 Sedes activas encontradas: ${sedesActivas.length}\n`);
  console.log("🏥 PASO 2: Generando turnos CON PACIENTES para todos los médicos...\n");

  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = hoy.getMonth(); // mes actual
  const diasMes = new Date(year, month + 1, 0).getDate();

  let totalTurnosCreados = 0;

  for (const m of medicos) {
    const especialidadMedico = m.especialidades && m.especialidades.length > 0 ? m.especialidades[0] : "General";
    console.log(`👨‍⚕️ Procesando: ${m.nombres} ${m.apellidos} (${especialidadMedico})`);

    // Determinar sede y centro del médico
    let sedeDelMedico, centroDelMedico;
    if (m.sedes && m.sedes.length > 0) {
      // Usar la primera sede del médico
      const sedeCompleta = m.sedes[0];
      sedeDelMedico = sedeCompleta._id || sedeCompleta;
      // Buscar la sede en el array de sedes activas para obtener el centro
      const sedeConCentro = sedesActivas.find(s => String(s._id) === String(sedeDelMedico));
      centroDelMedico = sedeConCentro?.centro_medico_id?._id || sedeConCentro?.centro_medico_id;
      console.log(`   📍 Sede asignada: ${sedeCompleta.nombre || 'sede del médico'}`);
    } else {
      // Usar una sede aleatoria del pool
      const sedeAleatoria = sedesActivas[Math.floor(Math.random() * sedesActivas.length)];
      sedeDelMedico = sedeAleatoria._id;
      centroDelMedico = sedeAleatoria.centro_medico_id?._id || sedeAleatoria.centro_medico_id;
      console.log(`   📍 Sede aleatoria asignada`);
    }

    // Limpiar turnos previos de este mes para este médico
    const inicioMes = new Date(year, month, 1);
    const finMes = new Date(year, month + 1, 0, 23, 59, 59, 999);
    await Turno.deleteMany({
      prestador_medico_id: m._id,
      fecha: { $gte: inicioMes, $lte: finMes },
    });

    // Seleccionar 8-12 días aleatorios de lunes a viernes
    const cantidadDias = Math.floor(Math.random() * 5) + 8; // 8-12 días
    const dias = sampleDays(year, month, cantidadDias, diasMes);

    let turnosDelMedico = 0;

    for (const d of dias) {
      const fecha = new Date(year, month, d).toISOString().slice(0, 10);
      const slots = genSlots({
        fechaISO: fecha,
        medicoId: m._id,
        sedeId: sedeDelMedico,
        especialidad: especialidadMedico,
      });

      // Asignar pacientes aleatoriamente a cada turno
      const turnosConPacientes = slots.map(slot => {
        const socio = socios[Math.floor(Math.random() * socios.length)];
        const turno = {
          ...slot,
          estado: "reservado",
          socio_id: socio.dni,
          paciente_nombre: socio.nombres,
          paciente_apellido: socio.apellidos,
        };

        // Asignar centro médico si existe
        if (centroDelMedico) {
          turno.prestador_centro_id = centroDelMedico;
        }

        return turno;
      });

      await Turno.insertMany(turnosConPacientes);
      turnosDelMedico += turnosConPacientes.length;
      totalTurnosCreados += turnosConPacientes.length;
    }

    console.log(`   ✅ ${turnosDelMedico} turnos creados (${dias.length} días)\n`);
  }

  console.log("═".repeat(80));
  console.log(`\n🎯 RESUMEN:`);
  console.log(`   📊 Total de turnos CON PACIENTES creados: ${totalTurnosCreados}`);
  console.log(`   👨‍⚕️ Médicos procesados: ${medicos.length}`);
  console.log(`   👥 Pool de pacientes: ${socios.length}`);
  console.log(`\n✅ ¡Todos los turnos ahora tienen pacientes asignados!`);
  console.log(`\n💡 Loguéate con cualquiera de estos médicos para ver turnos:`);

  // Mostrar algunos médicos de ejemplo
  medicos.slice(0, 5).forEach(m => {
    console.log(`   - ${m.nombres} ${m.apellidos}: ${m.email} / ${m.password}`);
  });

  await mongoose.connection.close();
  console.log("\n🔌 Conexión cerrada");
  process.exit(0);
})().catch(async (err) => {
  console.error("❌ Error:", err);
  try {
    await mongoose.connection.close();
  } catch {}
  process.exit(1);
});
