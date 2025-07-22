const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: String,
  genre: [String],
  description: String,
  requirements: {
    cpu: { type: String, default: 'Desconocido' },
    gpu: { type: String, default: 'Desconocido' },
    ram: { type: String, default: '8GB' }
  }
});

module.exports = mongoose.model('Game', gameSchema);
