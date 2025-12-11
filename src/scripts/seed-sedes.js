const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Sede = require("../models/sede");
const Prestador = require("../models/prestador");

dotenv.config();

async function seedSedes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Conectado a MongoDB\n");

    // Buscar centros médicos (prestadores con es_centro_medico = true)
    const centrosMedicos = await Prestador.find({ es_centro_medico: true });

    if (centrosMedicos.length === 0) {
      console.log("⚠️  No se encontraron centros médicos.");
      console.log("📝 Creando un centro médico de prueba...\n");

      const centroDemo = await Prestador.create({
        nombres: "Centro Médico",
        apellidos: "San Miguel",
        especialidad: "General",
        cuit: "20123456789",
        matricula: "CM-001",
        es_centro_medico: true,
        telefono: "11-4444-5555",
        email: "centro@sanmiguel.com",
        direccion: "Av. Principal 123",
        ciudad: "Buenos Aires",
        provincia: "Buenos Aires",
        password: "$2a$10$XYZ123", // Hash de "password123"
      });

      centrosMedicos.push(centroDemo);
      console.log(`✅ Centro médico creado: ${centroDemo.nombres} ${centroDemo.apellidos}\n`);
    }

    console.log(`📍 Encontrados ${centrosMedicos.length} centro(s) médico(s)\n`);

    // Eliminar sedes existentes
    await Sede.deleteMany({});
    console.log("🗑️  Sedes anteriores eliminadas");

    // Eliminar índice único viejo de nombre si existe
    try {
      await Sede.collection.dropIndex("nombre_1");
      console.log("🗑️  Índice único de 'nombre' eliminado");
    } catch (e) {
      // El índice no existe, continuar
    }
    console.log("");

    const sedesCreadas = [];

    for (const centro of centrosMedicos) {
      console.log(`\n📌 Creando sedes para: ${centro.nombres} ${centro.apellidos}`);

      const sedesDelCentro = [
        {
          nombre: "Sede Centro",
          direccion: "Av. Corrientes 1234",
          ciudad: "Buenos Aires",
          provincia: "Buenos Aires",
          telefono: "11-4444-1111",
          email: `centro-${centro._id}@sede.com`,
          horario_apertura: "08:00",
          horario_cierre: "20:00",
          centro_medico_id: centro._id,
          estado: "activa",
        },
        {
          nombre: "Sede Norte",
          direccion: "Av. Cabildo 5678",
          ciudad: "Buenos Aires",
          provincia: "Buenos Aires",
          telefono: "11-4444-2222",
          email: `norte-${centro._id}@sede.com`,
          horario_apertura: "08:00",
          horario_cierre: "18:00",
          centro_medico_id: centro._id,
          estado: "activa",
        },
        {
          nombre: "Sede Sur",
          direccion: "Av. Rivadavia 9012",
          ciudad: "Buenos Aires",
          provincia: "Buenos Aires",
          telefono: "11-4444-3333",
          email: `sur-${centro._id}@sede.com`,
          horario_apertura: "09:00",
          horario_cierre: "19:00",
          centro_medico_id: centro._id,
          estado: "activa",
        },
      ];

      const sedes = await Sede.insertMany(sedesDelCentro);
      sedesCreadas.push(...sedes);

      console.log(`   ✅ ${sedes.length} sedes creadas`);

      // Actualizar el array de sedes del centro médico
      await Prestador.findByIdAndUpdate(centro._id, {
        sedes: sedes.map((s) => s._id),
      });

      console.log(`   ✅ Centro médico actualizado con sedes`);
    }

    // Buscar médicos y asignarles sedes de trabajo
    const medicos = await Prestador.find({ es_centro_medico: false }).limit(5);

    if (medicos.length > 0) {
      console.log(`\n👨‍⚕️ Asignando sedes a ${medicos.length} médicos...\n`);

      for (const medico of medicos) {
        // Asignar 1-2 sedes aleatorias a cada médico
        const numSedes = Math.floor(Math.random() * 2) + 1;
        const sedesAsignadas = sedesCreadas
          .sort(() => 0.5 - Math.random())
          .slice(0, numSedes);

        await Prestador.findByIdAndUpdate(medico._id, {
          sedes: sedesAsignadas.map((s) => s._id),
        });

        console.log(
          `   ✅ ${medico.nombres} ${medico.apellidos}: ${numSedes} sede(s) asignada(s)`
        );
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ Seed de sedes completado exitosamente");
    console.log("=".repeat(50));
    console.log(`\n📊 Resumen:`);
    console.log(`   - Centros médicos: ${centrosMedicos.length}`);
    console.log(`   - Sedes creadas: ${sedesCreadas.length}`);
    console.log(`   - Médicos con sedes: ${medicos.length}\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  }
}

seedSedes();
