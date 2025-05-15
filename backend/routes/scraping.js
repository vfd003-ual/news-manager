const express = require('express');
const router = express.Router();
const scrapingController = require('../controllers/scraping.controller');

router.get('/local', scrapingController.getLocalNews);

module.exports = router;