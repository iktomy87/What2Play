const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    generos: [String],
    requisitos_minimos: Object
});

module.exports = mongoose.model('Games', gameSchema);