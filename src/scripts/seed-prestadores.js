const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Importar modelos
const PrestadorModel = require("../models/prestador");

// Configurar dotenv
dotenv.config();

// =========================================================================
// DATOS ESTATICO PARA GENERACIÓN
// =========================================================================

const especialidades = [
  "Cardiología",
  "Dermatología",
  "Pediatría",
  "Ginecología",
  "Traumatología",
  "Neurología",
  "Oftalmología",
  "Gastroenterología",
  "Psiquiatría",
  "Endocrinología",
  "Urología",
  "Otorrinolaringología",
  "Medicina General",
  "Radiología",
  "Anestesiología",
  "Cirugía General",
  "Oncología",
  "Neumología",
  "Reumatología",
  "Infectología",
];

const nombres = [
  "Carlos", "María", "Juan", "Ana", "Roberto", "Patricia", "José", "Laura", "Luis", "Carmen",
  "Miguel", "Isabel", "Antonio", "Teresa", "Francisco", "Rosa", "Alejandro", "Mónica", "Rafael", "Elena",
  "Fernando", "Silvia", "Eduardo", "Pilar", "Jorge", "Mercedes", "Diego", "Esperanza", "Alberto", "Gloria",
  "Sergio", "Beatriz", "Raúl", "Dolores", "Andrés", "Cristina", "Javier", "Amparo", "Óscar", "Remedios",
];

const apellidos = [
  "García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Martín",
  "Jiménez", "Ruiz", "Hernández", "Díaz", "Moreno", "Muñoz", "Álvarez", "Romero", "Alonso", "Gutiérrez",
  "Navarro", "Torres", "Domínguez", "Vázquez", "Ramos", "Gil", "Ramírez", "Serrano", "Blanco", "Suárez",
  "Molina", "Morales", "Ortega", "Delgado", "Castro", "Ortiz", "Rubio", "Marín", "Sanz", "Iglesias",
];

const ciudades = [
  "Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "Tucumán", "Mar del Plata", "Salta",
  "Santa Fe", "San Juan", "Resistencia", "Neuquén", "Santiago del Estero", "Corrientes", "Posadas",
];

const provincias = [
  "Buenos Aires", "Córdoba", "Santa Fe", "Mendoza", "Tucumán", "Salta", "Entre Ríos", "Misiones", "Chaco",
  "San Juan", "Jujuy", "Río Negro", "Neuquén", "Chubut", "Santa Cruz", "Tierra del Fuego", "La Pampa",
  "Santiago del Estero", "Corrientes", "Catamarca", "La Rioja", "Formosa",
];

const calles = [
  "Av. Corrientes", "San Martín", "Belgrano", "Rivadavia", "Mitre", "Sarmiento", "Alsina", "Moreno",
  "Urquiza", "Av. 9 de Julio", "Independencia", "25 de Mayo", "Alem", "Pellegrini", "Maipú",
  "Tucumán", "Santa Fe", "Córdoba",
];

// Nombres de clínicas y centros médicos
const nombresClinicas = [
  "Clínica Mitre", "Sanatorio Modelo", "Centro Médico San Lucas", "Clínica del Sol", "Hospital Privado Central",
  "Sanatorio Belgrano", "Centro de Salud Integral", "Clínica Santa María", "Instituto Médico del Sur", "Clínica Regional",
];

// =========================================================================
// FUNCIONES AUXILIARES DE GENERACIÓN
// =========================================================================

// Función para generar CUIT de 11 dígitos
function generarCUIT() {
  let cuit = "";
  for (let i = 0; i < 11; i++) {
    cuit += Math.floor(Math.random() * 10);
  }
  return cuit;
}

// Función para generar matrícula (letras + números)
function generarMatricula() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let matricula = "";

  const numLetras = Math.floor(Math.random() * 2) + 2; // 2 o 3 letras
  const numDigitos = Math.floor(Math.random() * 3) + 4; // 4, 5 o 6 números

  for (let i = 0; i < numLetras; i++) {
    matricula += letras.charAt(Math.floor(Math.random() * letras.length));
  }

  for (let i = 0; i < numDigitos; i++) {
    matricula += Math.floor(Math.random() * 10);
  }

  return matricula;
}

