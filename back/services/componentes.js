const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs/promises');

puppeteer.use(StealthPlugin());

const COMPONENTES = {
  cpus: 'https://pc-builder.io/cpu',
  gpus: 'https://pc-builder.io/gpu'
};

async function scrapeComponentes() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1366, height: 768 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
  const resultados = {};
  
  for (const [tipo, url] of Object.entries(COMPONENTES)) {
    try {
      console.log(`Scrapeando ${tipo}...`);
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 60000 
      });
      
      // Esperar a que cargue el contenido principal
      await page.waitForSelector('td.product', { timeout: 30000 });
      
      const datos = await page.evaluate((tipoActual) => {
        const componentes = [];
        const productos = document.querySelectorAll('td.product');
        
        productos.forEach(producto => {
          const linkElement = producto.querySelector('a[href^="https://pc-builder.io"]');
          const nombre = linkElement?.textContent?.trim();
          const url = linkElement?.href;
          
          const imagenElement = producto.querySelector('img.product-image');
          const imagen = imagenElement?.src;
          const altText = imagenElement?.alt;
          
          const ratingElement = producto.querySelector('.rating span');
          const rating = ratingElement?.textContent?.trim();
          
          const precioElement = producto.querySelector('.price');
          const precio = precioElement?.textContent?.trim();
          
          const especificaciones = {};
          const specElements = producto.querySelectorAll('.spec-content .col-6');
          specElements.forEach(spec => {
            const label = spec.querySelector('.spec-label')?.textContent?.trim();
            const value = spec.querySelector('.spec-value')?.textContent?.trim();
            if (label && value) {
              especificaciones[label] = value;
            }
          });
          
          if (nombre) {
            componentes.push({
              tipo: tipoActual,
              nombre,
              url,
              imagen,
              alt_text: altText,
              rating,
              precio,
              especificaciones
            });
          }
        });
        
        return componentes;
      }, tipo);
      
      resultados[tipo] = datos;
      console.log(`✅ ${datos.length} ${tipo} encontrados`);
    } catch (error) {
      console.error(`❌ Error con ${tipo}:`, error.message);
      resultados[tipo] = [];
    }
  }
  
  await browser.close();
  return resultados;
}

// Ejecutar y guardar resultados
scrapeComponentes()
  .then(data => fs.writeFile('pc-builder-components-detailed.json', JSON.stringify(data, null, 2)))
  .then(() => console.log('📁 Datos guardados en pc-builder-components-detailed.json'))
  .catch(err => console.error('Error:', err));