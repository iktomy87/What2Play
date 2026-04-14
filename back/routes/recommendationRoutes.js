// routes/recommendationRoutes.js (versión final)
const express = require('express');
const router = express.Router();
const { Cpu, Gpu } = require('../models/Components.js');
const Game = require('../models/Games.js');

// --- Endpoint para obtener componentes (sin cambios) ---
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
        res.status(500).json({ success: false, message: 'Error al obtener componentes' });
    }
});

// --- Funciones Auxiliares Mejoradas ---

// Extrae el valor numérico de la RAM de un string (ej: "8 GB RAM" -> 8).
const parseRam = (ramString) => {
    if (!ramString || typeof ramString !== 'string') return 0;
    const match = ramString.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
};

// --- Endpoint de Recomendaciones (Evolucionado Matemáticamente) ---
router.post('/recommendations', async (req, res) => {
    try {
        const { cpu, gpu, ram, genres = [] } = req.body;

        if (!cpu || !gpu || !ram) {
            return res.status(400).json({ success: false, message: 'CPU, GPU y RAM son requeridos' });
        }

        // Helper para escapar regex
        const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        const cpuRegex = new RegExp('^' + escapeRegex(cpu.trim()) + '$', 'i');
        const gpuRegex = new RegExp('^' + escapeRegex(gpu.trim()) + '$', 'i');

        // 1. Obtener los Score de benchmarks reales del usuario en la BD de componentes
        const userCpu = await Cpu.findOne({ nombre: { $regex: cpuRegex } });
        const userGpu = await Gpu.findOne({ nombre: { $regex: gpuRegex } });

        // Si mandaron un string alterado, renegamos la request.
        if (!userCpu || !userGpu) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se pudo identificar el poder de los componentes seleccionados.' 
            });
        }

        const cpuPower = userCpu.benchmarkScore || 0;
        const gpuPower = userGpu.benchmarkScore || 0;

        // 2. Construir la consulta a MongoDB 
        // $gt: 0 excluye juegos donde el parser no pudo determinar requisitos (score = 0)
        // $lte: userPower filtra juegos que el hardware del usuario puede correr
        const query = {
            cpuScore: { $gt: 0, $lte: cpuPower },
            gpuScore: { $gt: 0, $lte: gpuPower }
        };

        if (genres.length > 0) {
            query.generos = { $in: genres };
        }

        const gamesFromDB = await Game.find(query).limit(200).lean();

        // 3. Filtrar los resultados por RAM en el código
        const userRam = parseInt(ram, 10);
        const recommendedGames = gamesFromDB.filter(game => {
            const requiredRam = parseRam(game.requisitos_minimos?.Memory);
            return userRam >= requiredRam;
        });
        
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