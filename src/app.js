// app.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config();

const historiasClinicasRoutes = require("./routes/historiaClinica");
const situacionTerapeuticaRoutes = require("./routes/situacionTerapeutica");
const filtroSolicitudesRoutes = require("./routes/filtroSolicitudes");
const solicitudRoutes = require("./routes/solicitud");

const prestadorRoutes = require("./routes/prestador");
const { verifyTokenMiddleware } = require("./middlewares/authMiddleware");
const turnosRoutes = require("./routes/turnos");
const sedesRoutes = require("./routes/sedes");

// Importar modelos para registrarlos
require("./models/socio");
require("./models/historiaClinica");
require("./models/nota");
require("./models/prestador");
require("./models/sede");
require("./models/situacionTerapeutica");
require("./models/solicitud");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
// Servir archivos estáticos de uploads para poder descargar
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));
  
// Rutas
app.use("/historias-clinicas", verifyTokenMiddleware, historiasClinicasRoutes);
app.use("/situaciones-terapeuticas", verifyTokenMiddleware, situacionTerapeuticaRoutes);
app.use("/filtro-solicitudes", verifyTokenMiddleware, filtroSolicitudesRoutes);
app.use("/solicitud", verifyTokenMiddleware, solicitudRoutes);

app.use("/prestador", prestadorRoutes); // no necesita authToken porque es para el login
app.use("/turnos", turnosRoutes);
app.use("/sedes", sedesRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});