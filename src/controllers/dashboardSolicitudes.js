const Solicitud = require('../models/solicitud');

/**
 * Obtener estadísticas del dashboard de solicitudes
 * Query params:
 * - fechaDesde: fecha inicio (ISO)
 * - fechaHasta: fecha fin (ISO)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta } = req.query;

    if (!fechaDesde || !fechaHasta || !req.prestador._id) {
      return res.status(400).json({
        message: 'Faltan parámetros requeridos: fechaDesde, fechaHasta, prestador'
      });
    }

    // Convertir fechas
    const desde = new Date(fechaDesde);
    const hasta = new Date(fechaHasta);
    hasta.setHours(23, 59, 59, 999); // Incluir todo el día final
    // Validaciones de fechas
    if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
      return res.status(400).json({ message: 'Fechas inválidas: use formato ISO' });
    }
    if (desde > hasta) {
      return res.status(400).json({ message: 'fechaDesde no puede ser mayor que fechaHasta' });
    }

    // Construir filtro base  
    let filtroBase = {};

    filtroBase.prestadorAsignado = req.prestador._id;

    // === 1. PENDIENTES (sin filtro de fecha)
    // - Asignadas al prestador actual y no resueltas
    // - O en estado "Recibido" y aún sin asignación
    const pendientes = await Solicitud.countDocuments({
      $or: [
        {
          prestadorAsignado: req.prestador._id,
          estado: { $nin: ['Aprobado', 'Rechazado'] }
        },
        {
          estado: 'Recibido',
          prestadorAsignado: { $exists: false }
        }
      ]
    });

    // === 2. RESUELTAS en el rango de fechas ===
    const filtroResueltas = {
      ...filtroBase,
      // Considerar como resueltas si:
      // a) Hay un evento de Aprobado/Rechazado en historial dentro del rango, o
      // b) No hay evento de historial pero el estado final es Aprobado/Rechazado y la fecha de actualización cae en el rango
      $or: [
        {
          historialEstados: {
            $elemMatch: {
              estado: { $in: ['Aprobado', 'Rechazado'] },
              fecha: { $gte: desde, $lte: hasta }
            }
          }
        },
        {
          estado: { $in: ['Aprobado', 'Rechazado'] },
          $or: [
            { fechaActualizacion: { $gte: desde, $lte: hasta } },
            { updatedAt: { $gte: desde, $lte: hasta } }
          ]
        }
      ]
    };

    const solicitudesResueltas = await Solicitud.find(filtroResueltas)
      .select('estado tipo fechaCreacion fechaActualizacion updatedAt historialEstados monto')
      .lean();

    // Para consistencia, adjuntamos a cada solicitud su evento de resolución más reciente DENTRO DEL RANGO.
    // Si no hay evento en historial, usamos el estado final con fechaActualizacion/updatedAt en el rango.
    solicitudesResueltas.forEach(sol => {
      const cambiosEnRango = (sol.historialEstados || []).filter(h =>
        (h.estado === 'Aprobado' || h.estado === 'Rechazado') &&
        new Date(h.fecha) >= desde &&
        new Date(h.fecha) <= hasta
      );
      const cambioHistorialMasReciente = cambiosEnRango
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];

      if (cambioHistorialMasReciente) {
        sol.resolucionEnRango = cambioHistorialMasReciente;
        return;
      }

      // Fallback: sin historial en rango, pero el estado final es resuelto y la fecha de actualización cae en el rango
      const fechaActualizacion = sol.fechaActualizacion || sol.updatedAt;
      if (
        (sol.estado === 'Aprobado' || sol.estado === 'Rechazado') &&
        fechaActualizacion &&
        new Date(fechaActualizacion) >= desde &&
        new Date(fechaActualizacion) <= hasta
      ) {
        sol.resolucionEnRango = {
          estado: sol.estado,
          fecha: fechaActualizacion
        };
      }
    });

    const totalResueltas = solicitudesResueltas.length;

    // === 3. TIEMPO PROMEDIO DE RESOLUCIÓN ===
    let tiempoPromedioResolucion = 0;
    const TIEMPO_MAXIMO_RAZONABLE = 90; // días

    if (totalResueltas > 0) {
      let sumaDias = 0;
      let contadorConTiempo = 0;

      solicitudesResueltas.forEach(sol => {
        // Usamos el evento de resolución que ya identificamos
        const cambioResolucion = sol.resolucionEnRango;

        if (cambioResolucion && sol.fechaCreacion) {
          const fechaCreacion = new Date(sol.fechaCreacion);
          const fechaResolucion = new Date(cambioResolucion.fecha);
          const diferenciaDias = Math.round((fechaResolucion - fechaCreacion) / (1000 * 60 * 60 * 24));

          // Solo considerar tiempos razonables (0 a 90 días)
          if (diferenciaDias >= 0 && diferenciaDias <= TIEMPO_MAXIMO_RAZONABLE) {
            sumaDias += diferenciaDias;
            contadorConTiempo++;
          }
        }
      });

      tiempoPromedioResolucion = contadorConTiempo > 0
        ? Math.round(sumaDias / contadorConTiempo) // Redondeo a entero
        : 0;
    }

    // === 4. TASA DE APROBACIÓN ===
    // Usamos el estado del evento de resolución, no el estado final de la solicitud
    const aprobadas = solicitudesResueltas.filter(s => s.resolucionEnRango?.estado === 'Aprobado').length;
    const rechazadas = solicitudesResueltas.filter(s => s.resolucionEnRango?.estado === 'Rechazado').length;
    const totalCalculado = aprobadas + rechazadas;
    const tasaAprobacion = totalCalculado > 0
      ? Math.round((aprobadas / totalCalculado) * 100)
      : 0;

    // === 5. EVOLUCIÓN DIARIA ===
    const evolucionMap = new Map();

    solicitudesResueltas.forEach(sol => {
      // Usamos el evento de resolución que ya identificamos
      const cambioResolucion = sol.resolucionEnRango;

      if (cambioResolucion) {
        const fecha = new Date(cambioResolucion.fecha).toISOString().split('T')[0];

        if (!evolucionMap.has(fecha)) {
          evolucionMap.set(fecha, { fecha, aprobadas: 0, rechazadas: 0 });
        }

        const entry = evolucionMap.get(fecha);
        if (cambioResolucion.estado === 'Aprobado') {
          entry.aprobadas++;
        } else {
          entry.rechazadas++;
        }
      }
    });

    // Convertir a array y ordenar por fecha
    const evolucionDiaria = Array.from(evolucionMap.values())
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    // === 6. BREAKDOWN POR TIPO ===
    const porTipo = {
      Reintegro: { total: 0, aprobadas: 0, rechazadas: 0 },
      Autorizacion: { total: 0, aprobadas: 0, rechazadas: 0 },
      Receta: { total: 0, aprobadas: 0, rechazadas: 0 }
    };

    solicitudesResueltas.forEach(sol => {
      if (porTipo[sol.tipo] && sol.resolucionEnRango) {
        porTipo[sol.tipo].total++;
        if (sol.resolucionEnRango.estado === 'Aprobado') {
          porTipo[sol.tipo].aprobadas++;
        } else if (sol.resolucionEnRango.estado === 'Rechazado') {
          porTipo[sol.tipo].rechazadas++;
        }
      }
    });

    // === RESPUESTA FINAL ===
    res.json({
      resumen: {
        pendientes,
        resueltas: totalResueltas,
        tiempoPromedioResolucion,
        tasaAprobacion
      },
      evolucionDiaria,
      porTipo
    });

  } catch (err) {
    console.error('Error en getDashboardStats:', err);
    res.status(500).json({
      message: 'Error interno del servidor',
      error: err.message
    });
  }
};
