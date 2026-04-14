const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    generos: [String],
    requisitos_minimos: Object,
    cpuScore: { type: Number, default: 0 },
    gpuScore: { type: Number, default: 0 }
});

module.exports = mongoose.model('Games', gameSchema);