const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Ruta para importar juegos (opcional, podría ser POST /games/import)
router.post('/import', gameController.importGames);

// Ruta para obtener recomendaciones
router.post('/recommendations', gameController.getRecommendations);

module.exports = router;