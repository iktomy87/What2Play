// routes/scraperRoutes.js
const express = require('express');
const router = express.Router();
const { scrapeCPUs } = require('../services/componentes');
const { getCPUs } = require('../controllers/componentController');


router.get('/scrapear-cpus', async (req, res) => {
  try {
    await scrapeCPUs();
    res.json({ status: 'ok', message: 'Scraping completado y datos guardados.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
