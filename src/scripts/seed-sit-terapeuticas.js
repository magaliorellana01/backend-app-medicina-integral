const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Configurar dotenv
dotenv.config();

// Importar modelos
const SocioModel = require("../models/socio");
const PrestadorModel = require("../models/prestador");
const SituacionTerapeuticaModel = require("../models/situacionTerapeutica");

// Listas para generar datos
const diagnosticos = [
    "Hipertensión arterial",
    "Diabetes mellitus tipo 2",
    "Asma bronquial",
    "Trastorno de ansiedad",
    "Lumbalgia crónica",
    "Gastritis crónica",
    "Migraña",
    "Hipotiroidismo"
];

const tratamientos = [
    "Tratamiento farmacológico estándar",
    "Plan de dieta y ejercicio",
    "Control clínico periódico",
    "Terapia cognitivo-conductual",
    "Fisioterapia y analgésicos",
    "Inhibidores de bomba de protones",
    "Beta-agonistas a demanda",
    "Reposición hormonal"
];

function elegirAleatorio(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
}

function generarFechas() {
    const ahora = new Date();
    const inicio = new Date(ahora.getTime() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000);
    const enCurso = Math.random() < 0.7; // 70% siguen activas
    const fin = enCurso ? null : new Date(inicio.getTime() + Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000);
    return { inicio, fin };
}

async function poblarSituacionesTerapeuticas() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("✅ Conectado a MongoDB");

        // Obtener datos existentes
        const socios = await SocioModel.find({});
        const prestadores = await PrestadorModel.find({});
        // La consulta a SedeModel ha sido eliminada

        console.log(`👥 Socios encontrados: ${socios.length}`);
        console.log(`👨‍⚕️ Prestadores encontrados: ${prestadores.length}`);
        // console.log(`📍 Sedes encontradas: ${sedes.length}`); // Log de sedes eliminado

        if (socios.length === 0 || prestadores.length === 0) {
            console.log("⚠️ No se encontraron socios o prestadores. Ejecuta primero los scripts de seeding correspondientes.");
            return;
        }

        /*
        // La verificación de existencia de sedes ha sido eliminada
        if (sedes.length === 0) { 
            console.log("⚠️ No hay sedes creadas. Ejecute el seed de prestadores y sedes primero.");
            return;
        }
        */

        // Limpiar situaciones anteriores (opcional)
        console.log("🧹 Limpiando situaciones terapéuticas existentes...");
        await SituacionTerapeuticaModel.deleteMany({});

        console.log("🩺 Generando situaciones terapéuticas...");

        const totalPorSocioMin = 1;
        const totalPorSocioMax = 3; // 1 a 3 situaciones por socio

        let creadas = 0;

        for (const socio of socios) {
            const cantidad = Math.floor(Math.random() * (totalPorSocioMax - totalPorSocioMin + 1)) + totalPorSocioMin;

            for (let i = 0; i < cantidad; i++) {
                const prestador = prestadores[Math.floor(Math.random() * prestadores.length)];
                const { inicio, fin } = generarFechas();
                // const randomSedeId = elegirAleatorio(sedes)._id; // ASIGNACIÓN DE SEDE ELIMINADA

                const situacion = {
                    socio: socio._id,
                    prestador: prestador._id,
                    diagnostico: elegirAleatorio(diagnosticos),
                    tratamiento: elegirAleatorio(tratamientos),
                    fechaInicio: inicio,
                    fechaFin: fin,
                    // sede: randomSedeId, // <-- CAMPO DE SEDE ASIGNADO ELIMINADO
                    observaciones: Math.random() < 0.5 ? "Situación generada para pruebas" : undefined,
                    novedadesMedicas: [],
                };

                await SituacionTerapeuticaModel.create(situacion);
                creadas++;
            }

            console.log(`✅ ${cantidad} situaciones creadas para ${socio.nombres} ${socio.apellidos}`);
        }

        console.log("\n🎉 ¡Proceso completado exitosamente!");
        console.log(`📊 Se crearon ${creadas} situaciones terapéuticas en total.`);
    } catch (error) {
        console.error("❌ Error al poblar situaciones terapéuticas:", error);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Conexión a MongoDB cerrada");
        process.exit(0);
    }
}

console.log("🚀 Iniciando creación de situaciones terapéuticas...");
poblarSituacionesTerapeuticas();