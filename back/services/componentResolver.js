const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Cpu, Gpu } = require('../models/Components');

const CPU_CSV_PATH = path.join(__dirname, 'CPU_UserBenchmarks.csv');
const GPU_CSV_PATH = path.join(__dirname, 'GPU_UserBenchmarks.csv');

// Regex escape utility to prevent errors with characters like '(' or '+'
const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Searches the CSV file for a fuzzy match.
 */
const searchInCSV = (filePath, query) => {
    return new Promise((resolve, reject) => {
        let bestMatch = null;
        const normalizedQuery = query.toLowerCase();

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                // Ignore assemblies: Only base models (empty Part Number)
                const isBaseModel = !data['Part Number'] || data['Part Number'].trim() === '';
                if (isBaseModel) {
                    const modelName = (data.Model || '').toLowerCase();
                    // Basic includes logic or exact matches
                    if (modelName.includes(normalizedQuery) || normalizedQuery.includes(modelName)) {
                        if (!bestMatch) {
                            bestMatch = data;
                        }
                    }
                }
            })
            .on('end', () => resolve(bestMatch))
            .on('error', reject);
    });
};

/**
 * Resolves a component dynamically.
 * 1. Checks MongoDB first
 * 2. If missing, scans the CSV on demand
 * 3. Creates it in MongoDB if found in CSV
 * 
 * @param {string} componentName - Extracted requirement from a game
 * @param {string} type - 'cpus' or 'gpus'
 */
const resolveComponent = async (componentName, type) => {
    try {
        const Model = type === 'cpus' ? Cpu : Gpu;
        
        // 1. Search in Database (Fuzzy match ignoring case)
        const safeQuery = escapeRegex(componentName);
        const regex = new RegExp(safeQuery, 'i');
        let component = await Model.findOne({ nombre: { $regex: regex } });
        
        // 2. If exists, return its _id and benchmarkScore
        if (component) {
            return {
                _id: component._id,
                benchmarkScore: component.benchmarkScore
            };
        }

        // 3. Dynamic mechanism: Search in CSV if not in DB
        const csvPath = type === 'cpus' ? CPU_CSV_PATH : GPU_CSV_PATH;
        const csvMatch = await searchInCSV(csvPath, componentName);

        if (csvMatch) {
            const score = parseFloat(csvMatch.Benchmark) || 0;
            const newComponent = await Model.create({
                tipo: type,
                nombre: `${csvMatch.Brand} ${csvMatch.Model}`.trim(),
                marca: csvMatch.Brand,
                benchmarkScore: score
            });

            return {
                _id: newComponent._id,
                benchmarkScore: score
            };
        }

        // 4. Fallback if not found anywhere (returns null so the caller can handle it)
        return null;

    } catch (err) {
        console.error(`Error resolving component ${componentName}:`, err);
        return null;
    }
};

module.exports = {
    resolveComponent
};
