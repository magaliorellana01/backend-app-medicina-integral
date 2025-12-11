/**
 * SEED DE SOLICITUDES PARA DASHBOARD
 *
 * Genera solicitudes específicas para el dashboard del prestador Juan Foco (CUIT: 11111111111)
 * con historial de estados completo y fechas bien distribuidas para visualizar métricas.
 *
 * Ejecutar: npm run seed-dashboard
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Solicitud = require("../models/solicitud");
const Prestador = require("../models/prestador");
const Socio = require("../models/socio");

// Configuración
const CUIT_JUAN_FOCO = "11111111111";
const TIPOS = ["Reintegro", "Autorizacion", "Receta"];

const MOTIVOS = {
  Reintegro: [
    "Consulta médica particular",
    "Compra de medicamentos",
    "Estudios de laboratorio",
    "Radiografías y ecografías",
    "Honorarios quirúrgicos",
    "Internación de urgencia",
    "Atención odontológica",
    "Kinesiología y rehabilitación",
    "Consulta psicológica",
    "Gastos de farmacia"
  ],
  Autorizacion: [
    "Resonancia magnética cerebral",
    "Tomografía computada",
    "Cirugía programada de rodilla",
    "Tratamiento oncológico",
    "Sesiones de kinesiología",
    "Prótesis dental",
    "Implante coclear",
    "Cirugía bariátrica",
    "Tratamiento de fertilidad",
    "Internación programada"
  ],
  Receta: [
    "Medicación crónica - hipertensión",
    "Antibióticos amplio espectro",
    "Medicación controlada - ansiolíticos",
    "Insulina y tiras reactivas",
    "Medicación oncológica",
    "Anticoagulantes",
    "Medicación neurológica",
    "Corticoides",
    "Medicación cardiovascular",
    "Suplementos nutricionales especiales"
  ]
};

const PROVEEDORES = [
  "Farmacia del Pueblo",
  "Laboratorio Central",
  "Centro de Diagnóstico por Imágenes",
  "Hospital Privado San Lucas",
  "Clínica San José",
  "Farmacia Alemana",
  "Instituto de Diagnóstico",
  "Sanatorio Modelo",
  "Centro Médico Integral",
  "Laboratorio Bioanalítico"
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Genera una fecha aleatoria entre dos fechas
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Genera historial de estados realista
function generarHistorialEstados(estadoFinal, fechaCreacion, fechaResolucion, prestadorId) {
  const historial = [{
    estado: "Recibido",
    motivo: "Solicitud ingresada al sistema",
    fecha: fechaCreacion,
    usuario: null
  }];

  if (estadoFinal === "Recibido") {
    return historial;
  }

  // Transición a En Análisis (1-3 días después de creación)
  const fechaEnAnalisis = new Date(fechaCreacion.getTime() + randomInt(1, 3) * 24 * 60 * 60 * 1000);
  historial.push({
    estado: "En Análisis",
    motivo: "Solicitud asignada para revisión",
    fecha: fechaEnAnalisis,
    usuario: prestadorId
  });

  if (estadoFinal === "En Análisis") {
    return historial;
  }

  // Si termina en Observado
  if (estadoFinal === "Observado") {
    const fechaObservado = new Date(fechaEnAnalisis.getTime() + randomInt(1, 4) * 24 * 60 * 60 * 1000);
    historial.push({
      estado: "Observado",
      motivo: randomFrom([
        "Falta documentación respaldatoria",
        "Inconsistencia en los montos declarados",
        "Requiere autorización adicional",
        "Documentación ilegible",
        "Falta firma del profesional"
      ]),
      fecha: fechaObservado,
      usuario: prestadorId
    });
    return historial;
  }

  // Opcionalmente pasa por Observado antes de resolver (30% de casos)
  let ultimaFecha = fechaEnAnalisis;
  if (Math.random() < 0.3) {
    const fechaObservado = new Date(fechaEnAnalisis.getTime() + randomInt(1, 3) * 24 * 60 * 60 * 1000);
    historial.push({
      estado: "Observado",
      motivo: "Documentación en revisión",
      fecha: fechaObservado,
      usuario: prestadorId
    });
    ultimaFecha = fechaObservado;
  }

  // Estado final (Aprobado o Rechazado)
  historial.push({
    estado: estadoFinal,
    motivo: estadoFinal === "Aprobado"
      ? randomFrom([
          "Documentación completa y correcta",
          "Cumple con los requisitos de cobertura",
          "Aprobado según nomenclador vigente",
          "Autorizado por auditoría médica"
        ])
      : randomFrom([
          "No cumple con requisitos de cobertura",
          "Prestación no incluida en el plan",
          "Documentación incompleta tras observación",
          "Excede tope de cobertura anual",
          "Prestador fuera de cartilla"
        ]),
    fecha: fechaResolucion,
    usuario: prestadorId
  });

  return historial;
}

async function seedDashboardSolicitudes() {
  console.log("═".repeat(60));
  console.log("🚀 SEED DE SOLICITUDES PARA DASHBOARD");
  console.log("═".repeat(60));

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("\n✅ Conectado a MongoDB\n");

    // Buscar a Juan Foco
    const juanFoco = await Prestador.findOne({ cuit: CUIT_JUAN_FOCO });
    if (!juanFoco) {
      console.log("❌ No se encontró al prestador Juan Foco (CUIT: 11111111111)");
      console.log("   Ejecuta primero: npm run seed-demo");
      process.exit(1);
    }
    console.log(`✅ Prestador encontrado: ${juanFoco.nombres} ${juanFoco.apellidos}`);

    // Buscar socios
    const socios = await Socio.find({ estado: "Activo" }).lean();
    if (socios.length === 0) {
      console.log("❌ No hay socios activos. Ejecuta primero: npm run seed");
      process.exit(1);
    }
    console.log(`✅ Socios disponibles: ${socios.length}`);

    // Eliminar solicitudes anteriores asignadas a Juan Foco
    const eliminadas = await Solicitud.deleteMany({ prestadorAsignado: juanFoco._id });
    console.log(`🧹 Eliminadas ${eliminadas.deletedCount} solicitudes anteriores de Juan Foco`);

    // También eliminar solicitudes demo anteriores
    await Solicitud.deleteMany({ nro: { $regex: /^DASH-/ } });
    console.log("🧹 Eliminadas solicitudes DASH- anteriores");

    const hoy = new Date();
    const solicitudes = [];

    // Mapa para llevar el contador de solicitudes por socio (DNI)
    const contadorPorSocio = {};

    // Función para generar número de solicitud: DNI-secuencial
    function generarNroSolicitud(dni) {
      if (!contadorPorSocio[dni]) {
        contadorPorSocio[dni] = 0;
      }
      contadorPorSocio[dni]++;
      return `${dni}-${contadorPorSocio[dni]}`;
    }

    // =====================================================
    // GENERAR SOLICITUDES RESUELTAS (últimos 60 días)
    // =====================================================
    console.log("\n📊 Generando solicitudes resueltas...\n");

    // Distribuir 150 solicitudes resueltas en los últimos 60 días
    const cantidadResueltas = 150;

    for (let i = 0; i < cantidadResueltas; i++) {
      const socio = randomFrom(socios);
      const tipo = randomFrom(TIPOS);

      // Fecha de creación: entre 70 y 5 días atrás
      const diasAtrasCreacion = randomInt(5, 70);
      const fechaCreacion = new Date(hoy);
      fechaCreacion.setDate(fechaCreacion.getDate() - diasAtrasCreacion);
      fechaCreacion.setHours(randomInt(8, 18), randomInt(0, 59), 0, 0);

      // Tiempo de resolución: 1-15 días después de creación
      const diasResolucion = randomInt(1, 15);
      const fechaResolucion = new Date(fechaCreacion);
      fechaResolucion.setDate(fechaResolucion.getDate() + diasResolucion);

      // Asegurar que la resolución no sea en el futuro
      if (fechaResolucion > hoy) {
        fechaResolucion.setTime(hoy.getTime() - randomInt(1, 5) * 24 * 60 * 60 * 1000);
      }

      // 65% aprobadas, 35% rechazadas
      const estadoFinal = Math.random() < 0.65 ? "Aprobado" : "Rechazado";

      const nroSolicitud = generarNroSolicitud(socio.dni);

      const solicitud = {
        nro: nroSolicitud,
        afiliadoNombre: `${socio.nombres} ${socio.apellidos}`,
        afiliadoId: socio._id,
        tipo,
        estado: estadoFinal,
        motivo: randomFrom(MOTIVOS[tipo]),
        fechaCreacion,
        fechaActualizacion: fechaResolucion,
        prestadorAsignado: juanFoco._id,
        historialEstados: generarHistorialEstados(estadoFinal, fechaCreacion, fechaResolucion, juanFoco._id)
      };

      if (tipo === "Reintegro") {
        solicitud.monto = randomInt(1000, 80000);
        solicitud.proveedor = randomFrom(PROVEEDORES);
      }

      solicitud.descripcion = {
        texto: `${tipo} - ${solicitud.motivo}`,
        adjuntos: Math.random() < 0.6 ? [{
          nombreArchivo: `comprobante_${nroSolicitud.replace('-', '_')}.pdf`,
          tipoArchivo: "application/pdf",
          path: `/uploads/demo/comprobante_${nroSolicitud.replace('-', '_')}.pdf`
        }] : []
      };

      solicitudes.push(solicitud);
    }

    // =====================================================
    // GENERAR SOLICITUDES PENDIENTES (En Análisis/Observado)
    // =====================================================
    console.log("📋 Generando solicitudes pendientes...\n");

    // 25 solicitudes en análisis
    for (let i = 0; i < 25; i++) {
      const socio = randomFrom(socios);
      const tipo = randomFrom(TIPOS);

      const diasAtras = randomInt(1, 20);
      const fechaCreacion = new Date(hoy);
      fechaCreacion.setDate(fechaCreacion.getDate() - diasAtras);

      const nroSolicitud = generarNroSolicitud(socio.dni);

      const solicitud = {
        nro: nroSolicitud,
        afiliadoNombre: `${socio.nombres} ${socio.apellidos}`,
        afiliadoId: socio._id,
        tipo,
        estado: "En Análisis",
        motivo: randomFrom(MOTIVOS[tipo]),
        fechaCreacion,
        fechaActualizacion: new Date(),
        prestadorAsignado: juanFoco._id,
        historialEstados: generarHistorialEstados("En Análisis", fechaCreacion, null, juanFoco._id)
      };

      if (tipo === "Reintegro") {
        solicitud.monto = randomInt(1000, 50000);
        solicitud.proveedor = randomFrom(PROVEEDORES);
      }

      solicitudes.push(solicitud);
    }

    // 15 solicitudes observadas
    for (let i = 0; i < 15; i++) {
      const socio = randomFrom(socios);
      const tipo = randomFrom(TIPOS);

      const diasAtras = randomInt(3, 25);
      const fechaCreacion = new Date(hoy);
      fechaCreacion.setDate(fechaCreacion.getDate() - diasAtras);

      const nroSolicitud = generarNroSolicitud(socio.dni);

      const solicitud = {
        nro: nroSolicitud,
        afiliadoNombre: `${socio.nombres} ${socio.apellidos}`,
        afiliadoId: socio._id,
        tipo,
        estado: "Observado",
        motivo: randomFrom(MOTIVOS[tipo]),
        fechaCreacion,
        fechaActualizacion: new Date(),
        prestadorAsignado: juanFoco._id,
        historialEstados: generarHistorialEstados("Observado", fechaCreacion, null, juanFoco._id),
        comentariosPrestador: [{
          comentario: randomFrom([
            "Falta presentar comprobante de pago original",
            "Los montos no coinciden con la factura adjunta",
            "Documentación incompleta - falta receta médica",
            "Necesita presentar orden médica actualizada",
            "Requiere autorización del área de auditoría"
          ]),
          fecha: new Date(),
          prestador: juanFoco._id
        }]
      };

      if (tipo === "Reintegro") {
        solicitud.monto = randomInt(2000, 60000);
        solicitud.proveedor = randomFrom(PROVEEDORES);
      }

      // Agregar respuesta del socio en algunos casos
      if (Math.random() < 0.5) {
        solicitud.comentariosSocio = [{
          comentario: randomFrom([
            "Ya envié la documentación solicitada",
            "Adjunto comprobante adicional",
            "¿Podrían revisar nuevamente?",
            "El documento original fue enviado por correo"
          ]),
          fecha: new Date()
        }];
      }

      solicitudes.push(solicitud);
    }

    // =====================================================
    // GENERAR SOLICITUDES RECIBIDAS (sin asignar) - para el pool
    // =====================================================
    console.log("📥 Generando solicitudes recibidas (sin asignar)...\n");

    for (let i = 0; i < 20; i++) {
      const socio = randomFrom(socios);
      const tipo = randomFrom(TIPOS);

      const diasAtras = randomInt(0, 10);
      const fechaCreacion = new Date(hoy);
      fechaCreacion.setDate(fechaCreacion.getDate() - diasAtras);

      const nroSolicitud = generarNroSolicitud(socio.dni);

      const solicitud = {
        nro: nroSolicitud,
        afiliadoNombre: `${socio.nombres} ${socio.apellidos}`,
        afiliadoId: socio._id,
        tipo,
        estado: "Recibido",
        motivo: randomFrom(MOTIVOS[tipo]),
        fechaCreacion,
        fechaActualizacion: fechaCreacion,
        historialEstados: [{
          estado: "Recibido",
          motivo: "Solicitud ingresada al sistema",
          fecha: fechaCreacion
        }]
      };

      if (tipo === "Reintegro") {
        solicitud.monto = randomInt(500, 40000);
        solicitud.proveedor = randomFrom(PROVEEDORES);
      }

      solicitudes.push(solicitud);
    }

    // Insertar todas las solicitudes
    await Solicitud.insertMany(solicitudes);

    // =====================================================
    // ESTADÍSTICAS
    // =====================================================
    const stats = {
      total: solicitudes.length,
      porEstado: {},
      porTipo: {}
    };

    solicitudes.forEach(s => {
      stats.porEstado[s.estado] = (stats.porEstado[s.estado] || 0) + 1;
      stats.porTipo[s.tipo] = (stats.porTipo[s.tipo] || 0) + 1;
    });

    // Contar fechas únicas de resolución
    const fechasResolucion = new Set();
    solicitudes.forEach(s => {
      if (s.estado === "Aprobado" || s.estado === "Rechazado") {
        const ultimoHistorial = s.historialEstados[s.historialEstados.length - 1];
        if (ultimoHistorial) {
          fechasResolucion.add(ultimoHistorial.fecha.toISOString().split('T')[0]);
        }
      }
    });

    console.log("═".repeat(60));
    console.log("📊 RESUMEN DE SOLICITUDES GENERADAS");
    console.log("═".repeat(60));

    console.log(`\n✅ Total: ${stats.total} solicitudes\n`);

    console.log("📈 Por estado:");
    Object.entries(stats.porEstado).sort().forEach(([estado, count]) => {
      console.log(`   • ${estado}: ${count}`);
    });

    console.log("\n📋 Por tipo:");
    Object.entries(stats.porTipo).sort().forEach(([tipo, count]) => {
      console.log(`   • ${tipo}: ${count}`);
    });

    console.log(`\n📅 Fechas de resolución únicas: ${fechasResolucion.size} días distintos`);

    const aprobadas = stats.porEstado["Aprobado"] || 0;
    const rechazadas = stats.porEstado["Rechazado"] || 0;
    const tasaAprobacion = Math.round((aprobadas / (aprobadas + rechazadas)) * 100);
    console.log(`\n📊 Tasa de aprobación: ${tasaAprobacion}%`);

    console.log("\n═".repeat(60));
    console.log("🎉 SEED COMPLETADO");
    console.log("═".repeat(60));

    console.log("\n💡 Ahora podés:");
    console.log("   1. Iniciar sesión como Juan Foco:");
    console.log("      • CUIT: 11111111111");
    console.log("      • Password: 123");
    console.log("   2. Ir al dashboard de solicitudes");
    console.log("   3. Seleccionar un rango de fechas de los últimos 30-60 días");
    console.log("   4. Ver las métricas y gráficos con datos reales\n");

  } catch (error) {
    console.error("\n❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Conexión cerrada\n");
    process.exit(0);
  }
}

seedDashboardSolicitudes();
