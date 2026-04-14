const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const gamesData = require('./steam_games_requisitos.json');
const connectDB = require('../config/db.js');
const { Cpu, Gpu } = require('../models/Components.js');
const Game = require('../models/Games.js');
const { parseRequirementScore } = require('./requirementParser.js');
const fs = require('fs');
const csv = require('csv-parser');

const CPU_CSV_PATH = path.join(__dirname, 'CPU_UserBenchmarks.csv');
const GPU_CSV_PATH = path.join(__dirname, 'GPU_UserBenchmarks.csv');

/**
 * Carga un archivo CSV a memoria devolviendo un array de objetos
 */
const loadMasterList = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
};


/**
 * Función principal para subir los datos.
 */
const runUploadProcess = async () => {
    try {
        connectDB();
        console.log('✅ Conectado a MongoDB.');

        // 1. Cargar las listas maestras de componentes por única vez
        console.log('\n--- Paso 1: Cargando diccionarios de Hardware a memoria ---');
        const cpuMaster = await loadMasterList(CPU_CSV_PATH);
        const gpuMaster = await loadMasterList(GPU_CSV_PATH);
        console.log(`✅ Diccionarios leídos: ${cpuMaster.length} CPUs, ${gpuMaster.length} GPUs`);

        // 2. Procesar requerimientos a Puntajes (Benchmarks) para cada juego
        console.log('\n--- Paso 2: Calculando Scores Mínimos de cada Juego ---');
        gamesData.forEach(game => {
            const reqs = game.requisitos_minimos || {};
            
            if (reqs.Processor) {
                game.cpuScore = parseRequirementScore(reqs.Processor, cpuMaster, 'cpus');
            } else {
                game.cpuScore = 0;
            }

            const graphicsKey = Object.keys(reqs).find(k => k.toLowerCase().startsWith('graphics') || k.toLowerCase().startsWith('video'));
            if (graphicsKey && reqs[graphicsKey]) {
                game.gpuScore = parseRequirementScore(reqs[graphicsKey], gpuMaster, 'gpus');
            } else {
                game.gpuScore = 0;
            }
        });
        console.log(`✅ Procesamiento sintáctico convertido a score en ${gamesData.length} juegos.`);

        // 3. Cargar la lista de juegos a la BD
        console.log('\n--- Paso 3: Actualizando Juegos en BD (Upsert) ---');
        const bulkOps = gamesData.map(game => ({
            updateOne: {
                filter: { nombre: game.nombre },
                update: { $set: game },          // Guarda nombre, reqs y ahora los Scores extraídos
                upsert: true
            }
        }));

        const result = await Game.bulkWrite(bulkOps);
        console.log(`👍 Proceso completado: ${result.upsertedCount} juegos nuevos, ${result.modifiedCount} actualizados.`);
    } catch (error) {
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Conexión a MongoDB cerrada.');
    }
};

// Ejecutar el proceso completo
runUploadProcess();