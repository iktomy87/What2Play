const Game = require('../models/Game');
const { getPopularGames } = require('../services/rawgService');
const { extractRequirements, isCompatible } = require('../utils/gameUtils');

/**
 * Limpia y normaliza los requisitos mínimos para PC.
 */
const normalizeRequirements = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return {
    cpu: 'Desconocido',
    gpu: 'Desconocido',
    ram: 'Desconocido'
  };

  const cpuMatch = rawText.match(/Processor:\s*([^\n\r]+)/i);
  const gpuMatch = rawText.match(/(Graphics|Video Card):\s*([^\n\r]+)/i);
  const ramMatch = rawText.match(/Memory:\s*(\d+\s*GB)/i);

  return {
    cpu: cpuMatch?.[1]?.trim() || 'Desconocido',
    gpu: gpuMatch?.[2]?.trim() || 'Desconocido',
    ram: ramMatch?.[1]?.trim() || 'Desconocido'
  };
};

/**
 * Importa juegos desde la API RAWG y los guarda en MongoDB si no existen.
 */
const importGames = async (req, res) => {
  try {
    const gamesFromAPI = await getPopularGames();

    const batch = gamesFromAPI.map(apiGame => {
      const pcPlatform = apiGame.platforms?.find(p => p.platform?.slug === 'pc');
      const minimumReqsText = pcPlatform?.requirements?.minimum || '';

      const requirements = normalizeRequirements(minimumReqsText);

      return {
        updateOne: {
          filter: { title: apiGame.name },
          update: {
            $setOnInsert: {
              title: apiGame.name,
              genre: apiGame.genres?.map(g => g.name) || [],
              description: apiGame.description_raw || '',
              releaseDate: apiGame.released || null,
              rating: apiGame.rating || 0,
              requirements
            }
          },
          upsert: true
        }
      };
    });

    const result = await Game.bulkWrite(batch);

    res.json({
      success: true,
      importedCount: result.upsertedCount || 0,
      message: `${result.upsertedCount || 0} juegos importados correctamente`
    });
  } catch (error) {
    console.error('Error en importación:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al importar juegos',
      error: error.message
    });
  }
};

/**
 * Retorna recomendaciones de juegos compatibles según specs de usuario.
 */
const getRecommendations = async (req, res) => {
  try {
    const { cpu, gpu, ram, genres = [] } = req.body;

    if (!cpu || !gpu || !ram) {
      return res.status(400).json({ 
        success: false,
        message: 'Faltan especificaciones: CPU, GPU o RAM' 
      });
    }

    const query = genres.length > 0
      ? { genre: { $in: genres } }
      : {};

    const allGames = await Game.find(query);

    const recommended = allGames
      .filter(game => isCompatible({ cpu, gpu, ram }, game.requirements))
      .sort((a, b) => {
        const aHasRealReqs = a.requirements?.cpu !== 'Desconocido';
        const bHasRealReqs = b.requirements?.cpu !== 'Desconocido';
        return bHasRealReqs - aHasRealReqs || b.rating - a.rating;
      });

    if (recommended.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron juegos compatibles con tu PC.'
      });
    }

    res.json({
      success: true,
      count: recommended.length,
      games: recommended
    });
  } catch (err) {
    console.error('Error al recomendar:', err.message);
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
