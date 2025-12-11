const Prestador = require('../models/prestador');
const { generateToken } = require('../utils/jwt');

// Normaliza el CUIT: elimina todo lo que no sea dígito.
// No completa con ceros a la izquierda para evitar falsos positivos.
function normalizarCUIT(valor) {
    if (valor === undefined || valor === null) return '';
    return String(valor).replace(/\D/g, '');
}

exports.loginPrestador = async (req, res) => {
    try {
        const { cuit, password } = req.body;

        const cuitNormalizado = normalizarCUIT(cuit);

        if (cuitNormalizado.length !== 11) {
            return res.status(400).json({ message: 'CUIT inválido. Debe tener 11 dígitos.' });
        }
        const prestador = await Prestador.findOne({ cuit: cuitNormalizado });
        if (!prestador) {
            return res.status(400).json({ message: 'CUIT incorrecto' });
        }
        if (prestador.estado !== 'Activo') {
            return res.status(400).json({ message: 'Prestador inactivo' });
        }
        if (prestador.password !== password) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        const accessToken = generateToken({ _id: prestador._id });

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            accessToken,
            prestador: {
            _id: prestador._id,
            nombres: prestador.nombres,
            apellidos: prestador.apellidos,
            especialidad: prestador.especialidad,
            especialidades: prestador.especialidades,
            cuit: prestador.cuit,
            matricula: prestador.matricula,
            es_centro_medico: prestador.es_centro_medico,
            sedes: prestador.sedes,
        } });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: error.message || "Error interno del servidor" });
    }
}