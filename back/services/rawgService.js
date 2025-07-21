const axios = require('axios');
const { APIError } = require('../utils/errors');

const API_KEY = process.env.RAWG_API_KEY;
const BASE_URL = 'https://api.rawg.io/api';

const getPopularGames = async (page = 1, pageSize = 40) => {
  try {
    const res = await axios.get(`${BASE_URL}/games`, {
      params: {
        key: API_KEY,
        page,
        page_size: pageSize,
        ordering: '-rating', // Ordenar por rating
        platforms: '4' // Filtrar por PC
      },
      timeout: 5000 // Timeout de 5 segundos
    });

    if (!res.data?.results) {
      throw new APIError('Formato de respuesta inesperado de RAWG API');
    }

    return res.data.results;
  } catch (error) {
    console.error('Error fetching games from RAWG:', error.message);
    throw new APIError('Error al obtener juegos de RAWG API', {
      cause: error,
      details: error.response?.data
    });
  }
};

module.exports = { getPopularGames };