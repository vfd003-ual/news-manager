const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/preferences', require('./routes/preferences'));
app.use('/api/news', require('./routes/newsProxy'));
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Servidor iniciado en puerto ${PORT}`));
