// routes/recommendationRoutes.js
const express = require('express');
const router = express.Router();
const { Cpu, Gpu } = require('../models/Components.js');
const Game = require('../models/Games.js');

router.get('/components', async (req, res) => {
  try {
    const [cpus, gpus] = await Promise.all([
      Cpu.find({}).select('nombre -_id').lean(),
      Gpu.find({}).select('nombre -_id').lean()
    ]);
    
    res.json({
      success: true,
      data: {
        cpus: cpus.map(c => c.nombre),
        gpus: gpus.map(g => g.nombre)
      }
    });
  } catch (error) {
    console.error('Error fetching components:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener componentes' 
    });
  }
});

// Obtener recomendaciones de juegos
router.post('/recommendations', async (req, res) => {
  try {
    const { cpu, gpu, ram, genres = [] } = req.body;

    console.log('Datos recibidos:', { cpu, gpu, ram, genres });

    // Validación básica
    if (!cpu || !gpu || !ram) {
      return res.status(400).json({
        success: false,
        message: 'CPU, GPU y RAM son requeridos'
      });
    }

    // Verificar que los componentes existen
    const [cpuExists, gpuExists] = await Promise.all([
      Cpu.findOne({ nombre: { $regex: new RegExp(cpu, 'i') } }).lean(),
      Gpu.findOne({ nombre: { $regex: new RegExp(gpu, 'i') } }).lean()
    ]);

    console.log('Componentes encontrados:', { cpuExists, gpuExists });

    if (!cpuExists || !gpuExists) {
      return res.status(400).json({
        success: false,
        message: 'Componentes no reconocidos'
      });
    }

    // Generación segura de patrones regex
    const normalizeText = str =>
      typeof str === 'string' && str.trim().length > 0
        ? str.trim().split(/\s+/).join('.*')
        : null;

    const cpuPatternText = normalizeText(cpu);
    const gpuPatternText = normalizeText(gpu);

    const cpuPattern = cpuPatternText ? new RegExp(cpuPatternText, 'i') : null;
    const gpuPattern = gpuPatternText ? new RegExp(gpuPatternText, 'i') : null;

    // Construcción de la consulta MongoDB
    const query = {
      $and: [
        {
          $or: [
            { 'requisitos_minimos.Memory': { $exists: false } },
            { 'requisitos_minimos.Memory': { $lte: ram } }
          ]
        },
        {
          $or: [
            { 'requisitos_minimos.Processor': { $exists: false } },
            ...(cpuPattern ? [{ 'requisitos_minimos.Processor': { $regex: cpuPattern } }] : [])
          ]
        },
        {
          $or: [
            { 'requisitos_minimos.Graphics': { $exists: false } },
            ...(gpuPattern ? [{ 'requisitos_minimos.Graphics': { $regex: gpuPattern } }] : [])
          ]
        }
      ]
    };

    // Filtro por géneros si se seleccionaron
    if (genres.length > 0) {
      query.$and.push({ generos: { $in: genres } });
    }

    console.log('Consulta MongoDB:', JSON.stringify(query, null, 2));

    const recommendedGames = await Game.find(query)
      .select('nombre generos requisitos_minimos imagen url -_id')
      .limit(100)
      .lean();

    console.log('Juegos encontrados:', recommendedGames.length);

    return res.json({
      success: true,
      data: recommendedGames,
      count: recommendedGames.length
    });

  } catch (error) {
    console.error('Error en /recommendations:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al generar recomendaciones',
      error: error.message
    });
  }
});



module.exports = router;