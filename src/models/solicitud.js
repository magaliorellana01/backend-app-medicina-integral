const mongoose = require('mongoose');

const SolicitudSchema = new mongoose.Schema({
    nro: {
        type: String
    },

    afiliadoNombre: {
        type: String
    },

    afiliadoId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Socio'
    },

    tipo: {
        type: String,
        required: true,
        enum: ['Reintegro', 'Autorizacion', 'Receta'],
    },

    estado: {
        type: String,
        required: true,
        enum: ['Aprobado', 'Rechazado', 'Observado', 'En Análisis', 'Recibido'],
    },
    motivo: {
        type: String,
        required: false
    },
    monto: {
        type: Number
    },
    proveedor: {
        type: String
    },
    descripcion: {
        texto: { type: String },
        adjuntos: [{
            nombreArchivo: { type: String },
            tipoArchivo: { type: String },
            path: { type: String }
        }]
    },
    historialEstados: [{
        estado: { type: String },
        motivo: { type: String },
        usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Prestador' },
        fecha: { type: Date, default: Date.now }
    }],

    prestadorAsignado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prestador'
    },
    comentariosSocio: [{
        comentario: { type: String },
        fecha: { type: Date, default: Date.now },
        // siempre va a ser el mismo socio
    }],
    comentariosPrestador: [{
        comentario: { type: String },
        fecha: { type: Date, default: Date.now },
        prestador: { type: mongoose.Schema.Types.ObjectId, ref: 'Prestador' } 
        // prestador que realizo el comentario (los prestadores asignados podrian cambiar en la misma solicitud)
    }],
    fechaCreacion: {
        type: Date,
        default: Date.now,
    },
    fechaActualizacion: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true
});

const solicitud = mongoose.model('solicitud', SolicitudSchema, 'solicituds');
module.exports = solicitud;
