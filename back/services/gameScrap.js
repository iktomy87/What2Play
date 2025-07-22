const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

// --- Configuración ---
const OUTPUT_FILE = 'steam_games_requisitos.json';
const SEARCH_URL = 'https://store.steampowered.com/search/?sort_by=Relevance_DESC';
const MAX_PAGES = 1; // Define cuántas páginas de resultados quieres procesar
const DELAY = 3000; // 2 segundos de espera entre cada juego

/**
 * Función principal que inicia el scraping.
 */
async function scrapeSteamGames() {
  const browser = await puppeteer.launch({
    headless: false, // Ponlo en true para que el navegador no sea visible
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

  const gamesData = [];
  
  try {
    console.log('Navegando a la página de búsqueda de Steam...');
    await page.goto(SEARCH_URL, { waitUntil: 'networkidle2', timeout: 60000 });

    await page.waitForSelector('#search_resultsRows', { timeout: 15000 });

    for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
      console.log(`\n--- Procesando página ${pageNum} ---`);
      
      // Extrae solo el título y la URL de la página de resultados
      const gameLinks = await page.$$eval('#search_resultsRows a', links => 
        links.map(link => ({
            title: link.querySelector('.title')?.textContent?.trim() || 'Título no encontrado',
            url: link.href,
        })).filter(game => game.url) // Filtra resultados sin URL
      );

      console.log(`Juegos encontrados: ${gameLinks.length}`);

      for (const [index, game] of gameLinks.entries()) {
        try {
          console.log(`[${index + 1}/${gameLinks.length}] Procesando: ${game.title}`);
          const gameDetails = await scrapeGamePage(browser, game.url);
          
          if (gameDetails) {
            gamesData.push({
              nombre: game.title,
              ...gameDetails
            });
            console.log(`✅ Datos guardados para: ${game.title}`);
          }
          
          // Espera para no sobrecargar el servidor de Steam
          await new Promise(resolve => setTimeout(resolve, DELAY));

        } catch (error) {
          console.error(`❌ Error con ${game.title}:`, error.message);
        }
      }

      // Navega a la siguiente página si existe
      if (pageNum < MAX_PAGES) {
          const nextPageBtn = await page.$('#search_results_btn_next:not([disabled])');
          if (nextPageBtn) {
              console.log('Navegando a la página siguiente...');
              await Promise.all([
                nextPageBtn.click(),
                page.waitForNavigation({ waitUntil: 'networkidle2' })
              ]);
          } else {
              console.log('No hay más páginas disponibles.');
              break;
          }
      }
    }
  } catch (error) {
    console.error('Ha ocurrido un error general en el scraping:', error);
  } finally {
    await browser.close();
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(gamesData, null, 2));
    console.log(`\n--- Scraping completado ---`);
    console.log(`Total de juegos guardados: ${gamesData.length} en el archivo ${OUTPUT_FILE}`);
  }
}

/**
 * Extrae los géneros y requisitos de la página de un juego específico.
 * @param {object} browser - La instancia del navegador Puppeteer.
 * @param {string} url - La URL de la página del juego.
 * @returns {object|null} Un objeto con los datos o null si hay un error.
 */
async function scrapeGamePage(browser, url) {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });

    // Maneja la verificación de edad si aparece
    const ageGate = await page.$('#ageYear');
    if (ageGate) {
      await page.select('#ageYear', '1990');
      await page.click('#view_product_page_btn');
      await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    }

    // Extrae solo los datos requeridos
    return await page.evaluate(() => {
      
      // Función para obtener los requisitos del sistema
      const getMinimumRequirements = () => {
          const reqs = {};
          // Selector robusto para encontrar el bloque de requisitos mínimos
          const requirementsBlock = document.querySelector('.game_area_sys_req.sysreq_content[data-os="win"] ul, .sysreq_content ul.bb_ul');
          if (!requirementsBlock) return 'No disponibles';

          requirementsBlock.querySelectorAll('li').forEach(item => {
              const strongText = item.querySelector('strong')?.textContent.trim();
              if (strongText) {
                  const itemClone = item.cloneNode(true);
                  itemClone.querySelector('strong').remove();
                  const valueText = itemClone.textContent.trim();
                  reqs[strongText.replace(':', '')] = valueText;
              }
          });
          return Object.keys(reqs).length > 0 ? reqs : 'No disponibles';
      };

      return {
        generos: Array.from(document.querySelectorAll('.glance_tags.popular_tags a')).map(a => a.textContent.trim()),
        requisitos_minimos: getMinimumRequirements()
      };
    });
  } catch (error) {
    console.error(`Error al procesar la URL ${url}:`, error.message);
    return null; // Devuelve null si la página de un juego falla
  } finally {
    await page.close();
  }
}

// --- Inicia el script ---
scrapeSteamGames();