const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const gameController = require('../controllers/gameController');

// Nueva ruta GET para listar juegos
router.get('/', async (req, res) => {
  try {
    const games = await Game.find().limit(10);
    res.json({
      success: true,
      count: games.length,
      games
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rutas existentes
router.post('/import', gameController.importGames);
router.post('/recommendations', gameController.getRecommendations);

module.exports = router;