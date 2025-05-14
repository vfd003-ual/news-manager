const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');
require('dotenv').config();

// Ruta POST /api/auth/register - Registro de usuario
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    // Crear nuevo usuario
    user = new User({
      name,
      email,
      password,
      preferences: {
        categories: [],
        sources: [],
        savedNews: []
      }
    });

    await user.save();

    // Generar JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// Ruta POST /api/auth/login - Inicio de sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario existe
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Generar JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// Ruta GET /api/auth/user - Obtiene datos del usuario activo
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// Ruta PUT /api/auth/user - Actualiza datos del usuario
router.put('/user', auth, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Verificar si el email ya existe en otro usuario
    if (email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ msg: 'El email ya está en uso' });
      }
    }

    // Si se proporciona una nueva contraseña, verificar la actual
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ msg: 'Se requiere la contraseña actual' });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ msg: 'La contraseña actual es incorrecta' });
      }

      user.password = newPassword;
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();
    
    // Excluir la contraseña de la respuesta
    const updatedUser = await User.findById(user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

module.exports = router;