// Función para generar teléfono
function generarTelefono() {
  const codigo = Math.floor(Math.random() * 900) + 100;
  const numero = Math.floor(Math.random() * 9000000) + 1000000;
  return `+54 ${codigo} ${numero}`;
}

// Función para generar email profesional
function generarEmailProfesional(nombres, apellidos, especialidad) {
  const nombre = nombres.toLowerCase().replace(/\s+/g, "");
  const apellido = apellidos.toLowerCase().replace(/\s+/g, "");
  const especialidadCorta = especialidad.toLowerCase().replace(/\s+/g, "");

  const dominios = ["medicos.com.ar", "salud.gov.ar", "hospital.com", "clinica.com.ar"];
  const dominio = dominios[Math.floor(Math.random() * dominios.length)];

  const opciones = [
    `dr.${nombre}${apellido}@${dominio}`,
    `${nombre}.${apellido}@${dominio}`,
    `${apellido}${especialidadCorta}@${dominio}`,
    `dr${apellido}@${dominio}`,
  ];

  return opciones[Math.floor(Math.random() * opciones.length)];
}

// Función para generar dirección
function generarDireccion() {
  const calle = calles[Math.floor(Math.random() * calles.length)];
  const numero = Math.floor(Math.random() * 9999) + 1;
  const piso = Math.random() > 0.6 ? `, Piso ${Math.floor(Math.random() * 20) + 1}` : "";
  return `${calle} ${numero}${piso}`;
}

// Función para generar contraseña simple
function generarPassword() {
  return `medico${Math.floor(Math.random() * 9999) + 1000}`;
}

/**
 * Nota: La función generarSedesParaCentro ha sido eliminada.
 */


// Función para generar la lista inicial de prestadores (datos simples)
function generarPrestadores(cantidad) {
  const prestadores = [];
  const cuitsUsados = new Set();
  const matriculasUsadas = new Set();

  for (let i = 0; i < cantidad; i++) {
    let cuit, matricula;

    // Generar CUIT único
    do {
      cuit = generarCUIT();
    } while (cuitsUsados.has(cuit));
    cuitsUsados.add(cuit);

    // Generar matrícula única
    do {
      matricula = generarMatricula();
    } while (matriculasUsadas.has(matricula));
    matriculasUsadas.add(matricula);

    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
    const esCentroMedico = Math.random() > 0.85; // 15% chance de ser centro médico

    // Generar especialidades según tipo
    let especialidadesPrestador;
    if (esCentroMedico) {
      // Centros médicos: 3-6 especialidades aleatorias
      const numEspecialidades = Math.floor(Math.random() * 4) + 3; // 3-6
      const especialidadesSet = new Set();
      while (especialidadesSet.size < numEspecialidades && especialidadesSet.size < especialidades.length) {
        const esp = especialidades[Math.floor(Math.random() * especialidades.length)];
        especialidadesSet.add(esp);
      }
      especialidadesPrestador = Array.from(especialidadesSet);
    } else {
      // Médicos: 1 especialidad
      const especialidad = especialidades[Math.floor(Math.random() * especialidades.length)];
      especialidadesPrestador = [especialidad];
    }

    // Para centros médicos usar nombres de clínicas, para médicos usar nombres de personas
    let nombrePrestador, apellidoPrestador, emailPrestador;
    if (esCentroMedico) {
      const nombreClinica = nombresClinicas[Math.floor(Math.random() * nombresClinicas.length)];
      nombrePrestador = nombreClinica;
      apellidoPrestador = "";
      // Email profesional para clínica
      const clinicaCorta = nombreClinica.toLowerCase().replace(/\s+/g, "").replace(/clínica|sanatorio|centro|hospital|instituto/gi, "");
      emailPrestador = `info@${clinicaCorta}.com.ar`;
    } else {
      nombrePrestador = nombre;
      apellidoPrestador = apellido;
      emailPrestador = generarEmailProfesional(nombre, apellido, especialidadesPrestador[0]);
    }

    const prestador = {
      nombres: nombrePrestador,
      apellidos: apellidoPrestador,
      telefono: generarTelefono(),
      email: emailPrestador,
      direccion: generarDireccion(),
      ciudad: ciudades[Math.floor(Math.random() * ciudades.length)],
      provincia: provincias[Math.floor(Math.random() * provincias.length)],
      especialidades: especialidadesPrestador,
      cuit: cuit,
      password: generarPassword(),
      matricula: matricula,
      es_centro_medico: esCentroMedico,
      estado: "Activo",
    };

    prestadores.push(prestador);
  }

  return prestadores;
}

