const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferences: [String], // ej: ['RPG', 'Shooter']
  specs: {
    cpu: String,
    gpu: String,
    ram: Number,
  },
});

module.exports = mongoose.model('User', userSchema);
