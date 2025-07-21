// controllers/gameController.js
const Game = require('../models/Game');
const { getPopularGames } = require('../services/rawgService');
const { extractRequirements, isCompatible } = require('../utils/gameUtils');

const importGames = async (req, res) => {
  try {
    console.log('Comenzando importación de juegos...');
    const gamesFromAPI = await getPopularGames();
    
    if (!gamesFromAPI || gamesFromAPI.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No se encontraron juegos en la API externa' 
      });
    }

    const batchOperations = gamesFromAPI.map(apiGame => ({
      updateOne: {
        filter: { title: apiGame.name },
        update: {
          $setOnInsert: {
            title: apiGame.name,
            genre: apiGame.genres?.map(g => g.name) || [],
            description: apiGame.description_raw || '',
            releaseDate: apiGame.released || null,
            rating: apiGame.rating || 0,
            requirements: extractRequirements(apiGame)
          }
        },
        upsert: true
      }
    }));

    const result = await Game.bulkWrite(batchOperations);
    const importedCount = result.upsertedCount;

    console.log(`Importación completada. ${importedCount} juegos nuevos añadidos`);
    res.json({ 
      success: true,
      importedCount,
      games: gamesFromAPI.slice(0, 10).map(g => g.name)
    });
  } catch (error) {
    console.error('Error en importación:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al importar juegos',
      error: error.message 
    });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const { cpu, gpu, ram, genres = [] } = req.body;
    
    if (!cpu || !gpu || !ram) {
      return res.status(400).json({ 
        success: false,
        message: 'CPU, GPU y RAM son requeridos' 
      });
    }

    // Construir consulta base
    let query = {};
    
    // Filtrar por géneros si se especifican
    if (genres.length > 0) {
      query.genre = { $in: genres };
    }

    const games = await Game.find(query);
    
    const recommended = games
      .filter(game => isCompatible({ cpu, gpu, ram }, game.requirements))
      .sort((a, b) => {
        const aHasReqs = a.requirements.cpu !== "Desconocido";
        const bHasReqs = b.requirements.cpu !== "Desconocido";
        return bHasReqs - aHasReqs || b.rating - a.rating;
      });

    if (recommended.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron juegos que coincidan con tus especificaciones'
      });
    }

    res.json({
      success: true,
      count: recommended.length,
      games: recommended
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener recomendaciones',
      error: err.message 
    });
  }
};

module.exports = {
  importGames,
  getRecommendations
};