// =========================================================================
// FUNCIÓN PRINCIPAL
// =========================================================================

async function poblarPrestadores() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Conectado a MongoDB");

    // Limpiar colección de Prestadores
    console.log("🧹 Limpiando colección: Prestadores...");
    await PrestadorModel.deleteMany({});
    // await SedeModel.deleteMany({}); // ¡LIMPIEZA DE SEDES ELIMINADA!
    console.log("🧹 Limpieza de Prestadores completa.");

    // Generar prestadores
    const cantidadPrestadores = 30;
    console.log(`\n🏥 Generando ${cantidadPrestadores} prestadores...`);
    const prestadores = generarPrestadores(cantidadPrestadores);

    let centrosMedicosCreados = 0;
    // let totalSedesCreadas = 0; // ¡VARIABLE ELIMINADA!

    // Crear prestadores en la base de datos
    for (let i = 0; i < prestadores.length; i++) {
      const prestadorData = prestadores[i];
      const prestadorCreado = await PrestadorModel.create(prestadorData);

      const tipo = prestadorData.es_centro_medico ? "Centro Médico" : "Médico";
      let nombreCompleto;

      if (prestadorData.es_centro_medico) {
        centrosMedicosCreados++;
        
        /*
        // LÓGICA DE CREACIÓN Y ASIGNACIÓN DE SEDES ELIMINADA
        const sedesData = generarSedesParaCentro(prestadorCreado._id, prestadorCreado.nombres);
        const sedesCreadas = await SedeModel.insertMany(sedesData);
        
        const sedeIds = sedesCreadas.map(s => s._id);
        await PrestadorModel.findByIdAndUpdate(prestadorCreado._id, {
          $set: { sedes: sedeIds }
        });
        
        totalSedesCreadas += sedeIds.length;
        console.log(`   └> 🏢 Creadas y asignadas ${sedeIds.length} sede(s).`);
        */
        
        nombreCompleto = prestadorCreado.nombres;
        console.log(
          `✅ ${tipo} creado: ${nombreCompleto} (CUIT: ${prestadorCreado.cuit})`
        );

      } else {
        nombreCompleto = `Dr. ${prestadorCreado.nombres} ${prestadorCreado.apellidos}`;
        const especialidadesStr = prestadorCreado.especialidades.join(", ");
        console.log(
          `✅ ${tipo} creado: ${nombreCompleto} - [${especialidadesStr}] (Matrícula: ${prestadorCreado.matricula})`
        );
      }
    }

    console.log(`\n🎉 ¡Proceso completado exitosamente!`);
    console.log(`📊 Se crearon ${cantidadPrestadores} prestadores.`);
    console.log(`🏢 Centros médicos: ${centrosMedicosCreados}`);
    console.log(`🏥 Médicos individuales: ${cantidadPrestadores - centrosMedicosCreados}`);
    // console.log(`📍 TOTAL Sedes creadas: ${totalSedesCreadas}`); // ¡LOG DE SEDES ELIMINADO!

  } catch (error) {
    console.error("❌ Error al poblar prestadores:", error);
    if (error.code === 11000) {
      console.error("💡 Error de duplicado: CUIT o matrícula ya existe. Intente limpiar antes.");
    }
  } finally {
    // Cerrar la conexión
    await mongoose.connection.close();
    console.log("🔌 Conexión a MongoDB cerrada");
    process.exit(0);
  }
}

// Ejecutar el script
console.log("🚀 Iniciando creación de prestadores...");
poblarPrestadores();