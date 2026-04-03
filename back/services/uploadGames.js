const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const gamesData = require('./steam_games_requisitos.json');
const connectDB = require('../config/db.js');
const { Cpu, Gpu } = require('../models/Components.js');
const Game = require('../models/Games.js');


/**
 * Valida si un nombre de componente es un modelo específico y no genérico.
 * @param {string} name - El nombre del componente a validar.
 * @returns {boolean} - True si el nombre es válido, false en caso contrario.
 */
const isValidComponentName = (name) => {
    if (!name) return false;
    const lowerCaseName = name.toLowerCase();

    // Palabras clave que indican un modelo específico (debe tener al menos una)
    const validKeywords = [
        'intel core', 'ryzen', 'amd fx', 'geforce', 'radeon', 'gtx', 'rtx', 
        'rx ', 'intel arc', 'i3', 'i5', 'i7', 'i9', 'pentium', 'xeon', ' hd '
    ];
    
    // Palabras clave que indican una descripción genérica (no debe tener ninguna)
    const invalidKeywords = [
        'or higher', 'or better', 'equivalent', 'dual core', 'quad-core', 'processor', 
        'shader model', 'vram', 'gb', 'mb', 'supported', 'compatible', 'level video card'
    ];

    const hasValidKeyword = validKeywords.some(kw => lowerCaseName.includes(kw));
    const hasInvalidKeyword = invalidKeywords.some(kw => lowerCaseName.includes(kw));

    return hasValidKeyword && !hasInvalidKeyword;
};


/**
 * Función principal para subir los datos.
 */
const runUploadProcess = async () => {
    try {
        connectDB();
        console.log('✅ Conectado a MongoDB.');

        // 1. Cargar la lista de juegos
        console.log('\n--- Paso 1: Actualizando Juegos (Upsert) ---');
        const bulkOps = gamesData.map(game => ({
            updateOne: {
                filter: { nombre: game.nombre }, 
                update: { $set: game },          // Actualiza todos los campos con la info nueva
                upsert: true                     // Si el juego no existe, lo crea
            }
        }));

        const result = await Game.bulkWrite(bulkOps);
        console.log(`👍 Proceso completado: ${result.upsertedCount} juegos nuevos, ${result.modifiedCount} actualizados.`);

        // 2. Procesar y añadir componentes nuevos
        console.log('\n--- Paso 2: Analizando Requisitos y Añadiendo Componentes ---');
        const newCpusAdded = new Set();
        const newGpusAdded = new Set();

        for (const game of gamesData) {
            const reqs = game.requisitos_minimos || {};

            // Procesar CPU
            if (reqs.Processor) {
                // Separa nombres por "/" o ","
                const potentialCpus = reqs.Processor.split(/[/,]/);
                for (const cpuName of potentialCpus) {
                    const trimmedName = cpuName.trim();
                    if (isValidComponentName(trimmedName)) {
                        // findOneAndUpdate con upsert: crea el doc si no existe.
                        const result = await Cpu.findOneAndUpdate(
                            { nombre: trimmedName }, // Condición de búsqueda
                            { $setOnInsert: { nombre: trimmedName, tipo: 'cpus' } }, // Datos a insertar si no existe
                            { upsert: true, new: false } // Opciones: upsert=true, new=false para no devolver el doc
                        );
                        if (result === null) { // Si result es null, significa que se hizo un insert
                            newCpusAdded.add(trimmedName);
                        }
                    }
                }
            }

            // Procesar GPU (busca la clave 'Graphics' o 'Video')
            const graphicsKey = Object.keys(reqs).find(k => k.toLowerCase().startsWith('graphics') || k.toLowerCase().startsWith('video'));
            if (graphicsKey && reqs[graphicsKey]) {
                const potentialGpus = reqs[graphicsKey].split(/[/,]/);
                for (const gpuName of potentialGpus) {
                    const trimmedName = gpuName.trim();
                    if (isValidComponentName(trimmedName)) {
                        const result = await Gpu.findOneAndUpdate(
                            { nombre: trimmedName },
                            { $setOnInsert: { nombre: trimmedName, tipo: 'gpus' } },
                            { upsert: true, new: false }
                        );
                         if (result === null) {
                            newGpusAdded.add(trimmedName);
                        }
                    }
                }
            }
        }
        
        // 3. Reporte final
        console.log('\n--- Paso 3: Reporte Final ---');
        console.log('✅ Proceso de componentes completado.');

        if (newCpusAdded.size > 0) {
            console.log(`\n🆕 Se agregaron ${newCpusAdded.size} CPUs nuevas:`);
            newCpusAdded.forEach(c => console.log(`  - ${c}`));
        } else {
            console.log('⚪ No se encontraron CPUs nuevas para agregar.');
        }

        if (newGpusAdded.size > 0) {
            console.log(`\n🆕 Se agregaron ${newGpusAdded.size} GPUs nuevas:`);
            newGpusAdded.forEach(g => console.log(`  - ${g}`));
        } else {
            console.log('⚪ No se encontraron GPUs nuevas para agregar.');
        }

    } catch (error) {
        console.error('❌ Ocurrió un error durante el proceso:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Conexión a MongoDB cerrada.');
    }
};

// Ejecutar el proceso completo
runUploadProcess();