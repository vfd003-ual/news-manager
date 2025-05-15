const express = require('express');
const router = express.Router();
const scrapingController = require('../controllers/scraping.controller');
// const auth = require('../middleware/auth'); // Comentamos la importación

// Quitamos el middleware auth de la ruta
router.get('/local', scrapingController.getLocalNews);

module.exports = router;