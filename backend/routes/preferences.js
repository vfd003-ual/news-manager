const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Ruta PUT /api/preferences/saved-news - Guardar/eliminar noticias
router.put('/saved-news', auth, async (req, res) => {
  try {
    console.log('PUT /saved-news - Request received:', {
      userId: req.user.id,
      action: req.body.save ? 'save' : 'remove',
      newsUrl: req.body.news.url
    });

    const user = await User.findById(req.user.id);
    const { news, save } = req.body;
    
    if (save) {
      const newsExists = user.preferences.savedNews.some(n => n.url === news.url);
      console.log('Checking if news exists:', { exists: newsExists, url: news.url });
      
      if (!newsExists) {
        user.preferences.savedNews.push({
          url: news.url,
          title: news.title,
          description: news.description,
          publishedAt: news.publishedAt,
          source: news.source,
          urlToImage: news.urlToImage
        });
        console.log('News added to saved list');
      }
    } else {
      const beforeLength = user.preferences.savedNews.length;
      user.preferences.savedNews = user.preferences.savedNews.filter(
        n => n.url !== news.url
      );
      console.log('News removed from saved list:', {
        removedCount: beforeLength - user.preferences.savedNews.length
      });
    }
    
    await user.save();
    console.log('User preferences saved successfully. Total saved news:', user.preferences.savedNews.length);
    res.json(user.preferences.savedNews);
  } catch (err) {
    console.error('Error in PUT /saved-news:', err.message);
    res.status(500).send('Error del servidor');
  }
});

// Obtener noticias guardadas
router.get('/saved-news', auth, async (req, res) => {
  try {
    console.log('GET /saved-news - Request received for user:', req.user.id);
    const user = await User.findById(req.user.id);
    console.log('Found user saved news count:', user.preferences.savedNews.length);
    res.json(user.preferences.savedNews);
  } catch (err) {
    console.error('Error in GET /saved-news:', err.message);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;