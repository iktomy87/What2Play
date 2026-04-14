const mongoose = require('mongoose');

const cpuSchema = new mongoose.Schema({
    tipo: { type: String, required: true },
    nombre: { type: String, required: true, trim: true },
    url: String,
    imagen: String,
    alt_text: String,
    marca: String,
    benchmarkScore: Number,
    especificaciones: Object // Usamos 'Object' para flexibilidad
});

const gpuSchema = new mongoose.Schema({
    tipo: { type: String, required: true },
    nombre: { type: String, required: true, trim: true },
    url: String,
    imagen: String,
    alt_text: String,
    rating: String,
    marca: String,
    benchmarkScore: Number,
    especificaciones: Object
});

cpuSchema.index({ nombre: 'text' });
gpuSchema.index({ nombre: 'text' });

module.exports = {
    Cpu: mongoose.model('cpus', cpuSchema),
    Gpu: mongoose.model('gpus', gpuSchema),
};