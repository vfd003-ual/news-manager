const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Ruta GET /api/preferences - Obtener preferencias del usuario
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('preferences');
    res.json(user.preferences);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// Ruta PUT /api/preferences/categories - Actualizar categorías
router.put('/categories', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.preferences.categories = req.body.categories;
    await user.save();
    res.json(user.preferences);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// Ruta PUT /api/preferences/sources - Actualizar fuentes
router.put('/sources', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.preferences.sources = req.body.sources;
    await user.save();
    res.json(user.preferences);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// Ruta PUT /api/preferences/saved-news - Guardar/eliminar noticias
router.put('/saved-news', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const { newsId, save } = req.body;
    
    if (save) {
      // Añadir noticia si no existe
      if (!user.preferences.savedNews.includes(newsId)) {
        user.preferences.savedNews.push(newsId);
      }
    } else {
      // Eliminar noticia
      user.preferences.savedNews = user.preferences.savedNews.filter(
        id => id !== newsId
      );
    }
    
    await user.save();
    res.json(user.preferences.savedNews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;