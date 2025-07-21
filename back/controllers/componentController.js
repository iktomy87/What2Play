// controllers/componentController.js
const path = require('path');
const fs = require('fs');

const getCPUs = (req, res) => {
  try {
    const dataPath = path.join(__dirname, '../data/cpus.json');
    const cpus = JSON.parse(fs.readFileSync(dataPath));
    res.json(cpus);
  } catch (err) {
    res.status(500).json({ error: 'Error al leer el archivo de CPUs' });
  }
};

module.exports = {
  getCPUs
};
