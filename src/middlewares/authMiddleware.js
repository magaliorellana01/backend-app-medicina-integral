const Prestador = require("../models/prestador");
const { verifyToken } = require("../utils/jwt");

exports.verifyTokenMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    if(!decoded?._id || decoded._id === null || decoded._id === undefined || decoded.exp < (Date.now() / 1000)){
      throw new Error("Unauthorized");
    }

    const prestador = await Prestador.findById(decoded._id).select("-password");
    if(!prestador || prestador.estado !== 'Activo'){
      throw new Error("Unauthorized");
    }

    req.prestador = prestador;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
