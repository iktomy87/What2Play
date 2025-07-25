const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const componentsData = require('./pc-builder-components-detailed.json');
const connectDB = require('../config/db.js');
const { Cpu, Gpu } = require('../models/Components.js');


const Cpu = mongoose.model('Cpu', cpuSchema);
const Gpu = mongoose.model('Gpu', gpuSchema);

// 5. Función asíncrona para conectar, limpiar y subir los datos
const uploadDataToDB = async () => {
  try {
    // Conectar a la base de datos
    
    await connectDB();

    // Limpiar las colecciones para evitar duplicados si el script se ejecuta de nuevo
    console.log('🧹 Limpiando colecciones existentes...');
    await Cpu.deleteMany({});
    await Gpu.deleteMany({});
    console.log('🗑️ Colecciones limpiadas.');

    // Validar que los datos del JSON existen
    const { cpus, gpus } = componentsData;
    if (!cpus || !gpus) {
      throw new Error('El archivo JSON no contiene las claves "cpus" o "gpus".');
    }

    // Insertar los datos en sus respectivas colecciones
    console.log('⏳ Subiendo datos a las colecciones...');
    const cpusResult = await Cpu.insertMany(cpus);
    const gpusResult = await Gpu.insertMany(gpus);

    console.log('🎉 ¡Datos subidos con éxito!');
    console.log(`   - Documentos agregados a la colección 'cpus': ${cpusResult.length}`);
    console.log(`   - Documentos agregados a la colección 'gpus': ${gpusResult.length}`);

  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
  } finally {
    // Cerrar la conexión con la base de datos al finalizar
    await mongoose.disconnect();
    console.log('🔌 Conexión a MongoDB cerrada.');
  }
};

// 6. Ejecutar la función
uploadDataToDB();