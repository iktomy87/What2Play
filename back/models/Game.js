const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: String,
  genre: [String],
  description: String,
  requirements: {
    cpu: String,
    gpu: String,
    ram: Number,
  }
});

module.exports = mongoose.model('Game', gameSchema);
