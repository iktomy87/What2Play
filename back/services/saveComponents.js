const fs = require('fs/promises');
const { getCPUs } = require('./componentes'); // asegúrate que el path sea correcto

async function main() {
  try {
    const cpus = await getCPUs();
    await fs.writeFile('cpus.json', JSON.stringify(cpus, null, 2), 'utf8');
    console.log('Datos guardados en cpus.json');
  } catch (e) {
    console.error('Error en main():', e.message);
  }
}

main();
