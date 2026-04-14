const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Cpu, Gpu } = require('../models/Components');

const JSON_PATH = path.join(__dirname, '../services/pc-builder-components-detailed.json');
const CPU_CSV_PATH = path.join(__dirname, '../services/CPU_UserBenchmarks.csv');
const GPU_CSV_PATH = path.join(__dirname, '../services/GPU_UserBenchmarks.csv');

// Helpers
const readCSV = (filePath, limit = 100) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                // Ignore assembly versions: Part Number MUST be empty (they are the base models)
                const isBaseModel = !data['Part Number'] || data['Part Number'].trim() === '';
                if (isBaseModel && results.length < limit) {
                    results.push(data);
                }
            })
            .on('end', () => resolve(results))
            .on('error', reject);
    });
};

const matchWithJSON = (csvItems, jsonItems, tipo) => {
    return csvItems.map(csvItem => {
        const csvName = csvItem.Model.trim();
        const csvBrand = csvItem.Brand.trim();
        const score = parseFloat(csvItem.Benchmark) || 0;

        // Búsqueda difusa básica: el nombre base del CSV está contenido en el detallado del JSON (o viceversa)
        const match = jsonItems.find(j => {
            const jName = (j.nombre || '').toLowerCase();
            const cName = csvName.toLowerCase();
            return jName.includes(cName) || cName.includes(jName);
        });

        if (match) {
            return {
                ...match,
                tipo,
                nombre: match.nombre, // Mantenemos el nombre detallado del JSON
                marca: csvBrand,
                benchmarkScore: score
            };
        }

        // Si no está en JSON, lo creamos solo con los datos del CSV
        return {
            tipo,
            nombre: `${csvBrand} ${csvName}`,
            marca: csvBrand,
            benchmarkScore: score
        };
    });
};

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/recojuegos');
        console.log('MongoDB connected.');

        // 1 & 2. Read JSON and CSVs
        console.log('Reading JSON data from scraper...');
        const rawJson = fs.readFileSync(JSON_PATH, 'utf-8');
        const jsonData = JSON.parse(rawJson);
        const jsonCpus = jsonData.cpus || [];
        const jsonGpus = jsonData.gpus || [];

        console.log('Reading CSV master files...');
        // 3 & 4. Filter and take top 100 base models
        const topCpusCsv = await readCSV(CPU_CSV_PATH, 100);
        const topGpusCsv = await readCSV(GPU_CSV_PATH, 100);

        console.log(`Matched ${topCpusCsv.length} CPUs and ${topGpusCsv.length} GPUs from CSV.`);

        // 5. Cross with JSON to get images, ratings, etc.
        const cpusToInsert = matchWithJSON(topCpusCsv, jsonCpus, 'cpus');
        const gpusToInsert = matchWithJSON(topGpusCsv, jsonGpus, 'gpus');

        // 6. Clean DB and insert
        console.log('Clearing old component data from MongoDB...');
        await Cpu.deleteMany({});
        await Gpu.deleteMany({});

        console.log(`Inserting ${cpusToInsert.length} CPUs into MongoDB...`);
        await Cpu.insertMany(cpusToInsert);

        console.log(`Inserting ${gpusToInsert.length} GPUs into MongoDB...`);
        await Gpu.insertMany(gpusToInsert);

        console.log('Top 100 Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error in seeder:', err);
        process.exit(1);
    }
};

run();
