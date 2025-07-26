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

/**
 * Extrae el número de modelo clave de un nombre de componente.
 * Esta es la función clave para la nueva lógica.
 * @param {string} name - El nombre completo del componente.
 * @returns {string|null} - El número de modelo (ej: "i5-750", "GTX 1060") o null.
 */
const extractModel = (name) => {
    if (!name) return null;
    // Patrones para encontrar diferentes tipos de modelos de CPU y GPU
    const patterns = [
        /(i\d[- ]?\d{3,}\w?)/,      // Intel Core (i5-750, i7 8700K)
        /(GTX|RTX)[- ]?\d{3,}\w?/, // NVIDIA GeForce (GTX 1060, RTX 3080)
        /Ryzen[- ]?\d[- ]?\d{4}\w?/, // AMD Ryzen (Ryzen 5 1600X)
        /FX[- ]?\d{4}/,            // AMD FX (FX-6300)
        /RX[- ]?\d{3,}\w?/          // AMD Radeon (RX 580)
    ];

    for (const pattern of patterns) {
        const match = name.match(pattern);
        if (match) {
            // Reemplaza espacios por un patrón que acepta espacio o guion para más flexibilidad
            return match[0].replace(/\s+/g, '[- ]?');
        }
    }
    return null; // Si no encuentra un patrón conocido, no se puede buscar
};


// --- Endpoint de Recomendaciones Corregido ---
router.post('/recommendations', async (req, res) => {
    try {
        const { cpu, gpu, ram, genres = [] } = req.body;

        if (!cpu || !gpu || !ram) {
            return res.status(400).json({ success: false, message: 'CPU, GPU y RAM son requeridos' });
        }

        // 1. Extraer los modelos clave de los componentes seleccionados
        const cpuModel = extractModel(cpu);
        const gpuModel = extractModel(gpu);

        // Si no se pudo extraer un modelo, no se puede hacer una búsqueda fiable
        if (!cpuModel || !gpuModel) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se pudo identificar el modelo de los componentes seleccionados.' 
            });
        }

        const cpuPattern = new RegExp(cpuModel, 'i');
        const gpuPattern = new RegExp(gpuModel, 'i');

        // 2. Construir la consulta a MongoDB
        const query = {
            $and: [
                { 'requisitos_minimos.Processor': { $regex: cpuPattern } },
                {
                    $or: [
                        { 'requisitos_minimos.Graphics': { $regex: gpuPattern } },
                        { 'requisitos_minimos.Video': { $regex: gpuPattern } }
                    ]
                }
            ]
        };

        if (genres.length > 0) {
            query.$and.push({ generos: { $in: genres } });
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