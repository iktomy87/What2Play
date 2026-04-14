/**
 * requirementParser.js
 * Módulo de utilidad para limpiar textos sucios de hardware y convertirlos en puntajes en crudo.
 */

// ==============================================================================
// PASO 2: DICCIONARIO DE RESPALDO (Fallback Dictionary)
// Si no hay piezas de hardware específicas mencionadas, usamos heurísticas clave
// ==============================================================================
const FALLBACK_DICTIONARY = {
    "directx 12": 45,
    "directx 11": 15,
    "4gb vram": 35,
    "2gb vram": 25,
    "integrated": 5
};

// ==============================================================================
// PASO 1: FUNCIÓN DE LIMPIEZA (Regex)
// Transforma el desastre extraído en un string altamente predecible y estandarizado
// ==============================================================================
const cleanRequirementText = (text) => {
    if (!text) return '';

    return text
        .toLowerCase()
        // 1. Eliminar marcas registradas
        .replace(/[®™©]/g, '')
        // 2. Eliminar todo el contenido que esté entre paréntesis (ideal para borrar "SSE 4.2 support" etc)
        .replace(/\([^)]*\)/g, '')
        // 3. Eliminar palabras conectoras engañosas como " or " (con espacios alrededor)
        .replace(/\s+or\s+/g, ' ')
        // 4. Limpiar excesos de espacios en blanco dejados por las reglas anteriores
        .replace(/\s+/g, ' ')
        .trim();
};

// ==============================================================================
// PASO 3: EL CAZADOR DE MÚLTIPLES COINCIDENCIAS (Pipeline Principal)
// ==============================================================================
/**
 * Analiza un requerimiento sucio y retorna el Benchmark Score más bajo encontrado.
 * @param {string} rawText - Requerimiento mínimo crudo de Steam (ej. "Intel Core i7 860, or FX-4100")
 * @param {Array} masterList - Array dict. en memoria de CSVs [{ Model: 'FX-4100', Benchmark: 30 }, ...]
 * @param {string} type - Tipo (ej. 'cpus' o 'gpus') por si se requieren lógicas bifurcadas a futuro.
 * @returns {number} Score mínimo o 0
 */
const parseRequirementScore = (rawText, masterList, type) => {
    // 1. Fase de Limpieza
    const cleanText = cleanRequirementText(rawText);
    const foundScores = [];

    // 2. Iteración Exhaustiva: Busca quién de la lista maestra convive dentro del string
    for (const item of masterList) {
        const modelName = (item.Model || '').toLowerCase();
        
        if (modelName && cleanText.includes(modelName)) {
            const score = parseFloat(item.Benchmark);
            if (!isNaN(score)) {
                foundScores.push(score);
            }
        }
    }

    // 3. Múltiples hallazgos: Priorizar el hardware de piso (el Score menor es el "Requisito Mínimo Real")
    if (foundScores.length > 0) {
        return Math.min(...foundScores);
    }

    // 4. Búsqueda Vaga en Diccionario de Respaldo
    for (const [keyword, fallbackScore] of Object.entries(FALLBACK_DICTIONARY)) {
        if (cleanText.includes(keyword)) {
            return fallbackScore;
        }
    }

    // 5. Último Recurso: Frase indescifrable
    return 0;
};

module.exports = {
    cleanRequirementText,
    parseRequirementScore
};


/*
// ==============================================================================
// SIMULACIÓN DE PRUEBA (Test Block)
// Ejecutar con: node requirementParser.js
// ==============================================================================

// Lista maestra falsa con valores arbitrarios de benchmark
const mockMasterList = [
    { Model: "Core i7 860", Benchmark: 40 },
    { Model: "Core i5 750", Benchmark: 35 },
    { Model: "FX-4100", Benchmark: 30 }, // Este es el eslabón más débil, el requisito mínimo real.
    { Model: "Core i9", Benchmark: 100 }
];

const testText = "Intel Core i7 860, Intel Core i5 750, or AMD FX-4100 (SSE 4.2 support)";

console.log("------------------------------------------");
console.log("📜 REQUERIMIENTO ORIGINAL:");
console.log(testText);
console.log("------------------------------------------");
console.log("🧽 TEXTO LIMPIO:");
console.log(cleanRequirementText(testText));
console.log("------------------------------------------");

const minScore = parseRequirementScore(testText, mockMasterList, 'cpus');

console.log(`🎯 SCORE OBTENIDO (El menor hallado): ${minScore}`); 
// Resultado Esperado: 30 (Al encontrar la colisión múltiple, toma intel i7, intel i5 y amd fx, quedándose con el amd fx de 30)

// */
