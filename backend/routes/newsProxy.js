const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); 

router.get('/', authMiddleware, async (req, res) => {
  const { category, query } = req.query;
  const cacheKey = `news_${category || ''}_${query || ''}`;

  console.log('[NEWS] Petición recibida con query:', req.query);

  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('[NEWS] Devolviendo desde cache');
    return res.json(cached);
  }

  try {
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'us',
        category,
        q: query,
        apiKey: process.env.NEWS_API_KEY,
      },
    });

    cache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('[NEWS] Error al obtener noticias:', error.message);
    if (error.response) {
      console.error('[NEWS] Detalles del error:', error.response.data);
    }
    res.status(500).json({ error: 'Error al obtener noticias' });
  }
});

module.exports = router;
